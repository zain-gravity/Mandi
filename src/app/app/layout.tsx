'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/ui/Sidebar';
import { Header } from '@/components/ui/Header';

// Icons
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const TradeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8V21H3V8"/>
    <path d="M1 3h22v5H1z"/>
    <path d="M10 12h4"/>
  </svg>
);

const LedgerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
  </svg>
);

const ApprovalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <div className="flex-center" style={{ height: '100vh' }}>Loading...</div>;
  }

  if (!session) {
    // Middleware handles redirection, but just in case
    router.push('/login');
    return null;
  }

  const user = session.user as any;
  const isCompanyAdmin = user.role === 'COMPANY_ADMIN';

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <HomeIcon />, isActive: true },
    { label: 'Trades', href: '/trades', icon: <TradeIcon /> },
    { label: 'Ledger', href: '/ledger', icon: <LedgerIcon /> },
    ...(isCompanyAdmin ? [{ label: 'Approvals', href: '/approvals', icon: <ApprovalIcon /> }] : []),
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar items={navItems} companyName={user.companyName || 'My Company'} />
      
      <main style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column' }}>
        <Header 
          title="Dashboard" 
          userName={user.name || 'User'} 
          role={user.role} 
          onLogout={() => signOut({ callbackUrl: '/login' })}
        />
        
        <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
