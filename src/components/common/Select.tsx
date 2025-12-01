import React from 'react';
import clsx from 'clsx';
import styles from './Select.module.css';

interface SelectOption {
    label: string;
    value: string | number;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: SelectOption[];
    error?: string;
    fullWidth?: boolean;
}

export const Select: React.FC<SelectProps> = ({
    label,
    options,
    error,
    fullWidth,
    className,
    id,
    ...props
}) => {
    const selectId = id || props.name;

    return (
        <div className={clsx(styles.wrapper, fullWidth && styles.fullWidth, className)}>
            {label && (
                <label htmlFor={selectId} className={styles.label}>
                    {label}
                </label>
            )}
            <div className={styles.selectWrapper}>
                <select
                    id={selectId}
                    className={clsx(styles.select, error && styles.hasError)}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className={styles.chevron}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>
            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    );
};
