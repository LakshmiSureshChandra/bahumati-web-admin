import type { Agent, Role } from '../types';

export const authService = {
    login: async (username: string, password: string): Promise<Agent> => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();

        if (!data.success || !data.user) {
            throw new Error('Invalid response from server');
        }

        const apiRole = data.user.role;
        let frontendRole: Role;

        switch (apiRole) {
            case 'admin':
                frontendRole = 'SuperAdmin';
                break;
            case 'onboarding_agent':
                frontendRole = 'OnboardingAgent';
                break;
            case 'reconciliation_agent':
                frontendRole = 'ReconciliationAgent';
                break;
            default:
                throw new Error(`Unknown role: ${apiRole}`);
        }

        const agent: Agent = {
            id: data.user._id,
            name: data.user.username || username,
            email: '', // No email available
            role: frontendRole,
            status: 'Active',
            lastActive: new Date().toISOString(),
        };

        localStorage.setItem('currentUser', JSON.stringify(agent));
        localStorage.setItem('token', data.token);

        return agent;
    },

    getCurrentUser: (): Agent | null => {
        const stored = localStorage.getItem('currentUser');
        return stored ? JSON.parse(stored) : null;
    },

    getToken: (): string | null => {
        return localStorage.getItem('token');
    },

    logout: async (): Promise<void> => {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        return Promise.resolve();
    },
};
