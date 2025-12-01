import React from 'react';
import clsx from 'clsx';
import styles from './Card.module.css';

interface CardProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
    action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, title, className, action }) => {
    return (
        <div className={clsx(styles.card, className)}>
            {(title || action) && (
                <div className={styles.header}>
                    {title && <h3 className={styles.title}>{title}</h3>}
                    {action && <div className={styles.action}>{action}</div>}
                </div>
            )}
            <div className={styles.content}>{children}</div>
        </div>
    );
};
