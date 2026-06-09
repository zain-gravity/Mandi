import React from 'react';
import styles from './StatCard.module.css';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number; // Positive or negative percentage
  icon?: React.ReactNode;
  glowColor?: 'emerald' | 'amber' | 'indigo' | 'none';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  icon,
  glowColor = 'emerald',
}) => {
  return (
    <div className={`${styles.statCard} ${styles[`glow-${glowColor}`]}`}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        {icon && <div className={styles.icon}>{icon}</div>}
      </div>
      
      <div className={styles.content}>
        <span className={styles.value}>{value}</span>
      </div>

      {trend !== undefined && (
        <div className={styles.footer}>
          <span className={`${styles.trend} ${trend >= 0 ? styles.positive : styles.negative}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className={styles.period}>vs last month</span>
        </div>
      )}
    </div>
  );
};
