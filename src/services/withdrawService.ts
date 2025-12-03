import { authService } from './authService';
import type { WithdrawRequest } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Helper to get headers with token
const getAuthHeaders = () => {
    const token = authService.getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
};

export const withdrawService = {
    getWithdrawRequests: async (status?: 'pending' | 'approved' | 'rejected'): Promise<WithdrawRequest[]> => {
        try {
            const url = status
                ? `${API_URL}/withdrawals/all?status=${status}`
                : `${API_URL}/withdrawals/all`;

            const response = await fetch(url, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) throw new Error('Failed to fetch withdrawal requests');

            const data = await response.json();
            if (!data.success) throw new Error(data.message || 'Failed to fetch withdrawal requests');

            return (data.data || []).map((req: any) => ({
                id: req._id,
                userId: req.user?.id || req.user?._id || 'unknown',
                eventId: req.eventId,
                requestedAmount: req.amount,
                allowedMaxAmount: req.totalGiftsAmount || 0, // Assuming this maps to max allowed or similar logic
                status: req.status.charAt(0).toUpperCase() + req.status.slice(1),
                requestDate: req.createdAt,
                processedBy: req.approvedBy?.name || req.rejectedBy?.name,
                processedDate: req.approvedAt || req.rejectedAt,
                transactionId: req.transactionId, // If available in API response
                transactionProofImageUrl: req.proofUrl, // If available
                notes: req.rejectionReason,
            }));
        } catch (error) {
            console.error('Error fetching withdrawal requests:', error);
            return [];
        }
    },

    getWithdrawRequestsByEvent: async (eventId: string): Promise<WithdrawRequest[]> => {
        try {
            const response = await fetch(`${API_URL}/withdrawals/event/${eventId}`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) throw new Error('Failed to fetch event withdrawal requests');

            const data = await response.json();
            if (!data.success) throw new Error(data.message || 'Failed to fetch event withdrawal requests');

            return (data.data || []).map((req: any) => ({
                id: req._id,
                userId: req.user?.id || req.user?._id || 'unknown',
                eventId: req.eventId,
                requestedAmount: req.amount,
                allowedMaxAmount: req.totalGiftsAmount || 0,
                status: req.status.charAt(0).toUpperCase() + req.status.slice(1),
                requestDate: req.createdAt,
                processedBy: req.approvedBy?.name || req.rejectedBy?.name,
                processedDate: req.approvedAt || req.rejectedAt,
                transactionId: req.transactionId,
                transactionProofImageUrl: req.proofUrl,
                notes: req.rejectionReason,
            }));
        } catch (error) {
            console.error('Error fetching event withdrawal requests:', error);
            return [];
        }
    },

    getWithdrawRequestById: async (id: string): Promise<WithdrawRequest | undefined> => {
        // Since there isn't a direct "get by id" endpoint documented, we might need to fetch all and find, 
        // or assume the detail page passes the full object. 
        // However, usually detail pages fetch by ID. 
        // Let's try to fetch all and find for now, or use the "all" endpoint if it supports ID filtering?
        // Given the instructions, I'll fetch all and filter client-side as a fallback, 
        // or better, if the user is coming from the list, we might already have data.
        // But for direct link access, we need to fetch.
        // Let's assume fetching all is okay for now or try to implement a find.
        try {
            const allRequests = await withdrawService.getWithdrawRequests();
            return allRequests.find(r => r.id === id);
        } catch (error) {
            console.error('Error fetching withdrawal request details:', error);
            return undefined;
        }
    },

    approveWithdrawRequest: async (id: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/withdrawals/${id}/approve`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to approve request');
            }

            return true;
        } catch (error) {
            console.error('Error approving withdrawal request:', error);
            throw error;
        }
    },

    rejectWithdrawRequest: async (id: string, reason: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/withdrawals/${id}/reject`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({ rejectionReason: reason }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to reject request');
            }

            return true;
        } catch (error) {
            console.error('Error rejecting withdrawal request:', error);
            throw error;
        }
    },

    // Legacy method signature support if needed, but we should update usage
    updateWithdrawRequestStatus: async (
        id: string,
        status: 'Completed' | 'Rejected',
        data?: { transactionId?: string; proofUrl?: string; notes?: string }
    ): Promise<void> => {
        if (status === 'Completed') {
            await withdrawService.approveWithdrawRequest(id);
        } else {
            await withdrawService.rejectWithdrawRequest(id, data?.notes || 'No reason provided');
        }
    },
};
