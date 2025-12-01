import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, type Column } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { transactionService } from '../../services/transactionService';
import type { Transaction } from '../../types';
import styles from './TransactionsList.module.css';

export const TransactionsList: React.FC = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            const data = await transactionService.getTransactions();
            setTransactions(data);
            setIsLoading(false);
        };

        fetchTransactions();
    }, []);

    const columns: Column<Transaction>[] = [
        { header: 'ID', accessorKey: 'id' },
        { header: 'User ID', accessorKey: 'userId' },
        { header: 'Type', accessorKey: 'type' },
        {
            header: 'Amount',
            cell: (tx) => `₹${tx.amount.toLocaleString('en-IN')}`
        },
        {
            header: 'Status',
            cell: (tx) => (
                <Badge variant={tx.status === 'Completed' ? 'success' : tx.status === 'Failed' ? 'danger' : 'warning'}>
                    {tx.status}
                </Badge>
            )
        },
        {
            header: 'Date',
            cell: (tx) => new Date(tx.createdAt).toLocaleDateString()
        },
        {
            header: 'Actions',
            cell: (tx) => (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/transactions/${tx.id}`)}
                >
                    View
                </Button>
            )
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Transactions</h1>
            </div>

            <Table
                data={transactions}
                columns={columns}
                keyExtractor={(tx) => tx.id}
                isLoading={isLoading}
                emptyMessage="No transactions found."
            />
        </div>
    );
};
