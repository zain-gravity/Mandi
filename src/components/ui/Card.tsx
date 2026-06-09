import React from 'react';
import styles from './Card.module.css';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'stat' | 'action';
  glowColor?: 'emerald' | 'amber' | 'indigo' | 'none';
  noPadding?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      glowColor = 'none',
      noPadding = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const classNames = [
      styles.card,
      styles[variant],
      styles[`glow-${glowColor}`],
      noPadding ? styles.noPadding : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classNames} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
