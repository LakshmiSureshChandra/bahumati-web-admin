import type { AppConfig } from '../types';

let MOCK_CONFIG: AppConfig = {
    maintenanceMode: false,
    minAppVersionIos: '1.0.0',
    minAppVersionAndroid: '1.0.0',
    supportEmail: 'support@finvest.com',
    supportPhone: '+1-800-123-4567',
    maxDailyWithdrawalLimit: 5000,
    kycAutoApprovalEnabled: false,
};

export const configService = {
    getConfig: async (): Promise<AppConfig> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve({ ...MOCK_CONFIG }), 300);
        });
    },

    updateConfig: async (newConfig: Partial<AppConfig>): Promise<AppConfig> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                MOCK_CONFIG = { ...MOCK_CONFIG, ...newConfig };
                resolve({ ...MOCK_CONFIG });
            }, 500);
        });
    },
};
