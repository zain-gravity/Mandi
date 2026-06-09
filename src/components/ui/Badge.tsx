import React from 'react';
import styles from './Badge.module.css';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  pulse = false,
  className = '',
  ...props
}) => {
  const classNames = [
    styles.badge,
    styles[variant],
    styles[size],
    pulse ? styles.pulse : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classNames} {...props}>
      {pulse && <span className={styles.dot} />}
      {children}
    </span>
  );
};
