import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Shield, Edit2 } from 'lucide-react';
import { Table, type Column } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';
import { agentService } from '../../services/agentService';
import type { Agent } from '../../types';
import styles from './AgentsList.module.css';

export const AgentsList: React.FC = () => {
    const { showToast } = useToast();
    const [agents, setAgents] = useState<Agent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '', // For updates
        role: 'onboarding_agent' as string, // API uses lowercase snake_case
    });

    const fetchAgents = async () => {
        setIsLoading(true);
        try {
            const data = await agentService.getAllAgents();
            setAgents(data);
        } catch (error) {
            showToast('Failed to fetch agents', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const handleOpenModal = (agent?: Agent) => {
        if (agent) {
            setEditingAgent(agent);
            setFormData({
                username: agent.username || '',
                password: '', // Password not editable directly or hidden
                name: agent.name,
                role: agent.role.toLowerCase(), // Ensure lowercase for select
            });
        } else {
            setEditingAgent(null);
            setFormData({
                username: '',
                password: '',
                name: '',
                role: 'onboarding_agent',
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editingAgent) {
                await agentService.updateAgent(editingAgent.id, {
                    name: formData.name,
                    role: formData.role,
                });
                showToast(`Agent updated successfully`, 'success');
            } else {
                await agentService.createAgent({
                    username: formData.username,
                    password: formData.password,
                    role: formData.role,
                });
                showToast(`Agent created successfully`, 'success');
            }
            setIsModalOpen(false);
            fetchAgents();
        } catch (error: any) {
            showToast(error.message || 'Operation failed', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this agent?')) return;

        try {
            await agentService.deleteAgent(id);
            showToast('Agent deleted successfully', 'success');
            fetchAgents();
        } catch (error: any) {
            showToast(error.message || 'Failed to delete agent', 'error');
        }
    };

    const columns: Column<Agent>[] = [
        { header: 'Name', accessorKey: 'name' },
        { header: 'Username', accessorKey: 'username' },
        {
            header: 'Role',
            cell: (agent) => (
                <div className={styles.roleCell}>
                    <Shield size={14} className={styles.roleIcon} />
                    {agent.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenModal(agent)}
                        title="Edit Agent"
                    >
                        <Edit2 size={16} />
                    </Button>
                    <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(agent.id)}
                        title="Remove Agent"
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Agent Management</h1>
                <Button onClick={() => handleOpenModal()} leftIcon={<Plus size={16} />}>
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
                title={editingAgent ? "Edit Agent" : "Add New Agent"}
            >
                <form onSubmit={handleSubmit} className={styles.form}>
                    {!editingAgent && (
                        <>
                            <Input
                                label="Username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                                fullWidth
                            />
                            <Input
                                label="Password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                fullWidth
                            />
                        </>
                    )}

                    {editingAgent && (
                        <Input
                            label="Display Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            fullWidth
                            placeholder="Optional update name"
                        />
                    )}

                    <Select
                        label="Role"
                        options={[
                            { label: 'Onboarding Agent', value: 'onboarding_agent' },
                            { label: 'Reconciliation Agent', value: 'reconciliation_agent' },
                        ]}
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        fullWidth
                    />

                    <div className={styles.modalActions}>
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" isLoading={isSubmitting}>
                            {editingAgent ? 'Update Agent' : 'Create Agent'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
