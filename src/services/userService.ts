import type { User, KYCDetails } from '../types';

const MOCK_USERS: User[] = [
    {
        id: 'u1',
        name: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        phone: '+91 98765 43210',
        kycStatus: 'Pending',
        createdDate: '2023-10-01T10:00:00Z',
        isBanned: false,
        defaultAllocationType: 'Top 50 Companies',
        eventParticipationCount: 2,
        totalBalance: 50000,
        withdrawableAmount: 10000,
        bankDetails: {
            accountNumber: '1234567890',
            ifscCode: 'HDFC0001234',
            bankName: 'HDFC Bank',
            accountHolderName: 'Aarav Sharma',
        },
        upiId: 'aarav@upi',
    },
    {
        id: 'u2',
        name: 'Diya Patel',
        email: 'diya.patel@example.com',
        phone: '+91 98989 89898',
        kycStatus: 'Approved',
        createdDate: '2023-09-15T14:30:00Z',
        isBanned: false,
        defaultAllocationType: 'Digital Gold',
        eventParticipationCount: 5,
        totalBalance: 120000,
        withdrawableAmount: 50000,
        bankDetails: {
            accountNumber: '9876543210',
            ifscCode: 'SBIN0005678',
            bankName: 'State Bank of India',
            accountHolderName: 'Diya Patel',
        },
    },
    {
        id: 'u3',
        name: 'Vihaan Singh',
        email: 'vihaan.singh@example.com',
        phone: '+91 91234 56789',
        kycStatus: 'Rejected',
        createdDate: '2023-11-05T09:15:00Z',
        isBanned: true,
        defaultAllocationType: 'Top 50 Companies',
        eventParticipationCount: 0,
        totalBalance: 0,
        withdrawableAmount: 0,
    },
];

const MOCK_KYC_DETAILS: Record<string, KYCDetails> = {
    'u1': {
        userId: 'u1',
        governmentIdNumber: 'ABCDE1234F',
        governmentIdType: 'PAN Card',
        addressProof: 'Aadhaar Card - Oct 2023',
        documents: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150'],
        submittedAt: '2023-10-02T11:00:00Z',
    },
};

export const userService = {
    getUsers: async (): Promise<User[]> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...MOCK_USERS]), 600);
        });
    },

    getUserById: async (id: string): Promise<User | undefined> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_USERS.find((u) => u.id === id)), 300);
        });
    },

    getKycDetails: async (userId: string): Promise<KYCDetails | undefined> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_KYC_DETAILS[userId]), 400);
        });
    },

    approveKyc: async (userId: string, notes?: string): Promise<void> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = MOCK_USERS.find((u) => u.id === userId);
                if (user) user.kycStatus = 'Approved';
                console.log(`Approved KYC for ${userId} with notes: ${notes}`);
                resolve();
            }, 500);
        });
    },

    rejectKyc: async (userId: string, reason: string): Promise<void> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = MOCK_USERS.find((u) => u.id === userId);
                if (user) user.kycStatus = 'Rejected';
                console.log(`Rejected KYC for ${userId} because: ${reason}`);
                resolve();
            }, 500);
        });
    },

    createUser: async (userData: Partial<User>): Promise<User> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newUser: User = {
                    id: `u${MOCK_USERS.length + 1}`,
                    name: userData.name || 'Pending KYC',
                    email: userData.email || `user${MOCK_USERS.length + 1}@example.com`,
                    phone: userData.phone || '',
                    kycStatus: 'Pending',
                    createdDate: new Date().toISOString(),
                    isBanned: false,
                    defaultAllocationType: userData.defaultAllocationType || 'Top 50 Companies',
                    eventParticipationCount: 0,
                    totalBalance: 0,
                    withdrawableAmount: 0,
                };
                MOCK_USERS.push(newUser);
                resolve(newUser);
            }, 600);
        });
    },

    toggleBanUser: async (userId: string, isBanned: boolean): Promise<void> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = MOCK_USERS.find((u) => u.id === userId);
                if (user) user.isBanned = isBanned;
                resolve();
            }, 400);
        });
    },
};
