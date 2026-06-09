import React from 'react';
import styles from './Select.module.css';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: Option[];
  error?: string;
  onChange?: (value: string) => void;
  containerClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      className = '',
      containerClassName = '',
      id,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = id || React.useId();

    return (
      <div className={`${styles.container} ${containerClassName}`}>
        {label && (
          <label htmlFor={generatedId} className={styles.label}>
            {label}
          </label>
        )}
        <div className={styles.selectWrapper}>
          <select
            id={generatedId}
            ref={ref}
            className={`${styles.select} ${error ? styles.errorSelect : ''} ${className}`}
            onChange={(e) => onChange?.(e.target.value)}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className={styles.chevron}>
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
