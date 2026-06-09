import React from 'react';
import styles from './Header.module.css';

interface HeaderProps {
  title: string;
  userName: string;
  role: string;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, userName, role, onLogout }) => {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      
      <div className={styles.actions}>
        <button className={styles.notificationBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.73 21A2 2 0 0 1 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className={styles.badge}>3</span>
        </button>

        <div className={styles.divider} />

        <div className={styles.userProfile}>
          <div className={styles.avatar}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{userName}</span>
            <span className={styles.userRole}>{role.replace('_', ' ')}</span>
          </div>
        </div>

        <button className={styles.logoutBtn} onClick={onLogout} title="Logout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </header>
  );
};
