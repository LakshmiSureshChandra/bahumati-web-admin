import type { Event, HistoryTransaction, HistoryWithdrawal } from '../types';
import { authService } from './authService';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
    const token = authService.getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

export const eventService = {
    getEvents: async (): Promise<Event[]> => {
        try {
            const response = await fetch(`${API_URL}/events`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) throw new Error('Failed to fetch events');

            const data = await response.json();
            if (!data.success) throw new Error(data.message || 'Failed to fetch events');

            const events = data.data.events || [];
            return events.map((e: any) => ({
                id: e._id,
                name: e.title,
                creator: {
                    id: e.creatorId?._id || 'unknown',
                    name: e.creatorId?.fullName || 'Unknown',
                    image: e.creatorId?.image
                },
                description: e.description,
                image: e.image,
                startDate: e.eventStartDate,
                endDate: e.eventEndDate,
                status: e.status.charAt(0).toUpperCase() + e.status.slice(1),
                totalCollectedAmount: e.totalGiftsAmount || 0,
                totalWithdrawnAmount: e.totalWithdrawn || 0, // Assuming API returns this or we default to 0
                tPlusXDays: 0,
                defaultAllocationType: 'Top 50 Companies',
                allowedWithdrawPercentage: e.withdrawalPercentage,
                autoAllocationScheduledDate: e.eventEndDate,
            }));
        } catch (error) {
            console.error('Error fetching events:', error);
            return [];
        }
    },

    getEventById: async (id: string): Promise<{ event: Event; transactions: HistoryTransaction[]; withdrawals: HistoryWithdrawal[] } | undefined> => {
        try {
            const response = await fetch(`${API_URL}/events/${id}`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) throw new Error('Failed to fetch event');

            const data = await response.json();
            if (!data.success) throw new Error(data.message || 'Failed to fetch event');

            const { event: e, stats, gifts, withdrawals } = data.data;

            const eventObj: Event = {
                id: e._id,
                name: e.title,
                creator: {
                    id: e.creatorId?._id || 'unknown',
                    name: e.creatorId?.fullName || 'Unknown',
                    image: e.creatorId?.image
                },
                description: e.description,
                image: e.image,
                startDate: e.eventStartDate,
                endDate: e.eventEndDate,
                status: e.status.charAt(0).toUpperCase() + e.status.slice(1),
                totalCollectedAmount: stats?.totalAmount || 0,
                totalWithdrawnAmount: stats?.totalWithdrawn || 0,
                tPlusXDays: 0,
                defaultAllocationType: 'Top 50 Companies',
                allowedWithdrawPercentage: e.withdrawalPercentage,
                autoAllocationScheduledDate: e.eventEndDate,
            };

            const transactions: HistoryTransaction[] = (gifts || []).map((g: any) => ({
                type: 'gift_received',
                transactionId: g.transactionId,
                amount: g.amount,
                giftType: g.giftType,
                giftName: g.giftName,
                quantity: g.quantity,
                status: g.status,
                isAllotted: g.isAllotted,
                sender: g.sender ? {
                    id: g.sender.id,
                    name: g.sender.name,
                    image: g.sender.image,
                    number: g.sender.number
                } : undefined,
                receiver: g.receiver ? {
                    id: g.receiver.id,
                    name: g.receiver.name,
                    image: g.receiver.image,
                    number: g.receiver.number
                } : undefined,
                createdAt: g.createdAt,
                isSelfGift: g.isSelfGift
            }));

            const withdrawalList: HistoryWithdrawal[] = (withdrawals?.list || []).map((w: any) => ({
                _id: w.id,
                eventId: {
                    _id: e._id,
                    title: e.title,
                    eventLink: e.eventLink,
                    eventStartDate: e.eventStartDate,
                    eventEndDate: e.eventEndDate
                },
                userId: w.user?.id || '',
                amount: w.amount,
                percentage: w.percentage,
                totalGiftsAmount: w.totalGiftsAmount,
                status: w.status,
                moneyState: w.moneyState,
                approvedBy: w.approvedBy ? { _id: w.approvedBy.id, fullName: w.approvedBy.name } : null,
                approvedAt: w.approvedAt,
                createdAt: w.createdAt,
                updatedAt: w.createdAt // Fallback
            }));

            return { event: eventObj, transactions, withdrawals: withdrawalList };
        } catch (error) {
            console.error('Error fetching event:', error);
            return undefined;
        }
    },

    updateEventRules: async (id: string, rules: { tPlusXDays?: number; allowedWithdrawPercentage?: number }): Promise<void> => {
        try {
            const response = await fetch(`${API_URL}/events/${id}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    withdrawalPercentage: rules.allowedWithdrawPercentage
                }),
            });

            if (!response.ok) throw new Error('Failed to update event');
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    },

    deleteEvent: async (id: string): Promise<void> => {
        try {
            const response = await fetch(`${API_URL}/events/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            if (!response.ok) throw new Error('Failed to delete event');
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    }
};
