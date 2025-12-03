import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X as XIcon, Upload } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { withdrawService } from '../../services/withdrawService';
import { userService } from '../../services/userService';
import type { WithdrawRequest } from '../../types';
import styles from './WithdrawRequestDetail.module.css';

export const WithdrawRequestDetail: React.FC = () => {
    const { requestId } = useParams<{ requestId: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [request, setRequest] = useState<WithdrawRequest | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [transactionId, setTransactionId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [user, setUser] = useState<any | null>(null);
    const [event, setEvent] = useState<any | null>(null);
    const [dateError, setDateError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRequest = async () => {
            if (!requestId) return;
            const data = await withdrawService.getWithdrawRequestById(requestId);
            if (data) {
                setRequest(data);
                if (data.transactionId) setTransactionId(data.transactionId);

                // Fetch User Details
                const userData = await userService.getUserById(data.userId);
                setUser(userData);

                // Fetch Event Details & Validate
                if (data.eventId) {
                    const response = await import('../../services/eventService').then(m => m.eventService.getEventById(data.eventId!));

                    if (response && response.event) {
                        const eventObj = response.event;
                        setEvent(eventObj);

                        const now = new Date();
                        const endDate = new Date(eventObj.endDate);
                        const allocationDate = new Date(eventObj.autoAllocationScheduledDate);

                        if (now < endDate) {
                            setDateError('Event has not ended yet. Withdrawals are not allowed.');
                        } else if (now > allocationDate) {
                            setDateError('Auto-allocation date passed. Withdrawals are no longer allowed.');
                        }
                    }
                } else {
                    setDateError('This withdrawal is not linked to an event. Only event funds can be withdrawn manually.');
                }
            }
            setIsLoading(false);
        };

        fetchRequest();
    }, [requestId]);

    const handleComplete = async () => {
        if (!requestId) return;
        // Transaction ID is optional for approval in new API? Or maybe handled differently.
        // The prompt says PATCH .../approve. It doesn't mention body data for approve, but usually transaction ID is needed.
        // Assuming for now simple approval or we might need to update the service if transaction ID is required.
        // The prompt says: curl -X PATCH .../approve
        // It doesn't show body data. So maybe transaction ID is not sent here or sent separately?
        // But the UI has a transaction ID field.
        // If the API doesn't accept it in the approve call, we might need another call or it's just a status change.
        // Let's stick to the prompt's API signature: PATCH /approve with no body mentioned.

        setIsSubmitting(true);
        try {
            await withdrawService.approveWithdrawRequest(requestId);
            showToast('Withdrawal approved successfully', 'success');
            navigate('/withdrawals');
        } catch (error: any) {
            showToast(error.message || 'Failed to approve request', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!requestId) return;

        // We need a reason. For now, hardcode or add a prompt/input.
        // The UI doesn't have a reason input visible in the code I saw earlier (it had transaction ID).
        // I'll add a simple prompt for reason or use a default.
        const reason = window.prompt('Enter rejection reason:', 'Documents mismatch');
        if (!reason) return;

        setIsSubmitting(true);
        try {
            await withdrawService.rejectWithdrawRequest(requestId, reason);
            showToast('Withdrawal rejected', 'info');
            navigate('/withdrawals');
        } catch (error: any) {
            showToast(error.message || 'Failed to reject request', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (!request) return <div>Request not found</div>;

    const isPending = request.status === 'Pending';

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Button variant="ghost" onClick={() => navigate(-1)} leftIcon={<ArrowLeft size={16} />}>
                    Back
                </Button>
                <h1 className={styles.title}>Process Withdrawal</h1>
            </div>

            {dateError && isPending && (
                <div className={styles.errorBanner} style={{
                    backgroundColor: '#FEE2E2',
                    color: '#B91C1C',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1.5rem',
                    border: '1px solid #FECACA'
                }}>
                    <strong>Warning:</strong> {dateError}
                </div>
            )}

            <div className={styles.grid}>
                <div className={styles.leftColumn}>
                    <Card title="Request Details">
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <label>Request ID</label>
                                <div>{request.id}</div>
                            </div>
                            <div className={styles.infoItem}>
                                <label>User ID</label>
                                <div>{request.userId}</div>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Requested Amount</label>
                                <div className={styles.amount}>₹{request.requestedAmount.toLocaleString('en-IN')}</div>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Max Allowed Amount</label>
                                <div>₹{request.allowedMaxAmount.toLocaleString('en-IN')}</div>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Status</label>
                                <Badge variant={request.status === 'Completed' ? 'success' : request.status === 'Rejected' ? 'danger' : 'warning'}>
                                    {request.status}
                                </Badge>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Request Date</label>
                                <div>{new Date(request.requestDate).toLocaleString()}</div>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Event Context</label>
                                <div>
                                    {event ? (
                                        <>
                                            <div>{event.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                Ends: {new Date(event.endDate).toLocaleDateString()} <br />
                                                Alloc: {new Date(event.autoAllocationScheduledDate).toLocaleDateString()}
                                            </div>
                                        </>
                                    ) : (
                                        <span style={{ color: 'var(--danger)' }}>Not linked to an event</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="User Bank Details" className={styles.bankCard}>
                        {user ? (
                            <div className={styles.infoGrid}>
                                <div className={styles.infoItem}>
                                    <label>User Name</label>
                                    <div>{user.name}</div>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Phone</label>
                                    <div>{user.phone}</div>
                                </div>
                                {user.bankDetails ? (
                                    <>
                                        <div className={styles.infoItem}>
                                            <label>Bank Name</label>
                                            <div>{user.bankDetails.bankName}</div>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <label>Account Number</label>
                                            <div>{user.bankDetails.accountNumber}</div>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <label>IFSC Code</label>
                                            <div>{user.bankDetails.ifscCode}</div>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <label>Account Holder</label>
                                            <div>{user.bankDetails.accountHolderName}</div>
                                        </div>
                                    </>
                                ) : (
                                    <div className={styles.infoItem} style={{ gridColumn: '1 / -1' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>No bank details available</span>
                                    </div>
                                )}
                                {user.upiId && (
                                    <div className={styles.infoItem}>
                                        <label>UPI ID</label>
                                        <div>{user.upiId}</div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>Loading user details...</div>
                        )}
                    </Card>
                </div>

                <div className={styles.rightColumn}>
                    <Card title="Processing" className={styles.processCard}>
                        {isPending ? (
                            <div className={styles.form}>
                                <Input
                                    label="Transaction ID"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder="Enter bank transaction reference"
                                    fullWidth
                                    disabled={!!dateError}
                                />

                                <div className={styles.uploadSection}>
                                    <label className={styles.uploadLabel}>Transaction Proof</label>
                                    <div className={styles.uploadBox}>
                                        <Upload size={24} />
                                        <span>Click to upload proof</span>
                                    </div>
                                    {/* Mock upload behavior */}
                                </div>

                                <div className={styles.actions}>
                                    <Button
                                        variant="danger"
                                        onClick={handleReject}
                                        isLoading={isSubmitting}
                                        leftIcon={<XIcon size={16} />}
                                    >
                                        Reject Request
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleComplete}
                                        isLoading={isSubmitting}
                                        leftIcon={<Check size={16} />}
                                        disabled={!!dateError}
                                    >
                                        Mark as Completed
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.completedInfo}>
                                <div className={styles.infoItem}>
                                    <label>Transaction ID</label>
                                    <div>{request.transactionId || 'N/A'}</div>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Processed Date</label>
                                    <div>{request.processedDate ? new Date(request.processedDate).toLocaleString() : 'N/A'}</div>
                                </div>
                                {request.transactionProofImageUrl && (
                                    <div className={styles.proofPreview}>
                                        <img src={request.transactionProofImageUrl} alt="Proof" />
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                </div>
            </div >
        </div >
    );
};
