import type { Agent, Role } from '../types';

// Mock current user
const MOCK_AGENTS: Agent[] = [
    {
        id: 'agent-1',
        name: 'Ananya Onboarding',
        email: 'ananya@finvest.com',
        role: 'OnboardingAgent',
        status: 'Active',
        lastActive: new Date().toISOString(),
    },
    {
        id: 'agent-2',
        name: 'Rohan Reconciliation',
        email: 'rohan@finvest.com',
        role: 'ReconciliationAgent',
        status: 'Active',
        lastActive: new Date().toISOString(),
    },
    {
        id: 'admin-1',
        name: 'Super Admin Sanjay',
        email: 'sanjay@finvest.com',
        role: 'SuperAdmin',
        status: 'Active',
        lastActive: new Date().toISOString(),
    },
];

export const authService = {
    login: async (role: Role): Promise<Agent> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const agent = MOCK_AGENTS.find((a) => a.role === role) || MOCK_AGENTS[0];
                localStorage.setItem('currentUser', JSON.stringify(agent));
                resolve(agent);
            }, 500);
        });
    },

    getCurrentUser: (): Agent | null => {
        const stored = localStorage.getItem('currentUser');
        return stored ? JSON.parse(stored) : null;
    },

    logout: async (): Promise<void> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                localStorage.removeItem('currentUser');
                resolve();
            }, 300);
        });
    },
};
