import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Select } from '../../components/common/Select';
import styles from './Login.module.css';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login, isLoading } = useAuth();
    const [selectedRole, setSelectedRole] = useState<Role>('OnboardingAgent');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(selectedRole);
        navigate('/');
    };

    const roleOptions = [
        { label: 'Onboarding Agent', value: 'OnboardingAgent' },
        { label: 'Reconciliation Agent', value: 'ReconciliationAgent' },
        { label: 'Super Admin', value: 'SuperAdmin' },
    ];

    return (
        <div className={styles.container}>
            <Card className={styles.loginCard}>
                <div className={styles.header}>
                    <img src="/logo.png" alt="Bahumati Logo" className={styles.logoImage} />
                    <h1 className={styles.title}>Sign In</h1>
                    <p className={styles.subtitle}>Gift and Self Gift Bahumati Units to users across India</p>
                </div>

                <form onSubmit={handleLogin} className={styles.form}>
                    <Select
                        label="Select Role (Simulation)"
                        options={roleOptions}
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as Role)}
                        fullWidth
                    />

                    <Button
                        type="submit"
                        fullWidth
                        isLoading={isLoading}
                        className={styles.submitButton}
                    >
                        Sign In
                    </Button>
                </form>

                <div className={styles.footer}>
                    <p className={styles.note}>
                        Note: This is a demo. No password required.
                    </p>
                </div>
            </Card>
        </div>
    );
};
