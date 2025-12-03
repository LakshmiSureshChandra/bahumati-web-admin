import React from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import {
    LayoutDashboard,
    Users,
    Calendar,
    ArrowRightLeft,
    Wallet,
    Settings,
    Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

export const Sidebar: React.FC = () => {
    const { user } = useAuth();
    const role = user?.role;

    const navItems = [
        {
            label: 'Dashboard',
            path: '/',
            icon: <LayoutDashboard size={20} />,
            roles: ['OnboardingAgent', 'ReconciliationAgent', 'SuperAdmin'],
        },
        {
            label: 'KYC Queue',
            path: '/kyc-queue',
            icon: <Users size={20} />,
            roles: ['OnboardingAgent', 'SuperAdmin'],
        },
        {
            label: 'Users',
            path: '/users',
            icon: <Users size={20} />,
            roles: ['OnboardingAgent', 'ReconciliationAgent', 'SuperAdmin'],
        },
        {
            label: 'Events',
            path: '/events',
            icon: <Calendar size={20} />,
            roles: ['ReconciliationAgent', 'SuperAdmin'],
        },
        {
            label: 'Transactions',
            path: '/transactions',
            icon: <ArrowRightLeft size={20} />,
            roles: ['ReconciliationAgent', 'SuperAdmin'],
        },
        {
            label: 'Withdrawals',
            path: '/withdrawals',
            icon: <Wallet size={20} />,
            roles: ['ReconciliationAgent', 'SuperAdmin'],
        },

        {
            label: 'Agents',
            path: '/agents',
            icon: <Shield size={20} />,
            roles: ['SuperAdmin'],
        },
        {
            label: 'Config',
            path: '/config',
            icon: <Settings size={20} />,
            roles: ['SuperAdmin'],
        },
    ];

    const filteredItems = navItems.filter((item) => role && item.roles.includes(role));

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <img src="/logo.png" alt="Bahumati Logo" className={styles.logoImage} />
                <span className={styles.logoText}>Bahumati Admin</span>
            </div>

            <nav className={styles.nav}>
                {filteredItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => clsx(styles.navItem, isActive && styles.active)}
                    >
                        <span className={styles.icon}>{item.icon}</span>
                        <span className={styles.label}>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className={styles.footer}>
                <div className={styles.userRole}>{role?.replace(/([A-Z])/g, ' $1').trim()}</div>
            </div>
        </aside>
    );
};
