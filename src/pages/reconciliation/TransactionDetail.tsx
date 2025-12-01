import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { transactionService } from '../../services/transactionService';
import type { Transaction } from '../../types';
import styles from './TransactionDetail.module.css';

export const TransactionDetail: React.FC = () => {
    const { transactionId } = useParams<{ transactionId: string }>();
    const navigate = useNavigate();
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTransaction = async () => {
            if (!transactionId) return;
            const data = await transactionService.getTransactionById(transactionId);
            if (data) setTransaction(data);
            setIsLoading(false);
        };

        fetchTransaction();
    }, [transactionId]);

    if (isLoading) return <div>Loading...</div>;
    if (!transaction) return <div>Transaction not found</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Button variant="ghost" onClick={() => navigate(-1)} leftIcon={<ArrowLeft size={16} />}>
                    Back
                </Button>
                <h1 className={styles.title}>Transaction Details</h1>
            </div>

            <Card className={styles.detailCard}>
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <label>Transaction ID</label>
                        <div>{transaction.id}</div>
                    </div>
                    <div className={styles.infoItem}>
                        <label>User ID</label>
                        <div>{transaction.userId}</div>
                    </div>
                    <div className={styles.infoItem}>
                        <label>Type</label>
                        <div>{transaction.type}</div>
                    </div>
                    <div className={styles.infoItem}>
                        <label>Amount</label>
                        <div className={styles.amount}>{transaction.amount} {transaction.currency}</div>
                    </div>
                    <div className={styles.infoItem}>
                        <label>Status</label>
                        <Badge variant={transaction.status === 'Completed' ? 'success' : transaction.status === 'Failed' ? 'danger' : 'warning'}>
                            {transaction.status}
                        </Badge>
                    </div>
                    <div className={styles.infoItem}>
                        <label>Created At</label>
                        <div>{new Date(transaction.createdAt).toLocaleString()}</div>
                    </div>
                    {transaction.processedAt && (
                        <div className={styles.infoItem}>
                            <label>Processed At</label>
                            <div>{new Date(transaction.processedAt).toLocaleString()}</div>
                        </div>
                    )}
                    {transaction.eventId && (
                        <div className={styles.infoItem}>
                            <label>Event ID</label>
                            <div>{transaction.eventId}</div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};
