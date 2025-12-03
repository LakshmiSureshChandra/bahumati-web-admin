import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Table, type Column } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { eventService } from '../../services/eventService';
import type { Event } from '../../types';
import styles from './EventsList.module.css';

export const EventsList: React.FC = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        const fetchEvents = async () => {
            const data = await eventService.getEvents();
            setEvents(data);
            setFilteredEvents(data);
            setIsLoading(false);
        };

        fetchEvents();
    }, []);

    useEffect(() => {
        let result = events;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(e =>
                e.name.toLowerCase().includes(query) ||
                e.id.toLowerCase().includes(query)
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter(e => e.status.toLowerCase() === statusFilter.toLowerCase());
        }

        setFilteredEvents(result);
    }, [searchQuery, statusFilter, events]);

    const columns: Column<Event>[] = [
        { header: 'Name', accessorKey: 'name' },
        {
            header: 'Created By',
            cell: (evt) => evt.creator?.name || 'Unknown'
        },
        {
            header: 'Start Date',
            cell: (evt) => new Date(evt.startDate).toLocaleString()
        },
        {
            header: 'End Date',
            cell: (evt) => new Date(evt.endDate).toLocaleString()
        },
        {
            header: 'Status',
            cell: (evt) => (
                <Badge variant={evt.status === 'Ongoing' ? 'success' : evt.status === 'Upcoming' ? 'info' : 'neutral'}>
                    {evt.status}
                </Badge>
            )
        },
        {
            header: 'Collected Amount',
            cell: (evt) => `₹${evt.totalCollectedAmount.toLocaleString('en-IN')}`
        },
        {
            header: 'Actions',
            cell: (evt) => (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/events/${evt.id}`)}
                >
                    View
                </Button>
            )
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Events</h1>
            </div>

            <Card className={styles.searchCard}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', padding: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                        <Input
                            label="Search Events"
                            placeholder="Search by name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            fullWidth
                        />
                    </div>
                    <div style={{ width: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: '1px solid var(--border)',
                                backgroundColor: 'var(--surface)',
                                color: 'var(--text)'
                            }}
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="ended">Ended</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </Card>

            <Table
                data={filteredEvents}
                columns={columns}
                keyExtractor={(evt) => evt.id}
                isLoading={isLoading}
                emptyMessage="No events found."
            />
        </div>
    );
};
