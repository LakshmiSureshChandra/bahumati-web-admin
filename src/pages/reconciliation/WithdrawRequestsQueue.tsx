import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, type Column } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { withdrawService } from '../../services/withdrawService';
import type { WithdrawRequest } from '../../types';
import styles from './WithdrawRequestsQueue.module.css';

export const WithdrawRequestsQueue: React.FC = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState<WithdrawRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    useEffect(() => {
        const fetchRequests = async () => {
            setIsLoading(true);
            const status = statusFilter === 'all' ? undefined : statusFilter;
            const data = await withdrawService.getWithdrawRequests(status);
            setRequests(data);
            setIsLoading(false);
        };

        fetchRequests();
    }, [statusFilter]);

    const columns: Column<WithdrawRequest>[] = [
        { header: 'ID', accessorKey: 'id' },
        { header: 'User ID', accessorKey: 'userId' },
        {
            header: 'Amount',
            cell: (req) => `₹${req.requestedAmount.toLocaleString('en-IN')}`
        },
        {
            header: 'Max Allowed',
            cell: (req) => `₹${req.allowedMaxAmount.toLocaleString('en-IN')}`
        },
        {
            header: 'Status',
            cell: (req) => (
                <Badge variant={req.status === 'Completed' ? 'success' : req.status === 'Rejected' ? 'danger' : 'warning'}>
                    {req.status}
                </Badge>
            )
        },
        {
            header: 'Date',
            cell: (req) => new Date(req.requestDate).toLocaleDateString()
        },
        {
            header: 'Actions',
            cell: (req) => (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/withdrawals/${req.id}`)}
                >
                    Process
                </Button>
            )
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Withdrawal Requests</h1>
                <div style={{ width: '200px' }}>
                    <Select
                        options={[
                            { label: 'All Statuses', value: 'all' },
                            { label: 'Pending', value: 'pending' },
                            { label: 'Approved', value: 'approved' },
                            { label: 'Rejected', value: 'rejected' },
                        ]}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                    />
                </div>
            </div>

            <Table
                data={requests}
                columns={columns}
                keyExtractor={(req) => req.id}
                isLoading={isLoading}
                emptyMessage="No withdrawal requests found."
            />
        </div>
    );
};
