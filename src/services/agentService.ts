import { authService } from './authService';
import type { Agent } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Helper to get headers with token
const getAuthHeaders = () => {
    const token = authService.getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
};

export const agentService = {
    getAllAgents: async (): Promise<Agent[]> => {
        try {
            const response = await fetch(`${API_URL}/admin/agents`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) throw new Error('Failed to fetch agents');

            const data = await response.json();
            console.log('Agents API Response:', data); // Debugging
            if (!data.success) throw new Error(data.message || 'Failed to fetch agents');

            const agentsList = Array.isArray(data.data)
                ? data.data
                : (data.data?.agents || data.data?.users || data.agents || data.users || []);

            return agentsList.map((agent: any) => ({
                id: agent._id || agent.id,
                name: agent.name || agent.username || 'Unknown',
                username: agent.username || agent.name || 'Unknown',
                email: agent.email || '',
                role: agent.role,
                status: agent.status || (agent.isActive === undefined ? 'Active' : (agent.isActive ? 'Active' : 'Disabled')),
                lastActive: agent.lastActive || new Date().toISOString(),
            })).filter((agent: any) => agent.role !== 'admin' && agent.role !== 'SuperAdmin');
        } catch (error) {
            console.error('Error fetching agents:', error);
            return [];
        }
    },

    createAgent: async (agentData: { username: string; password: string; role: string }): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/admin/agents`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(agentData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create agent');
            }

            return true;
        } catch (error) {
            console.error('Error creating agent:', error);
            throw error;
        }
    },

    updateAgent: async (id: string, agentData: { name?: string; role?: string }): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/admin/agents/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(agentData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update agent');
            }

            return true;
        } catch (error) {
            console.error('Error updating agent:', error);
            throw error;
        }
    },

    deleteAgent: async (id: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/admin/agents/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete agent');
            }

            return true;
        } catch (error) {
            console.error('Error deleting agent:', error);
            throw error;
        }
    }
};
