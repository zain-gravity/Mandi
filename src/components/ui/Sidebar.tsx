import React from 'react';
import styles from './Sidebar.module.css';
import Link from 'next/link';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

interface SidebarProps {
  items: NavItem[];
  companyName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, companyName }) => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logo}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className={styles.companyInfo}>
          <span className={styles.companyName}>{companyName}</span>
          <span className={styles.productName}>Mandi SaaS</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {items.map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
            className={`${styles.navItem} ${item.isActive ? styles.active : ''}`}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.statusDot} />
        <span className={styles.statusText}>System Online</span>
      </div>
    </aside>
  );
};
