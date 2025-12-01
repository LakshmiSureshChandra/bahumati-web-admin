import React, { useEffect, useState } from 'react';
import { Card } from '../../components/common/Card';
import { transactionService } from '../../services/transactionService';
import { withdrawService } from '../../services/withdrawService';
import styles from './Dashboard.module.css';

export const ReconciliationDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalVolume: 0,
        txCount: 0,
        pendingWithdrawals: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const transactions = await transactionService.getTransactions();
            const withdrawals = await withdrawService.getWithdrawRequests();

            const totalVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0);
            const pendingWithdrawals = withdrawals.filter((w) => w.status === 'Pending').length;

            setStats({
                totalVolume,
                txCount: transactions.length,
                pendingWithdrawals,
            });
            setIsLoading(false);
        };

        fetchData();
    }, []);

    if (isLoading) return <div>Loading dashboard...</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Reconciliation Overview</h1>

            <div className={styles.grid}>
                <Card className={styles.statCard}>
                    <div className={styles.statLabel}>Total Volume</div>
                    <div className={styles.statValue}>₹{stats.totalVolume.toLocaleString('en-IN')}</div>
                    <div className={styles.statTrend}>Today</div>
                </Card>

                <Card className={styles.statCard}>
                    <div className={styles.statLabel}>Transactions</div>
                    <div className={styles.statValue}>{stats.txCount}</div>
                    <div className={styles.statTrend}>Today</div>
                </Card>

                <Card className={styles.statCard}>
                    <div className={styles.statLabel}>Pending Withdrawals</div>
                    <div className={styles.statValue}>{stats.pendingWithdrawals}</div>
                    <div className={styles.statTrend}>Requires action</div>
                </Card>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="Transaction Volume" className={styles.chartCard}>
                    <div className={styles.chartPlaceholder}>
                        {/* Placeholder for Line Chart */}
                        <div className={styles.lineChart}>
                            <svg viewBox="0 0 100 50" className={styles.chartSvg}>
                                <polyline
                                    fill="none"
                                    stroke="var(--primary)"
                                    strokeWidth="2"
                                    points="0,40 20,35 40,20 60,25 80,10 100,5"
                                />
                            </svg>
                        </div>
                    </div>
                </Card>

                <Card title="Allocation vs Withdrawal" className={styles.chartCard}>
                    <div className={styles.chartPlaceholder}>
                        {/* Placeholder for Pie Chart */}
                        <div className={styles.pieChart} />
                        <div className={styles.chartLegend}>
                            <div className={styles.legendItem}>
                                <span className={styles.dot} style={{ backgroundColor: 'var(--primary)' }} />
                                <span>Allocation (65%)</span>
                            </div>
                            <div className={styles.legendItem}>
                                <span className={styles.dot} style={{ backgroundColor: 'var(--warning)' }} />
                                <span>Withdrawal (35%)</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
