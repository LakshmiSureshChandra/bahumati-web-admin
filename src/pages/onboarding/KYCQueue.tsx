import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, type Column } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { userService } from '../../services/userService';
import type { User } from '../../types';
import styles from './KYCQueue.module.css';

export const KYCQueue: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            const allUsers = await userService.getUsers();
            setUsers(allUsers.filter((u) => u.kycStatus === 'Pending'));
            setIsLoading(false);
        };

        fetchUsers();
    }, []);

    const columns: Column<User>[] = [
        { header: 'Name', accessorKey: 'name' },
        { header: 'Email', accessorKey: 'email' },
        { header: 'Phone', accessorKey: 'phone' },
        {
            header: 'Submitted Date',
            cell: (user) => new Date(user.createdDate).toLocaleDateString()
        },
        {
            header: 'Status',
            cell: (user) => <Badge variant="warning">{user.kycStatus}</Badge>
        },
        {
            header: 'Actions',
            cell: (user) => (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/kyc-review/${user.id}`)}
                >
                    Review
                </Button>
            )
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>KYC Queue</h1>
                <div className={styles.actions}>
                    {/* Filters could go here */}
                </div>
            </div>

            <Table
                data={users}
                columns={columns}
                keyExtractor={(user) => user.id}
                isLoading={isLoading}
                emptyMessage="No pending KYC requests found."
            />
        </div>
    );
};
