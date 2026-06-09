import React from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  iconPrefix?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      iconPrefix,
      className = '',
      containerClassName = '',
      id,
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
        <div className={styles.inputWrapper}>
          {iconPrefix && <div className={styles.iconPrefix}>{iconPrefix}</div>}
          <input
            id={generatedId}
            ref={ref}
            className={`
              ${styles.input} 
              ${iconPrefix ? styles.withIcon : ''} 
              ${error ? styles.errorInput : ''} 
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
