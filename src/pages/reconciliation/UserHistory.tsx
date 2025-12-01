import React, { useState } from 'react';
import { Search, User as UserIcon, Calendar, ArrowRightLeft, Wallet } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Table, type Column } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { userService } from '../../services/userService';
import { transactionService } from '../../services/transactionService';
import { eventService } from '../../services/eventService';
import { withdrawService } from '../../services/withdrawService';
import type { User, Transaction, Event, WithdrawRequest } from '../../types';
import styles from './UserHistory.module.css';

export const UserHistory: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [user, setUser] = useState<User | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'transactions' | 'events' | 'withdrawals'>('transactions');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        setUser(null);

        try {
            const allUsers = await userService.getUsers();
            // Search by ID, Phone, or Email
            const foundUser = allUsers.find(u =>
                u.id === searchQuery ||
                u.phone.includes(searchQuery) ||
                u.email.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (foundUser) {
                setUser(foundUser);

                // Fetch related data
                const [allTx, allEvents, allWr] = await Promise.all([
                    transactionService.getTransactions(),
                    eventService.getEvents(),
                    withdrawService.getWithdrawRequests()
                ]);

                setTransactions(allTx.filter(t => t.userId === foundUser.id));
                // For events, we assume participation if there's a transaction related to it or just show all for now as mock
                // In a real app, we'd have a participation table. Here we'll just show active events for context or filter if possible.
                // Since we don't have direct participation link in mock, we'll filter transactions with eventId to find events.
                const participatedEventIds = new Set(allTx.filter(t => t.userId === foundUser.id && t.eventId).map(t => t.eventId));
                setEvents(allEvents.filter(e => participatedEventIds.has(e.id)));

                setWithdrawals(allWr.filter(w => w.userId === foundUser.id));
            }
        } catch (error) {
            console.error('Error fetching user history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const transactionColumns: Column<Transaction>[] = [
        { header: 'Date', cell: (tx) => new Date(tx.createdAt).toLocaleDateString() },
        { header: 'Type', accessorKey: 'type' },
        { header: 'Amount', cell: (tx) => `₹${tx.amount.toLocaleString('en-IN')}` },
        { header: 'Status', cell: (tx) => <Badge variant={tx.status === 'Completed' ? 'success' : 'warning'}>{tx.status}</Badge> },
    ];

    const eventColumns: Column<Event>[] = [
        { header: 'Event Name', accessorKey: 'name' },
        { header: 'Status', cell: (evt) => <Badge variant={evt.status === 'Ongoing' ? 'success' : 'neutral'}>{evt.status}</Badge> },
        { header: 'Start Date', cell: (evt) => new Date(evt.startDate).toLocaleDateString() },
    ];

    const withdrawalColumns: Column<WithdrawRequest>[] = [
        { header: 'Date', cell: (wr) => new Date(wr.requestDate).toLocaleDateString() },
        { header: 'Amount', cell: (wr) => `₹${wr.requestedAmount.toLocaleString('en-IN')}` },
        { header: 'Status', cell: (wr) => <Badge variant={wr.status === 'Completed' ? 'success' : wr.status === 'Rejected' ? 'danger' : 'warning'}>{wr.status}</Badge> },
    ];

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>User History Lookup</h1>

            <Card className={styles.searchCard}>
                <form onSubmit={handleSearch} className={styles.searchForm}>
                    <Input
                        label="Search User"
                        placeholder="Enter User ID, Phone, or Email"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        fullWidth
                    />
                    <Button type="submit" isLoading={isLoading} leftIcon={<Search size={16} />}>
                        Search
                    </Button>
                </form>
            </Card>

            {user && (
                <div className={styles.results}>
                    <Card className={styles.profileCard}>
                        <div className={styles.profileHeader}>
                            <div className={styles.avatar}>
                                <UserIcon size={32} />
                            </div>
                            <div className={styles.profileInfo}>
                                <h2>{user.name}</h2>
                                <p>{user.email} • {user.phone}</p>
                                <div className={styles.badges}>
                                    <Badge variant={user.kycStatus === 'Approved' ? 'success' : 'warning'}>KYC: {user.kycStatus}</Badge>
                                    <Badge variant={user.isBanned ? 'danger' : 'success'}>{user.isBanned ? 'Banned' : 'Active'}</Badge>
                                </div>
                            </div>
                            <div className={styles.balanceInfo}>
                                <div className={styles.balanceItem}>
                                    <label>Total Balance</label>
                                    <span>₹{user.totalBalance.toLocaleString('en-IN')}</span>
                                </div>
                                <div className={styles.balanceItem}>
                                    <label>Withdrawable</label>
                                    <span>₹{user.withdrawableAmount.toLocaleString('en-IN')}</span>
                                </div>
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
                            <Table data={transactions} columns={transactionColumns} keyExtractor={(t) => t.id} emptyMessage="No transactions found" />
                        )}
                        {activeTab === 'events' && (
                            <Table data={events} columns={eventColumns} keyExtractor={(e) => e.id} emptyMessage="No event participation found" />
                        )}
                        {activeTab === 'withdrawals' && (
                            <Table data={withdrawals} columns={withdrawalColumns} keyExtractor={(w) => w.id} emptyMessage="No withdrawal requests found" />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
