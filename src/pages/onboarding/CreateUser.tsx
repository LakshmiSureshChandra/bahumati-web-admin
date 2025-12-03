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
    const [step, setStep] = useState<'phone' | 'otp' | 'details'>('phone');

    const [formData, setFormData] = useState({
        phone: '',
        otp: '',
        defaultAllocationType: 'Top 50 Companies' as AllocationType,
    });

    const [tempUser, setTempUser] = useState<{ id: string, token: string } | null>(null);

    const handleSendOtp = async () => {
        if (!formData.phone || formData.phone.length < 10) {
            showToast('Please enter a valid phone number', 'error');
            return;
        }
        setIsLoading(true);
        try {
            await userService.sendOtp(formData.phone);
            setStep('otp');
            showToast(`OTP sent to ${formData.phone}`, 'success');
        } catch (error: any) {
            showToast(error.message || 'Failed to send OTP', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!formData.otp || formData.otp.length !== 4) {
            showToast('Please enter a valid 4-digit OTP', 'error');
            return;
        }
        setIsLoading(true);
        try {
            const { user, token } = await userService.verifyOtp(formData.phone, formData.otp);
            setTempUser({ id: user.id, token });
            setStep('details');
            showToast('OTP Verified', 'success');
        } catch (error: any) {
            showToast(error.message || 'Failed to verify OTP', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tempUser) {
            showToast('User session missing. Please try again.', 'error');
            return;
        }
        setIsLoading(true);
        try {
            await userService.updateUserAllocation(
                tempUser.id,
                formData.defaultAllocationType,
                tempUser.token
            );
            showToast(`User created successfully`, 'success');
            navigate(`/kyc-review/${tempUser.id}`);
        } catch (error: any) {
            showToast(error.message || 'Failed to update user allocation', 'error');
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
                <div className={styles.form}>
                    {step === 'phone' && (
                        <>
                            <Input
                                label="Phone Number"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="Enter mobile number"
                                fullWidth
                            />
                            <Button
                                onClick={handleSendOtp}
                                fullWidth
                                isLoading={isLoading}
                                className={styles.actionButton}
                            >
                                Send OTP
                            </Button>
                        </>
                    )}

                    {step === 'otp' && (
                        <>
                            <div className={styles.phoneDisplay}>
                                <span>Sent to: {formData.phone}</span>
                                <Button variant="ghost" size="sm" onClick={() => setStep('phone')}>Change</Button>
                            </div>
                            <Input
                                label="Enter OTP"
                                type="text"
                                value={formData.otp}
                                onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                                placeholder="Enter 4-digit OTP"
                                fullWidth
                            />
                            <Button
                                onClick={handleVerifyOtp}
                                fullWidth
                                isLoading={isLoading}
                                className={styles.actionButton}
                            >
                                Verify OTP
                            </Button>
                        </>
                    )}

                    {step === 'details' && (
                        <form onSubmit={handleSubmit}>
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
                                <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
                                    Create User
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </Card>
        </div>
    );
};
