import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { configService } from '../../services/configService';
import type { AppConfig } from '../../types';
import styles from './ConfigPage.module.css';

export const ConfigPage: React.FC = () => {
    const { showToast } = useToast();
    const [config, setConfig] = useState<AppConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            const data = await configService.getConfig();
            setConfig(data);
            setIsLoading(false);
        };

        fetchConfig();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!config) return;

        setIsSaving(true);
        try {
            await configService.updateConfig(config);
            showToast('Configuration updated successfully', 'success');
        } catch (error) {
            showToast('Failed to update configuration', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div>Loading configuration...</div>;
    if (!config) return <div>Error loading configuration</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>System Configuration</h1>
                <Button
                    onClick={handleSave}
                    isLoading={isSaving}
                    leftIcon={<Save size={16} />}
                >
                    Save Changes
                </Button>
            </div>

            <form onSubmit={handleSave} className={styles.form}>
                <Card title="General Settings">
                    <div className={styles.grid}>
                        <Input
                            label="Maintenance Mode"
                            type="checkbox"
                            checked={config.maintenanceMode}
                            onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
                            className={styles.checkbox}
                        />
                        <Input
                            label="Min App Version (iOS)"
                            value={config.minAppVersionIos}
                            onChange={(e) => setConfig({ ...config, minAppVersionIos: e.target.value })}
                            fullWidth
                        />
                        <Input
                            label="Min App Version (Android)"
                            value={config.minAppVersionAndroid}
                            onChange={(e) => setConfig({ ...config, minAppVersionAndroid: e.target.value })}
                            fullWidth
                        />
                    </div>
                </Card>

                <Card title="Support Contact">
                    <div className={styles.grid}>
                        <Input
                            label="Support Email"
                            type="email"
                            value={config.supportEmail}
                            onChange={(e) => setConfig({ ...config, supportEmail: e.target.value })}
                            fullWidth
                        />
                        <Input
                            label="Support Phone"
                            type="tel"
                            value={config.supportPhone}
                            onChange={(e) => setConfig({ ...config, supportPhone: e.target.value })}
                            fullWidth
                        />
                    </div>
                </Card>

                <Card title="Withdrawal Limits">
                    <div className={styles.grid}>
                        <Input
                            label="Max Daily Withdrawal (₹)"
                            type="number"
                            value={config.maxDailyWithdrawalLimit}
                            onChange={(e) => setConfig({ ...config, maxDailyWithdrawalLimit: Number(e.target.value) })}
                            fullWidth
                        />
                    </div>
                </Card>
            </form>
        </div>
    );
};
