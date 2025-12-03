import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import styles from './Login.module.css';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login, isLoading } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await login(username, password);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Failed to login');
        }
    };

    return (
        <div className={styles.container}>
            <Card className={styles.loginCard}>
                <div className={styles.header}>
                    <img src="/logo.png" alt="Bahumati Logo" className={styles.logoImage} />
                    <h1 className={styles.title}>Sign In</h1>
                    <p className={styles.subtitle}>Gift and Self Gift Bahumati Units to users across India</p>
                </div>

                <form onSubmit={handleLogin} className={styles.form}>
                    {error && (
                        <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <Input
                        label="Username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        required
                        fullWidth
                    />

                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
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
            </Card>
        </div>
    );
};
