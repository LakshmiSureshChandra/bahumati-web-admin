import type { WithdrawRequest } from '../types';

const MOCK_WITHDRAW_REQUESTS: WithdrawRequest[] = [
    {
        id: 'wr1',
        userId: 'u1',
        requestedAmount: 500,
        allowedMaxAmount: 1000,
        status: 'Pending',
        requestDate: '2023-11-20T09:00:00Z',
    },
    {
        id: 'wr2',
        userId: 'u2',
        eventId: 'evt1',
        requestedAmount: 2000,
        allowedMaxAmount: 2000,
        status: 'Completed',
        requestDate: '2023-11-15T14:00:00Z',
        processedBy: 'agent-2',
        processedDate: '2023-11-16T10:00:00Z',
        transactionId: 'tx2',
        transactionProofImageUrl: 'https://via.placeholder.com/150',
    },
];

export const withdrawService = {
    getWithdrawRequests: async (): Promise<WithdrawRequest[]> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...MOCK_WITHDRAW_REQUESTS]), 500);
        });
    },

    getWithdrawRequestById: async (id: string): Promise<WithdrawRequest | undefined> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_WITHDRAW_REQUESTS.find((wr) => wr.id === id)), 300);
        });
    },

    updateWithdrawRequestStatus: async (
        id: string,
        status: 'Completed' | 'Rejected',
        data?: { transactionId?: string; proofUrl?: string; notes?: string }
    ): Promise<void> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const request = MOCK_WITHDRAW_REQUESTS.find((wr) => wr.id === id);
                if (request) {
                    request.status = status;
                    if (data?.transactionId) request.transactionId = data.transactionId;
                    if (data?.proofUrl) request.transactionProofImageUrl = data.proofUrl;
                    if (data?.notes) request.notes = data.notes;
                    request.processedDate = new Date().toISOString();
                }
                resolve();
            }, 500);
        });
    },
};
