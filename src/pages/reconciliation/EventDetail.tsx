import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, FileText, Banknote } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Table, type Column } from '../../components/common/Table';
import { eventService } from '../../services/eventService';
import type { Event, HistoryTransaction } from '../../types';
import styles from './EventDetail.module.css';

export const EventDetail: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<Event | null>(null);
    const [transactions, setTransactions] = useState<HistoryTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!eventId) return;
            try {
                const data = await eventService.getEventById(eventId);

                if (data) {
                    setEvent(data.event);
                    setTransactions(data.transactions);
                }
            } catch (error) {
                console.error("Error fetching event details:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [eventId]);

    if (isLoading) return <div>Loading...</div>;
    if (!event) return <div>Event not found</div>;

    const transactionColumns: Column<HistoryTransaction>[] = [
        { header: 'Date', cell: (tx) => new Date(tx.createdAt).toLocaleString() },
        { header: 'Sender', cell: (tx) => tx.sender?.name || '-' },
        { header: 'Amount', cell: (tx) => `₹${tx.amount.toLocaleString('en-IN')}` },
        { header: 'Status', cell: (tx) => <Badge variant={tx.status === 'completed' || tx.status === 'success' ? 'success' : 'warning'}>{tx.status || 'Pending'}</Badge> },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Button variant="ghost" onClick={() => navigate(-1)} leftIcon={<ArrowLeft size={16} />}>
                    Back
                </Button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h1 className={styles.title}>{event.name}</h1>
                    <Badge variant={event.status === 'Ongoing' ? 'success' : event.status === 'Upcoming' ? 'info' : 'neutral'}>
                        {event.status}
                    </Badge>
                </div>
            </div>

            <div className={styles.topSection} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                <div className={styles.imageCardWrapper} style={{ height: '300px', width: '100%' }}>
                    <div className={styles.imageCard} style={{ height: '100%', padding: 0, overflow: 'hidden', border: 'none', borderRadius: '0.5rem', backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                        {event.image ? (
                            <img src={event.image} alt={event.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--surface-hover)', color: 'var(--text-secondary)' }}>
                                <Calendar size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <span>No Event Image</span>
                            </div>
                        )}
                    </div>
                </div>

                <Card title="Event Details" className={styles.detailsCard}>
                    <div className={styles.infoGrid} style={{ display: 'grid', gap: '1.5rem' }}>
                        <div className={styles.infoItem}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                <User size={16} /> Created By
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {event.creator.image ? (
                                    <img src={event.creator.image} alt={event.creator.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                        {event.creator.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span style={{ fontSize: '1rem', fontWeight: 500 }}>{event.creator.name}</span>
                            </div>
                        </div>

                        <div className={styles.infoItem}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                <FileText size={16} /> About
                            </label>
                            <div style={{ lineHeight: 1.6, color: 'var(--text)' }}>{event.description || 'No description provided.'}</div>
                        </div>

                        <div className={styles.infoItem}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                <Calendar size={16} /> Duration
                            </label>
                            <div style={{ fontSize: '0.95rem' }}>
                                {new Date(event.startDate).toLocaleString()} — {new Date(event.endDate).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className={styles.metrics} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className={styles.metricCard} style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.1) 100%)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '0.5rem', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ padding: '1rem', borderRadius: '1rem', backgroundColor: '#10B981', color: 'white', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' }}>
                            <Banknote size={24} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Received</label>
                            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text)' }}>₹{event.totalCollectedAmount.toLocaleString('en-IN')}</div>
                        </div>
                    </div>
                </div>
                <div className={styles.metricCard} style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.1) 100%)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '0.5rem', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ padding: '1rem', borderRadius: '1rem', backgroundColor: '#EF4444', color: 'white', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)' }}>
                            <Banknote size={24} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Withdrawn</label>
                            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text)' }}>₹{event.totalWithdrawnAmount?.toLocaleString('en-IN') || '0'}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.transactions}>
                <h2 className={styles.subtitle} style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>Transactions</h2>
                <Table
                    data={transactions}
                    columns={transactionColumns}
                    keyExtractor={(t) => t.transactionId || `${t.type}-${t.createdAt}-${t.amount}`}
                    emptyMessage="No transactions found for this event."
                />
            </div>
        </div>
    );
};
