import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { eventService } from '../../services/eventService';
import type { Event } from '../../types';
import styles from './EventDetail.module.css';

export const EventDetail: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            if (!eventId) return;
            const data = await eventService.getEventById(eventId);
            if (data) setEvent(data);
            setIsLoading(false);
        };

        fetchEvent();
    }, [eventId]);

    if (isLoading) return <div>Loading...</div>;
    if (!event) return <div>Event not found</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Button variant="ghost" onClick={() => navigate(-1)} leftIcon={<ArrowLeft size={16} />}>
                    Back
                </Button>
                <h1 className={styles.title}>Event Details</h1>
            </div>

            <div className={styles.grid}>
                <Card title="Event Information" className={styles.infoCard}>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <label>Name</label>
                            <div>{event.name}</div>
                        </div>
                        <div className={styles.infoItem}>
                            <label>Status</label>
                            <Badge variant={event.status === 'Ongoing' ? 'success' : event.status === 'Upcoming' ? 'info' : 'neutral'}>
                                {event.status}
                            </Badge>
                        </div>
                        <div className={styles.infoItem}>
                            <label>Start Date</label>
                            <div>{new Date(event.startDate).toLocaleDateString()}</div>
                        </div>
                        <div className={styles.infoItem}>
                            <label>End Date</label>
                            <div>{new Date(event.endDate).toLocaleDateString()}</div>
                        </div>
                        <div className={styles.infoItem}>
                            <label>Total Collected</label>
                            <div className={styles.amount}>₹{event.totalCollectedAmount.toLocaleString('en-IN')}</div>
                        </div>
                        <div className={styles.infoItem}>
                            <label>Organizer ID</label>
                            <div>{event.organizerUserId}</div>
                        </div>
                    </div>
                </Card>

                <Card title="Rules & Configuration" className={styles.rulesCard}>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <label>T+X Days</label>
                            <div>{event.tPlusXDays} Days</div>
                        </div>
                        <div className={styles.infoItem}>
                            <label>Allowed Withdraw %</label>
                            <div>{event.allowedWithdrawPercentage}%</div>
                        </div>
                        <div className={styles.infoItem}>
                            <label>Default Allocation</label>
                            <div>{event.defaultAllocationType}</div>
                        </div>
                        <div className={styles.infoItem}>
                            <label>Auto Allocation Date</label>
                            <div>{new Date(event.autoAllocationScheduledDate).toLocaleDateString()}</div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
