import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, type Column } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { withdrawService } from '../../services/withdrawService';
import type { WithdrawRequest } from '../../types';
import styles from './WithdrawRequestsQueue.module.css';

export const WithdrawRequestsQueue: React.FC = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState<WithdrawRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            const data = await withdrawService.getWithdrawRequests();
            setRequests(data);
            setIsLoading(false);
        };

        fetchRequests();
    }, []);

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
