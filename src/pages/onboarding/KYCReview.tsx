import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X as XIcon, FileText } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import type { User, KYCDetails } from '../../types';
import styles from './KYCReview.module.css';

export const KYCReview: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [user, setUser] = useState<User | null>(null);
    const [kycDetails, setKycDetails] = useState<KYCDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;
            const userData = await userService.getUserById(userId);
            const kycData = await userService.getKycDetails(userId);

            if (userData) setUser(userData);
            if (kycData) setKycDetails(kycData);
            setIsLoading(false);
        };

        fetchData();
    }, [userId]);

    const handleApprove = async () => {
        if (!userId) return;
        await userService.approveKyc(userId);
        showToast('KYC Approved successfully', 'success');
        navigate('/kyc-queue');
    };

    const handleReject = async () => {
        if (!userId) return;
        if (!rejectReason.trim()) {
            showToast('Please provide a rejection reason', 'error');
            return;
        }
        await userService.rejectKyc(userId, rejectReason);
        showToast('KYC Rejected', 'info');
        setIsRejectModalOpen(false);
        navigate('/kyc-queue');
    };

    if (isLoading) return <div>Loading...</div>;
    if (!user) return <div>User not found</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Button variant="ghost" onClick={() => navigate(-1)} leftIcon={<ArrowLeft size={16} />}>
                    Back
                </Button>
                <div className={styles.headerActions}>
                    <Button variant="danger" onClick={() => setIsRejectModalOpen(true)} leftIcon={<XIcon size={16} />}>
                        Reject
                    </Button>
                    <Button variant="primary" onClick={handleApprove} leftIcon={<Check size={16} />}>
                        Approve KYC
                    </Button>
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.leftColumn}>
                    <Card title="User Information">
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <label>Name</label>
                                <div>{user.name}</div>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Email</label>
                                <div>{user.email}</div>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Phone</label>
                                <div>{user.phone}</div>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Status</label>
                                <Badge variant={user.kycStatus === 'Approved' ? 'success' : user.kycStatus === 'Rejected' ? 'danger' : 'warning'}>
                                    {user.kycStatus}
                                </Badge>
                            </div>
                        </div>
                    </Card>

                    <Card title="KYC Details" className={styles.kycCard}>
                        {kycDetails ? (
                            <div className={styles.infoGrid}>
                                <div className={styles.infoItem}>
                                    <label>ID Type</label>
                                    <div>{kycDetails.governmentIdType}</div>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>ID Number</label>
                                    <div>{kycDetails.governmentIdNumber}</div>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Address Proof</label>
                                    <div>{kycDetails.addressProof}</div>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Submitted At</label>
                                    <div>{new Date(kycDetails.submittedAt).toLocaleString()}</div>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.emptyState}>No KYC details submitted yet.</div>
                        )}
                    </Card>
                </div>

                <div className={styles.rightColumn}>
                    <Card title="Documents">
                        {kycDetails?.documents && kycDetails.documents.length > 0 ? (
                            <div className={styles.documentsGrid}>
                                {kycDetails.documents.map((doc, index) => (
                                    <div key={index} className={styles.documentItem}>
                                        <div className={styles.documentPreview}>
                                            <FileText size={32} />
                                        </div>
                                        <a href={doc} target="_blank" rel="noreferrer" className={styles.documentLink}>
                                            View Document {index + 1}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>No documents uploaded.</div>
                        )}
                    </Card>
                </div>
            </div>

            <Modal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                title="Reject KYC"
            >
                <div className={styles.modalContent}>
                    <p>Are you sure you want to reject this user's KYC? This action cannot be undone immediately.</p>
                    <Input
                        label="Reason for Rejection"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="e.g., ID document is blurry"
                        fullWidth
                    />
                    <div className={styles.modalActions}>
                        <Button variant="secondary" onClick={() => setIsRejectModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleReject}>
                            Confirm Reject
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
