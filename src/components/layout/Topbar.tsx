import React from 'react';
import { LogOut, User as UserIcon, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Topbar.module.css';

export const Topbar: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <header className={styles.topbar}>
            <div className={styles.left}>
                {/* Breadcrumbs could go here */}
                <h2 className={styles.pageTitle}>Dashboard</h2>
            </div>

            <div className={styles.right}>
                <button className={styles.iconButton}>
                    <Bell size={20} />
                    <span className={styles.badge} />
                </button>

                <div className={styles.divider} />

                <div className={styles.profile}>
                    <div className={styles.avatar}>
                        <UserIcon size={20} />
                    </div>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{user?.name}</span>
                        <span className={styles.userEmail}>{user?.email}</span>
                    </div>

                    <button className={styles.logoutButton} onClick={logout} title="Logout">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
};
