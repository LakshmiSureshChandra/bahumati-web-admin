import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User as UserIcon, Calendar, ArrowRightLeft, Wallet, ArrowLeft } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Table, type Column } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { userService } from '../../services/userService';
import type { User, UserHistoryResponse, HistoryTransaction, HistoryEvent, HistoryWithdrawal } from '../../types';
import styles from './UserHistory.module.css';

import { useToast } from '../../context/ToastContext';

export const UserHistory: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [userList, setUserList] = useState<User[]>([]);
    const [historyData, setHistoryData] = useState<UserHistoryResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'transactions' | 'events' | 'withdrawals'>('transactions');

    useEffect(() => {
        fetchInitialUsers();
    }, []);

    const fetchInitialUsers = async () => {
        setIsLoading(true);
        try {
            const result = await userService.getUsersPaginated(1, 10);
            setUserList(result.users);
        } catch (error) {
            console.error('Error fetching users:', error);
            showToast('Failed to fetch users', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (e?: React.FormEvent, userId?: string) => {
        if (e) e.preventDefault();
        const query = userId || searchQuery;

        if (!query.trim()) {
            setHistoryData(null);
            fetchInitialUsers();
            return;
        }

        setIsLoading(true);
        setHistoryData(null);

        try {
            // First find the user to get the ID if we searched by phone
            let targetUserId = userId;
            if (!targetUserId) {
                const foundUser = await userService.findUser(query);
                if (foundUser) {
                    targetUserId = foundUser.id;
                } else {
                    showToast('User not found', 'error');
                }
            }

            if (targetUserId) {
                const history = await userService.getUserHistory(targetUserId);
                if (history) {
                    setHistoryData(history);
                } else {
                    showToast('Failed to fetch user history', 'error');
                }
            } else {
                // If not found, clear data
                setHistoryData(null);
            }
        } catch (error) {
            console.error('Error fetching user history:', error);
            showToast('An error occurred while fetching history', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const userListColumns: Column<User>[] = [
        { header: 'Name', accessorKey: 'name' },
        { header: 'Phone', accessorKey: 'phone' },
        { header: 'KYC Status', cell: (u) => <Badge variant={u.kycStatus === 'Approved' ? 'success' : 'warning'}>{u.kycStatus}</Badge> },
        {
            header: 'Actions',
            cell: (u) => (
                <Button size="sm" variant="outline" onClick={() => {
                    setSearchQuery(u.phone || u.id);
                    handleSearch(undefined, u.id);
                }}>
                    View History
                </Button>
            )
        }
    ];

    const transactionColumns: Column<HistoryTransaction>[] = [
        {
            header: 'Date',
            cell: (tx) => new Date(tx.createdAt || tx.allocatedAt || '').toLocaleDateString()
        },
        {
            header: 'Type',
            cell: (tx) => (
                <div style={{ textTransform: 'capitalize' }}>
                    {tx.type.replace('_', ' ')}
                </div>
            )
        },
        {
            header: 'Amount',
            cell: (tx) => `₹${tx.amount.toLocaleString('en-IN')}`
        },
        {
            header: 'Details',
            cell: (tx) => {
                if (tx.type === 'gift_sent' && tx.receiver) return `To: ${tx.receiver.name}`;
                if (tx.type === 'gift_received' && tx.sender) return `From: ${tx.sender.name}`;
                if (tx.type === 'allocation') return `${tx.allocationType} (${tx.quantity?.toFixed(3)} units)`;
                return '-';
            }
        },
    ];

    const eventColumns: Column<HistoryEvent>[] = [
        { header: 'Event Name', accessorKey: 'title' },
        { header: 'Status', cell: (evt) => <Badge variant={evt.status === 'active' ? 'success' : evt.status === 'ended' ? 'neutral' : 'danger'}>{evt.status}</Badge> },
        { header: 'Dates', cell: (evt) => `${new Date(evt.eventStartDate).toLocaleString()} - ${new Date(evt.eventEndDate).toLocaleString()}` },
        { header: 'Gifts Received', cell: (evt) => evt.stats?.totalGiftsReceived || 0 },
        { header: 'Total Amount', cell: (evt) => `₹${(evt.stats?.totalGiftsAmount || 0).toLocaleString('en-IN')}` },
    ];

    const withdrawalColumns: Column<HistoryWithdrawal>[] = [
        { header: 'Date', cell: (wr) => new Date(wr.createdAt).toLocaleDateString() },
        { header: 'Amount', cell: (wr) => `₹${wr.amount.toLocaleString('en-IN')}` },
        { header: 'Event', cell: (wr) => wr.eventId?.title || '-' },
        { header: 'Status', cell: (wr) => <Badge variant={wr.status === 'approved' ? 'success' : wr.status === 'rejected' ? 'danger' : 'warning'}>{wr.status}</Badge> },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Users</h1>
                <Button onClick={() => navigate('/users/new')}>Create User</Button>
            </div>

            <Card className={styles.searchCard}>
                <form onSubmit={(e) => handleSearch(e)} className={styles.searchForm}>
                    <Input
                        label="Search User"
                        placeholder="Enter User ID or Phone"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        fullWidth
                    />
                    <Button type="submit" isLoading={isLoading} leftIcon={<Search size={16} />}>
                        Search
                    </Button>
                </form>
            </Card>

            {!historyData && (
                <div className={styles.userList}>
                    <h2 className={styles.subtitle} style={{ marginBottom: '1rem' }}>Recent Users</h2>
                    <Table
                        data={userList}
                        columns={userListColumns}
                        keyExtractor={(u) => u.id}
                        isLoading={isLoading && !historyData}
                        emptyMessage="No users found."
                    />
                </div>
            )}

            {historyData && (
                <div className={styles.results}>
                    <div style={{ marginBottom: '1rem' }}>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setHistoryData(null);
                                setSearchQuery('');
                                fetchInitialUsers();
                            }}
                            leftIcon={<ArrowLeft size={16} />}
                        >
                            Back to Users
                        </Button>
                    </div>
                    <Card className={styles.profileCard}>
                        <div className={styles.profileHeader}>
                            <div className={styles.avatar}>
                                {historyData.user.image ? (
                                    <img src={historyData.user.image} alt={historyData.user.fullName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                    <UserIcon size={32} />
                                )}
                            </div>
                            <div className={styles.profileInfo}>
                                <h2>{historyData.user.fullName}</h2>
                                <p>{historyData.user.number}</p>
                            </div>
                            <div className={styles.balanceInfo}>
                                <div className={styles.balanceItem}>
                                    <label>Total Allocated</label>
                                    <span>₹{(historyData.summary.totalAllocated || 0).toLocaleString('en-IN')}</span>
                                </div>
                                <div className={styles.balanceItem}>
                                    <label>Total Withdrawn</label>
                                    <span>₹{(historyData.summary.totalWithdrawn || 0).toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                            <div className={styles.balanceItem}>
                                <label>Gifts Sent</label>
                                <span>{historyData.summary.totalGiftsSent}</span>
                            </div>
                            <div className={styles.balanceItem}>
                                <label>Gifts Received</label>
                                <span>{historyData.summary.totalGiftsReceived}</span>
                            </div>
                            <div className={styles.balanceItem}>
                                <label>Total Unallocated</label>
                                <span>₹{(historyData.summary.netBalance || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div className={styles.balanceItem}>
                                <label>Events Created</label>
                                <span>{historyData.summary.totalEventsCreated}</span>
                            </div>
                        </div>
                    </Card>

                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${activeTab === 'transactions' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('transactions')}
                        >
                            <ArrowRightLeft size={16} /> Transactions
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'events' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('events')}
                        >
                            <Calendar size={16} /> Events
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'withdrawals' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('withdrawals')}
                        >
                            <Wallet size={16} /> Withdrawals
                        </button>
                    </div>

                    <div className={styles.tabContent}>
                        {activeTab === 'transactions' && (
                            <Table
                                data={historyData.transactions.list}
                                columns={transactionColumns}
                                keyExtractor={(t) => t.transactionId || (t.giftId && t.giftId._id) || `${t.type}-${t.createdAt}-${t.amount}`}
                                emptyMessage="No transactions found"
                            />
                        )}
                        {activeTab === 'events' && (
                            <Table
                                data={historyData.events.list}
                                columns={eventColumns}
                                keyExtractor={(e) => e.id}
                                emptyMessage="No event participation found"
                            />
                        )}
                        {activeTab === 'withdrawals' && (
                            <Table
                                data={historyData.withdrawals.list}
                                columns={withdrawalColumns}
                                keyExtractor={(w) => w._id}
                                emptyMessage="No withdrawal requests found"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
