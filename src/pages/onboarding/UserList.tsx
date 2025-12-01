import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Table, type Column } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { userService } from '../../services/userService';
import type { User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import styles from './UserList.module.css';

export const UserList: React.FC = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            const allUsers = await userService.getUsers();
            setUsers(allUsers);
            setIsLoading(false);
        };

        fetchUsers();
    }, []);

    const columns: Column<User>[] = [
        { header: 'Name', accessorKey: 'name' },
        { header: 'Email', accessorKey: 'email' },
        { header: 'Phone', accessorKey: 'phone' },
        {
            header: 'KYC Status',
            cell: (user) => (
                <Badge variant={user.kycStatus === 'Approved' ? 'success' : user.kycStatus === 'Rejected' ? 'danger' : 'warning'}>
                    {user.kycStatus}
                </Badge>
            )
        },
        {
            header: 'Status',
            cell: (user) => (
                <Badge variant={user.isBanned ? 'danger' : 'success'}>
                    {user.isBanned ? 'Banned' : 'Active'}
                </Badge>
            )
        },
        {
            header: 'Created Date',
            cell: (user) => new Date(user.createdDate).toLocaleDateString()
        },
        {
            header: 'Actions',
            cell: (user) => (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/kyc-review/${user.id}`)}
                >
                    View
                </Button>
            )
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Users</h1>
                <div className={styles.actions}>
                    {currentUser?.role === 'OnboardingAgent' && (
                        <Button onClick={() => navigate('/users/new')} leftIcon={<Plus size={16} />}>
                            Create User
                        </Button>
                    )}
                </div>
            </div>

            <Table
                data={users}
                columns={columns}
                keyExtractor={(user) => user.id}
                isLoading={isLoading}
                emptyMessage="No users found."
            />
        </div>
    );
};
