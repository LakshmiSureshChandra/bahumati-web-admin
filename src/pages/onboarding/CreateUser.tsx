import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import type { AllocationType } from '../../types';
import styles from './CreateUser.module.css';

export const CreateUser: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        phone: '',
        defaultAllocationType: 'Top 50 Companies' as AllocationType,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const newUser = await userService.createUser(formData);
            showToast(`User ${newUser.phone} created successfully`, 'success');
            navigate(`/kyc-review/${newUser.id}`);
        } catch (error) {
            showToast('Failed to create user', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Button variant="ghost" onClick={() => navigate(-1)} leftIcon={<ArrowLeft size={16} />}>
                    Back
                </Button>
                <h1 className={styles.title}>Create New User</h1>
            </div>

            <Card className={styles.formCard}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <Input
                        label="Phone Number"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        fullWidth
                    />

                    <Select
                        label="Default Allocation Type"
                        options={[
                            { label: 'Top 50 Companies', value: 'Top 50 Companies' },
                            { label: 'Digital Gold', value: 'Digital Gold' },
                        ]}
                        value={formData.defaultAllocationType}
                        onChange={(e) => setFormData({ ...formData, defaultAllocationType: e.target.value as AllocationType })}
                        fullWidth
                    />

                    <div className={styles.formActions}>
                        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" isLoading={isLoading}>
                            Create User
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};
