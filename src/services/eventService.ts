import type { Event } from '../types';

const MOCK_EVENTS: Event[] = [
    {
        id: 'evt1',
        name: 'Q4 2023 Investment Drive',
        organizerUserId: 'u100',
        startDate: '2023-10-01T00:00:00Z',
        endDate: '2023-12-31T23:59:59Z',
        status: 'Ongoing',
        totalCollectedAmount: 150000,
        tPlusXDays: 7,
        defaultAllocationType: 'Top 50 Companies',
        allowedWithdrawPercentage: 50,
        autoAllocationScheduledDate: '2024-01-07T00:00:00Z',
    },
    {
        id: 'evt2',
        name: 'New Year Gold Rush',
        organizerUserId: 'u101',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
        status: 'Upcoming',
        totalCollectedAmount: 0,
        tPlusXDays: 5,
        defaultAllocationType: 'Digital Gold',
        allowedWithdrawPercentage: 100,
        autoAllocationScheduledDate: '2024-02-05T00:00:00Z',
    },
];

export const eventService = {
    getEvents: async (): Promise<Event[]> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...MOCK_EVENTS]), 500);
        });
    },

    getEventById: async (id: string): Promise<Event | undefined> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_EVENTS.find((e) => e.id === id)), 300);
        });
    },

    updateEventRules: async (id: string, rules: { tPlusXDays?: number; allowedWithdrawPercentage?: number }): Promise<void> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const event = MOCK_EVENTS.find((e) => e.id === id);
                if (event) {
                    if (rules.tPlusXDays !== undefined) event.tPlusXDays = rules.tPlusXDays;
                    if (rules.allowedWithdrawPercentage !== undefined) event.allowedWithdrawPercentage = rules.allowedWithdrawPercentage;
                }
                resolve();
            }, 400);
        });
    },
};
