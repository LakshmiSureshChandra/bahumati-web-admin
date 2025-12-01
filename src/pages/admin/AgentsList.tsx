import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Shield } from 'lucide-react';
import { Table, type Column } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';
import type { Agent, Role } from '../../types';
import styles from './AgentsList.module.css';

export const AgentsList: React.FC = () => {
    const { showToast } = useToast();
    const [agents, setAgents] = useState<Agent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'OnboardingAgent' as Role,
    });

    // Mock fetching agents (since authService handles current user, we'll mock a list here or add a method to authService)
    // For this demo, I'll simulate a list based on the mock data in authService + some extras
    const fetchAgents = async () => {
        setIsLoading(true);
        // Simulating an API call to get all agents
        await new Promise(resolve => setTimeout(resolve, 500));
        setAgents([
            { id: '1', name: 'Alice Johnson', email: 'alice@finvest.com', role: 'OnboardingAgent', status: 'Active', lastActive: new Date().toISOString() },
            { id: '2', name: 'Bob Smith', email: 'bob@finvest.com', role: 'ReconciliationAgent', status: 'Active', lastActive: new Date().toISOString() },
            { id: '3', name: 'Charlie Brown', email: 'charlie@finvest.com', role: 'OnboardingAgent', status: 'Disabled', lastActive: new Date(Date.now() - 86400000).toISOString() },
        ]);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate creation
        await new Promise(resolve => setTimeout(resolve, 800));
        showToast(`Agent ${formData.name} added successfully`, 'success');
        setIsModalOpen(false);
        setFormData({ name: '', email: '', role: 'OnboardingAgent' });
        fetchAgents(); // Refresh list
        setIsSubmitting(false);
    };

    const columns: Column<Agent>[] = [
        { header: 'Name', accessorKey: 'name' },
        { header: 'Email', accessorKey: 'email' },
        {
            header: 'Role',
            cell: (agent) => (
                <div className={styles.roleCell}>
                    <Shield size={14} className={styles.roleIcon} />
                    {agent.role.replace(/([A-Z])/g, ' $1').trim()}
                </div>
            )
        },
        {
            header: 'Status',
            cell: (agent) => (
                <Badge variant={agent.status === 'Active' ? 'success' : 'neutral'}>
                    {agent.status}
                </Badge>
            )
        },
        {
            header: 'Last Active',
            cell: (agent) => new Date(agent.lastActive).toLocaleDateString()
        },
        {
            header: 'Actions',
            cell: (agent) => (
                <Button
                    size="sm"
                    variant="danger"
                    onClick={() => showToast('Delete functionality mocked', 'info')}
                    title="Remove Agent"
                >
                    <Trash2 size={16} />
                </Button>
            )
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Agent Management</h1>
                <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus size={16} />}>
                    Add New Agent
                </Button>
            </div>

            <Table
                data={agents}
                columns={columns}
                keyExtractor={(agent) => agent.id}
                isLoading={isLoading}
                emptyMessage="No agents found."
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Agent"
            >
                <form onSubmit={handleSubmit} className={styles.form}>
                    <Input
                        label="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        fullWidth
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        fullWidth
                    />

                    <Select
                        label="Role"
                        options={[
                            { label: 'Onboarding Agent', value: 'OnboardingAgent' },
                            { label: 'Reconciliation Agent', value: 'ReconciliationAgent' },
                            { label: 'Super Admin', value: 'SuperAdmin' },
                        ]}
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                        fullWidth
                    />

                    <div className={styles.modalActions}>
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" isLoading={isSubmitting}>
                            Add Agent
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
