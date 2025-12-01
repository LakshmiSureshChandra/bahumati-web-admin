import React from 'react';
import clsx from 'clsx';
import styles from './Table.module.css';
import { Button } from './Button';

export interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
}

interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (item: T) => string;
    isLoading?: boolean;
    onPageChange?: (page: number) => void;
    currentPage?: number;
    totalPages?: number;
    emptyMessage?: string;
}

export const Table = <T,>({
    data,
    columns,
    keyExtractor,
    isLoading,
    onPageChange,
    currentPage = 1,
    totalPages = 1,
    emptyMessage = 'No data available',
}: TableProps<T>) => {
    if (isLoading) {
        return <div className={styles.loadingState}>Loading...</div>;
    }

    if (data.length === 0) {
        return <div className={styles.emptyState}>{emptyMessage}</div>;
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {columns.map((col, index) => (
                                <th key={index} className={clsx(styles.th, col.className)}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => (
                            <tr key={keyExtractor(item)} className={styles.tr}>
                                {columns.map((col, index) => (
                                    <td key={index} className={clsx(styles.td, col.className)}>
                                        {col.cell
                                            ? col.cell(item)
                                            : col.accessorKey
                                                ? (item[col.accessorKey] as React.ReactNode)
                                                : null}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && onPageChange && (
                <div className={styles.pagination}>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => onPageChange(currentPage - 1)}
                    >
                        Previous
                    </Button>
                    <span className={styles.pageInfo}>
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
};
