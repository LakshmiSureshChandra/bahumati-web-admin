import React, { useEffect, useState } from 'react';
import { Card } from '../../components/common/Card';
import { userService } from '../../services/userService';

import styles from './Dashboard.module.css';

export const OnboardingDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const users = await userService.getUsers();
            const pending = users.filter((u) => u.kycStatus === 'Pending').length;
            const approved = users.filter((u) => u.kycStatus === 'Approved').length;
            const rejected = users.filter((u) => u.kycStatus === 'Rejected').length;

            setStats({
                pending,
                approved,
                rejected,
                total: users.length,
            });
            setIsLoading(false);
        };

        fetchStats();
    }, []);

    if (isLoading) return <div>Loading dashboard...</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Onboarding Overview</h1>

            <div className={styles.grid}>
                <Card className={styles.statCard}>
                    <div className={styles.statLabel}>Pending KYC</div>
                    <div className={styles.statValue}>{stats.pending}</div>
                    <div className={styles.statTrend}>Requires action</div>
                </Card>

                <Card className={styles.statCard}>
                    <div className={styles.statLabel}>Approved Today</div>
                    <div className={styles.statValue}>{stats.approved}</div>
                    <div className={styles.statTrend}>+12% from yesterday</div>
                </Card>

                <Card className={styles.statCard}>
                    <div className={styles.statLabel}>Rejected Today</div>
                    <div className={styles.statValue}>{stats.rejected}</div>
                    <div className={styles.statTrend}>-5% from yesterday</div>
                </Card>
            </div>

            <div className={styles.chartsGrid}>
                <Card title="KYC Status Distribution" className={styles.chartCard}>
                    <div className={styles.chartPlaceholder}>
                        {/* Placeholder for a chart library like Recharts or Chart.js */}
                        <div className={styles.bar} style={{ height: '60%', backgroundColor: 'var(--warning)' }} title="Pending" />
                        <div className={styles.bar} style={{ height: '80%', backgroundColor: 'var(--success)' }} title="Approved" />
                        <div className={styles.bar} style={{ height: '20%', backgroundColor: 'var(--danger)' }} title="Rejected" />
                    </div>
                    <div className={styles.chartLegend}>
                        <span>Pending</span>
                        <span>Approved</span>
                        <span>Rejected</span>
                    </div>
                </Card>

                <Card title="Recent Activity" className={styles.activityCard}>
                    <ul className={styles.activityList}>
                        <li className={styles.activityItem}>
                            <span className={styles.activityTime}>10:30 AM</span>
                            <span>John Doe submitted KYC documents</span>
                        </li>
                        <li className={styles.activityItem}>
                            <span className={styles.activityTime}>09:15 AM</span>
                            <span>Jane Smith KYC approved</span>
                        </li>
                        <li className={styles.activityItem}>
                            <span className={styles.activityTime}>09:00 AM</span>
                            <span>New user registration: Mike Johnson</span>
                        </li>
                    </ul>
                </Card>
            </div>
        </div>
    );
};
