import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Table, type Column } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { userService } from '../../services/userService';
import type { User } from '../../types';
import styles from './KYCQueue.module.css';

export const KYCQueue: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            const allUsers = await userService.getUsers();
            setUsers(allUsers);
            setIsLoading(false);
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        let result = users;

        if (statusFilter !== 'All') {
            result = result.filter((u) => u.kycStatus === statusFilter);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter((u) =>
                u.name.toLowerCase().includes(query) ||
                u.email.toLowerCase().includes(query) ||
                u.phone.includes(query)
            );
        }

        setFilteredUsers(result);
    }, [users, statusFilter, searchQuery]);

    const columns: Column<User>[] = [
        { header: 'Name', accessorKey: 'name' },
        { header: 'Phone', accessorKey: 'phone' },
        {
            header: 'Submitted Date',
            cell: (user) => new Date(user.createdDate).toLocaleDateString()
        },
        {
            header: 'Status',
            cell: (user) => (
                <Badge variant={
                    user.kycStatus === 'Approved' ? 'success' :
                        user.kycStatus === 'Rejected' ? 'danger' : 'warning'
                }>
                    {user.kycStatus}
                </Badge>
            )
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
                    {/* Actions removed */}
                </div>
            </div>

            <div className={styles.filters}>
                <div className={styles.searchBox}>
                    <div className={styles.searchContainer}>
                        <Search className={styles.searchIcon} size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, email, phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                </div>
                <div className={styles.statusFilters}>
                    {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((status) => (
                        <button
                            key={status}
                            className={`${styles.filterButton} ${statusFilter === status ? styles.activeFilter : ''}`}
                            onClick={() => setStatusFilter(status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <Table
                data={filteredUsers}
                columns={columns}
                keyExtractor={(user) => user.id}
                isLoading={isLoading}
                emptyMessage="No users found matching criteria."
            />
        </div>
    );
};
