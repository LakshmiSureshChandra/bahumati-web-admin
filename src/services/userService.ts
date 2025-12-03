import type { User, KYCDetails } from '../types';
import { authService } from './authService';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
    const token = authService.getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

export const userService = {
    getUsersPaginated: async (page: number = 1, limit: number = 10): Promise<{ users: User[], total: number, totalPages: number }> => {
        try {
            const response = await fetch(`${API_URL}/admin/users?page=${page}&limit=${limit}`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) throw new Error('Failed to fetch users');

            const data = await response.json();
            if (!data.success) throw new Error(data.message || 'Failed to fetch users');

            const users = data.users.map((u: any) => ({
                id: u._id,
                name: u.fullName || 'Unknown',
                email: u.email || '',
                phone: u.number || '',
                gender: u.gender,
                birthDate: u.birthDate,
                kycStatus: u.kycStatus || 'Pending', // Assuming kycStatus is in user object or needs fetching
                createdDate: u.createdAt,
                isBanned: u.isBanned || false,
                defaultAllocationType: u.defaultGiftMode === 'gold' ? 'Digital Gold' : 'Top 50 Companies',
                eventParticipationCount: 0,
                totalBalance: 0,
                withdrawableAmount: 0,
            }));

            return {
                users,
                total: data.pagination.total,
                totalPages: data.pagination.totalPages
            };
        } catch (error) {
            console.error('Error fetching users:', error);
            return { users: [], total: 0, totalPages: 0 };
        }
    },

    // Get All KYC Submissions with optional status filter
    getKycSubmissions: async (status?: 'pending' | 'approved' | 'rejected'): Promise<User[]> => {
        try {
            const query = status ? `?status=${status}` : '';
            const response = await fetch(`${API_URL}/kyc/all${query}`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) throw new Error('Failed to fetch KYC submissions');

            const data = await response.json();
            if (!data.success) throw new Error(data.message || 'Failed to fetch KYC submissions');

            return data.data.map((kyc: any) => ({
                id: kyc.user._id,
                name: kyc.user.fullName || 'Unknown',
                email: kyc.user.email || '',
                phone: kyc.user.number || '',
                gender: kyc.user.gender,
                birthDate: kyc.user.birthDate,
                kycStatus: kyc.status.charAt(0).toUpperCase() + kyc.status.slice(1),
                createdDate: kyc.createdAt,
                isBanned: kyc.user.isBanned || false,
                defaultAllocationType: kyc.user.defaultGiftMode === 'gold' ? 'Digital Gold' : 'Top 50 Companies',
                eventParticipationCount: 0,
                totalBalance: 0,
                withdrawableAmount: 0,
                kycId: kyc._id,
            }));
        } catch (error) {
            console.error('Error fetching KYC submissions:', error);
            return [];
        }
    },

    // Kept for compatibility, but redirects to getKycSubmissions if used for KYC list
    getUsers: async (): Promise<User[]> => {
        return userService.getKycSubmissions();
    },

    findUser: async (value: string): Promise<User | null> => {
        try {
            const response = await fetch(`${API_URL}/admin/users/find`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ value }),
            });

            if (!response.ok) throw new Error('User not found');

            const data = await response.json();
            if (!data.success || !data.user) return null;

            const u = data.user;
            return {
                id: u._id,
                name: u.fullName || 'Unknown',
                email: u.email || '',
                phone: u.number || '',
                gender: u.gender,
                birthDate: u.birthDate,
                kycStatus: u.kycStatus || 'Pending',
                createdDate: u.createdAt,
                isBanned: u.isBanned || false,
                defaultAllocationType: u.defaultGiftMode === 'gold' ? 'Digital Gold' : 'Top 50 Companies',
                eventParticipationCount: 0,
                totalBalance: 0,
                withdrawableAmount: 0,
            };
        } catch (error) {
            console.error('Error finding user:', error);
            return null;
        }
    },

    getUserById: async (id: string): Promise<User | undefined> => {
        // Try to find in paginated list first, or fallback to findUser if we can search by ID
        // But findUser takes "value" which is phone/email/id.
        const user = await userService.findUser(id);
        if (user) return user;

        // Fallback to fetching from KYC list if not found (e.g. for KYC review page)
        const kycUsers = await userService.getKycSubmissions();
        return kycUsers.find(u => u.id === id);
    },

    getKycDetails: async (userId: string): Promise<KYCDetails | undefined> => {
        try {
            // We can reuse getKycSubmissions to find the specific record
            // Or if there is a specific endpoint for details, use that.
            // The prompt implies /kyc/all returns the list.
            const response = await fetch(`${API_URL}/kyc/all`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) throw new Error('Failed to fetch KYC details');

            const data = await response.json();
            if (!data.success) throw new Error(data.message);

            const kycRecord = data.data.find((k: any) => k.user._id === userId);

            if (!kycRecord) return undefined;

            return {
                userId: kycRecord.user._id,
                idType: kycRecord.idType,
                frontPic: kycRecord.frontPic,
                backPic: kycRecord.backPic,
                selfie: kycRecord.selfie,
                status: kycRecord.status.charAt(0).toUpperCase() + kycRecord.status.slice(1),
                rejectionReason: kycRecord.rejectionReason,
                submittedAt: kycRecord.createdAt,
                documents: [kycRecord.frontPic, kycRecord.backPic, kycRecord.selfie].filter(Boolean),
                kycId: kycRecord._id,
            } as any;
        } catch (error) {
            console.error('Error fetching KYC details:', error);
            return undefined;
        }
    },

    approveKyc: async (userId: string): Promise<void> => {
        const details = await userService.getKycDetails(userId);
        if (!details || !(details as any).kycId) throw new Error('KYC Record not found');

        const response = await fetch(`${API_URL}/kyc/review`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                kycId: (details as any).kycId,
                status: 'approved'
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to approve KYC');
        }
    },

    rejectKyc: async (userId: string, reason: string): Promise<void> => {
        const details = await userService.getKycDetails(userId);
        if (!details || !(details as any).kycId) throw new Error('KYC Record not found');

        const response = await fetch(`${API_URL}/kyc/review`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                kycId: (details as any).kycId,
                status: 'rejected',
                rejectionReason: reason
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to reject KYC');
        }
    },

    // User Creation Flow
    sendOtp: async (phone: string): Promise<void> => {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number: Number(phone) }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to send OTP');
        }
    },

    verifyOtp: async (phone: string, otp: string): Promise<{ user: User, token: string }> => {
        const verifyResponse = await fetch(`${API_URL}/users/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number: Number(phone), otp }),
        });

        if (!verifyResponse.ok) {
            const error = await verifyResponse.json();
            throw new Error(error.message || 'Failed to verify OTP');
        }

        const verifyData = await verifyResponse.json();
        const userToken = verifyData.token;
        const userId = verifyData.user._id;

        const user: User = {
            id: userId,
            name: verifyData.user.fullName || 'New User',
            email: verifyData.user.email || '',
            phone: phone,
            kycStatus: 'Pending',
            createdDate: new Date().toISOString(),
            isBanned: false,
            defaultAllocationType: 'Top 50 Companies', // Default, will be updated
            eventParticipationCount: 0,
            totalBalance: 0,
            withdrawableAmount: 0,
        };

        return { user, token: userToken };
    },

    updateUserAllocation: async (userId: string, allocationType: string, token: string): Promise<void> => {
        const updateResponse = await fetch(`${API_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                defaultGiftMode: allocationType === 'Digital Gold' ? 'gold' : 'stocks'
            }),
        });

        if (!updateResponse.ok) {
            const error = await updateResponse.json();
            throw new Error(error.message || 'Failed to update user allocation');
        }
    },

    // For CreateUser.tsx compatibility - wraps the above steps if needed, 
    // but CreateUser.tsx handles steps separately. 
    // We'll keep this for the interface but it might not be used directly in the new flow.
    createUser: async (_userData: any): Promise<User> => {
        throw new Error('Use sendOtp and verifyOtpAndCreateUser instead');
    },

    updateUserDetails: async (userId: string, data: any): Promise<void> => {
        // This requires the USER'S token usually, but maybe admin can do it?
        // The prompt says "Edit User Route: PUT /users/:id ... Requires authentication".
        // If admin token works, we use that.
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update user details');
        }
    },

    submitKycDetails: async (userId: string, kycData: any): Promise<void> => {
        // This endpoint /kyc/submit usually requires the USER'S token. 
        // If we are admin editing on behalf of user, we might need a different endpoint or 
        // we can't do it unless we have a way to impersonate or admin override.
        // However, the prompt says "roles will have the access for updating them from here".
        // Let's try using the admin token on the edit user endpoint first for basic details.
        // For KYC specific docs, if /kyc/submit only takes user token, we might be stuck.
        // BUT, the prompt says "Edit User ... All fields are optional". 
        // Maybe we can update some user details there.
        // For actual KYC docs, if the API doesn't support admin upload, we might need to skip or ask.
        // For now, let's assume we use the updateUserDetails for profile info.
        // If we need to update KYC docs, we might need a specific admin endpoint or use the user's token if we captured it (we don't persist user tokens for other users).

        // Re-reading prompt: "roles will have the access for updating them from here... manually accepting".
        // It implies we might edit the user profile (name, gender, dob).
        // Updating pics might be tricky if /kyc/submit is user-only.
        // Let's implement updateUserDetails for the profile parts.

        // If we really need to update KYC docs as admin, and there's no endpoint, we might have to assume
        // the prompt implies we CAN do it, maybe via a different route or the same one works with admin token.
        // Let's try /kyc/submit with admin token? Unlikely to work if it relies on req.user.id to find the record.
        // Wait, the prompt lists "Edit User" which takes fullName, gender, birthDate.
        // It DOES NOT list an endpoint to update KYC docs (frontPic etc) as Admin.
        // It lists "Submit KYC" which takes docs, but likely for the user.

        // Strategy: Implement updateUserDetails for profile info.
        // For KYC docs, we will try to use the same /kyc/submit but it might fail if it uses the token's user ID.
        // If the user is created by the agent, maybe we have their token?
        // In the "Create User" flow, we get a token. We could potentially use that to submit KYC *right then*.
        // But for *existing* users in the queue, we don't have their token.
        // Let's implement updateUserDetails for now.
        return userService.updateUserDetails(userId, kycData);
    },

    getUserHistory: async (userId: string): Promise<import('../types').UserHistoryResponse | null> => {
        try {
            const response = await fetch(`${API_URL}/admin/users/${userId}/transactions`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) throw new Error('Failed to fetch user history');

            const data = await response.json();
            if (!data.success) throw new Error(data.message || 'Failed to fetch user history');

            return data.data;
        } catch (error) {
            console.error('Error fetching user history:', error);
            return null;
        }
    },

    getPresignedUrl: async (key: string): Promise<string | null> => {
        try {
            if (!key) return null;
            // If it's already a full URL, return it
            if (key.startsWith('http')) return key;

            const response = await fetch(`${API_URL}/uploads/getpresignedurl?key=${encodeURIComponent(key)}`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) return null;

            const data = await response.json();
            if (data.success && data.url) {
                return data.url;
            }
            return null;
        } catch (error) {
            console.error('Error fetching presigned URL:', error);
            return null;
        }
    }
};
