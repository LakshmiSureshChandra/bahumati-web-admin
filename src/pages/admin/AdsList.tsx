import React, { useEffect, useState } from 'react';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { Table, type Column } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';
import { adsService } from '../../services/adsService';
import type { Ad, AdPlacement, AdType } from '../../types';
import styles from './AdsList.module.css';

export const AdsList: React.FC = () => {
    const { showToast } = useToast();
    const [ads, setAds] = useState<Ad[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<Partial<Ad>>({
        title: '',
        imageUrl: '',
        redirectUrl: '',
        placement: 'HomeBanner',
        type: 'ImageOnly',
        isActive: true,
    });

    const fetchAds = async () => {
        setIsLoading(true);
        const data = await adsService.getAds();
        setAds(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchAds();
    }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this ad?')) {
            await adsService.deleteAd(id);
            showToast('Ad deleted successfully', 'success');
            fetchAds();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await adsService.createAd(formData as Omit<Ad, 'id' | 'createdAt' | 'updatedAt'>);
            showToast('Ad created successfully', 'success');
            setIsModalOpen(false);
            setFormData({
                title: '',
                imageUrl: '',
                redirectUrl: '',
                placement: 'HomeBanner',
                type: 'ImageOnly',
                isActive: true,
            });
            fetchAds();
        } catch (error) {
            showToast('Failed to create ad', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns: Column<Ad>[] = [
        {
            header: 'Image',
            cell: (ad) => (
                <div className={styles.adPreview}>
                    <img src={ad.imageUrl} alt={ad.title} />
                </div>
            )
        },
        { header: 'Title', accessorKey: 'title' },
        { header: 'Placement', accessorKey: 'placement' },
        {
            header: 'Status',
            cell: (ad) => (
                <Badge variant={ad.isActive ? 'success' : 'neutral'}>
                    {ad.isActive ? 'Active' : 'Inactive'}
                </Badge>
            )
        },
        {
            header: 'Actions',
            cell: (ad) => (
                <div className={styles.actions}>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(ad.redirectUrl, '_blank')}
                        title="Test Link"
                    >
                        <ExternalLink size={16} />
                    </Button>
                    <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(ad.id)}
                        title="Delete Ad"
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Ads Management</h1>
                <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus size={16} />}>
                    Create New Ad
                </Button>
            </div>

            <Table
                data={ads}
                columns={columns}
                keyExtractor={(ad) => ad.id}
                isLoading={isLoading}
                emptyMessage="No ads found."
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Ad"
            >
                <form onSubmit={handleSubmit} className={styles.form}>
                    <Input
                        label="Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        fullWidth
                    />

                    <Input
                        label="Image URL"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        required
                        fullWidth
                    />

                    <Input
                        label="Redirect URL"
                        value={formData.redirectUrl}
                        onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
                        placeholder="https://example.com/promo"
                        required
                        fullWidth
                    />

                    <Select
                        label="Placement"
                        options={[
                            { label: 'Home Banner', value: 'HomeBanner' },
                            { label: 'Dashboard Card', value: 'DashboardCard' },
                            { label: 'Sidebar', value: 'Sidebar' },
                        ]}
                        value={formData.placement}
                        onChange={(e) => setFormData({ ...formData, placement: e.target.value as AdPlacement })}
                        fullWidth
                    />

                    <Select
                        label="Ad Type"
                        options={[
                            { label: 'Image Only', value: 'ImageOnly' },
                            { label: 'Text Only', value: 'TextOnly' },
                            { label: 'Text & Image', value: 'TextAndImage' },
                        ]}
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as AdType })}
                        fullWidth
                    />

                    <div className={styles.modalActions}>
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" isLoading={isSubmitting}>
                            Create Ad
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
