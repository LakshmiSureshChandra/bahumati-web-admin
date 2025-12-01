import type { Transaction } from '../types';

const MOCK_TRANSACTIONS: Transaction[] = [
    {
        id: 'tx1',
        userId: 'u2',
        type: 'Deposit',
        amount: 50000,
        currency: 'INR',
        status: 'Completed',
        createdAt: '2023-11-01T10:00:00Z',
        processedAt: '2023-11-01T10:05:00Z',
    },
    {
        id: 'tx2',
        userId: 'u2',
        eventId: 'evt1',
        type: 'Allocation',
        amount: 20000,
        currency: 'INR',
        status: 'Completed',
        createdAt: '2023-11-02T12:00:00Z',
    },
    {
        id: 'tx3',
        userId: 'u1',
        type: 'Withdrawal',
        amount: 5000,
        currency: 'INR',
        status: 'Pending',
        createdAt: '2023-11-20T09:00:00Z',
    },
];

export const transactionService = {
    getTransactions: async (): Promise<Transaction[]> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...MOCK_TRANSACTIONS]), 500);
        });
    },

    getTransactionById: async (id: string): Promise<Transaction | undefined> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_TRANSACTIONS.find((t) => t.id === id)), 300);
        });
    },
};
