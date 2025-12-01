import React, { useEffect, useState } from 'react';
import { Card } from '../../components/common/Card';
import { userService } from '../../services/userService';
import { transactionService } from '../../services/transactionService';
import { eventService } from '../../services/eventService';
import styles from './Dashboard.module.css';

export const GlobalDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeEvents: 0,
        totalVolume: 0,
        systemHealth: 'Healthy',
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const users = await userService.getUsers();
            const events = await eventService.getEvents();
            const transactions = await transactionService.getTransactions();

            const totalVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0);
            const activeEvents = events.filter((e) => e.status === 'Ongoing').length;

            setStats({
                totalUsers: users.length,
                activeEvents,
                totalVolume,
                systemHealth: 'Healthy',
            });
            setIsLoading(false);
        };

        fetchData();
    }, []);

    if (isLoading) return <div>Loading dashboard...</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Global Overview</h1>

            <div className={styles.grid}>
                <Card className={styles.statCard}>
                    <div className={styles.statLabel}>Total Users</div>
                    <div className={styles.statValue}>{stats.totalUsers}</div>
                    <div className={styles.statTrend}>+5% this week</div>
                </Card>

                <Card className={styles.statCard}>
                    <div className={styles.statLabel}>Active Events</div>
                    <div className={styles.statValue}>{stats.activeEvents}</div>
                    <div className={styles.statTrend}>Ongoing</div>
                </Card>

                <Card className={styles.statCard}>
                    <div className={styles.statLabel}>Total Volume</div>
                    <div className={styles.statValue}>₹{stats.totalVolume.toLocaleString('en-IN')}</div>
                    <div className={styles.statTrend}>Lifetime</div>
                </Card>

                <Card className={styles.statCard}>
                    <div className={styles.statLabel}>System Health</div>
                    <div className={styles.statValue} style={{ color: 'var(--success)' }}>{stats.systemHealth}</div>
                    <div className={styles.statTrend}>All systems operational</div>
                </Card>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="User Growth" className={styles.chartCard}>
                    <div className={styles.chartPlaceholder}>
                        {/* Placeholder for Area Chart */}
                        <div className={styles.areaChart} />
                    </div>
                </Card>

                <Card title="Revenue Stream" className={styles.chartCard}>
                    <div className={styles.chartPlaceholder}>
                        {/* Placeholder for Bar Chart */}
                        <div className={styles.barChart}>
                            <div className={styles.bar} style={{ height: '40%' }} />
                            <div className={styles.bar} style={{ height: '60%' }} />
                            <div className={styles.bar} style={{ height: '75%' }} />
                            <div className={styles.bar} style={{ height: '50%' }} />
                            <div className={styles.bar} style={{ height: '80%' }} />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
