import type { Ad } from '../types';

const MOCK_ADS: Ad[] = [
    {
        id: 'ad1',
        title: 'Welcome Bonus',
        imageUrl: 'https://via.placeholder.com/300x200',
        redirectUrl: 'https://example.com/bonus',
        placement: 'HomeBanner',
        type: 'ImageOnly',
        isActive: true,
        createdAt: '2023-11-01T00:00:00Z',
    },
    {
        id: 'ad2',
        title: 'Refer a Friend',
        imageUrl: 'https://via.placeholder.com/300x200',
        redirectUrl: 'https://example.com/refer',
        placement: 'DashboardCard',
        type: 'TextOnly',
        isActive: true,
        createdAt: '2023-11-15T00:00:00Z',
    },
];

export const adsService = {
    getAds: async (): Promise<Ad[]> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...MOCK_ADS]), 500);
        });
    },

    createAd: async (ad: Omit<Ad, 'id'>): Promise<Ad> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newAd: Ad = { ...ad, id: `ad${MOCK_ADS.length + 1}` };
                MOCK_ADS.push(newAd);
                resolve(newAd);
            }, 600);
        });
    },

    updateAd: async (id: string, updates: Partial<Ad>): Promise<void> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const index = MOCK_ADS.findIndex((a) => a.id === id);
                if (index !== -1) {
                    MOCK_ADS[index] = { ...MOCK_ADS[index], ...updates };
                }
                resolve();
            }, 500);
        });
    },

    deleteAd: async (id: string): Promise<void> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const index = MOCK_ADS.findIndex((a) => a.id === id);
                if (index !== -1) {
                    MOCK_ADS.splice(index, 1);
                }
                resolve();
            }, 400);
        });
    },
};
