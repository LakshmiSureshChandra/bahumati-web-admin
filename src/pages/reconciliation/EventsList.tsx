import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, type Column } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { eventService } from '../../services/eventService';
import type { Event } from '../../types';
import styles from './EventsList.module.css';

export const EventsList: React.FC = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            const data = await eventService.getEvents();
            setEvents(data);
            setIsLoading(false);
        };

        fetchEvents();
    }, []);

    const columns: Column<Event>[] = [
        { header: 'Name', accessorKey: 'name' },
        {
            header: 'Start Date',
            cell: (evt) => new Date(evt.startDate).toLocaleDateString()
        },
        {
            header: 'End Date',
            cell: (evt) => new Date(evt.endDate).toLocaleDateString()
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

            <Table
                data={events}
                columns={columns}
                keyExtractor={(evt) => evt.id}
                isLoading={isLoading}
                emptyMessage="No events found."
            />
        </div>
    );
};
