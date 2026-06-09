'use client';

import React from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';

export default function DashboardPage() {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <StatCard 
          title="Total Gross Sale (Today)" 
          value="₹ 4.2L" 
          trend={12.5} 
          glowColor="emerald"
        />
        <StatCard 
          title="Net Profit (Today)" 
          value="₹ 45,000" 
          trend={8.2} 
          glowColor="amber"
        />
        <StatCard 
          title="Active Peshgi" 
          value="₹ 1.8L" 
          trend={-2.1} 
          glowColor="indigo"
        />
        <StatCard 
          title="Pending Approvals" 
          value="12" 
          glowColor="none"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <Card>
          <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Recent Trades</h3>
          {(() => {
            const recentTrades = [
              { id: 'TRD-001', date: '2026-06-09', commodity: 'Tomato', gross: '₹ 45,000', status: 'WAITING_FOR_APPROVAL' },
              { id: 'TRD-002', date: '2026-06-08', commodity: 'Onion', gross: '₹ 1,20,000', status: 'APPROVED' },
              { id: 'TRD-003', date: '2026-06-08', commodity: 'Potato', gross: '₹ 80,000', status: 'SETTLED' },
            ];
            type TradeData = typeof recentTrades[number];
            return (
              <Table 
                data={recentTrades}
                columns={[
                  { header: 'Trade #', accessorKey: 'id' as keyof TradeData },
                  { header: 'Date', accessorKey: 'date' as keyof TradeData },
                  { header: 'Commodity', accessorKey: 'commodity' as keyof TradeData },
                  { header: 'Gross Sale', accessorKey: 'gross' as keyof TradeData, align: 'right' as const },
                  { 
                    header: 'Status', 
                    accessorKey: 'status' as keyof TradeData,
                    cell: (row: any) => (
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '4px 8px', 
                        borderRadius: '99px',
                        background: row.status === 'APPROVED' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                        color: row.status === 'APPROVED' ? '#34d399' : '#fbbf24'
                      }}>
                        {row.status.replace(/_/g, ' ')}
                      </span>
                    )
                  },
                ]}
                keyExtractor={(item) => item.id}
              />
            );
          })()}
        </Card>

        <Card glowColor="indigo">
          <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="glass flex-between" style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)', color: 'white', cursor: 'pointer', background: 'rgba(255,255,255,0.05)' }}>
              <span>Create New Trade</span>
              <span>→</span>
            </button>
            <button className="glass flex-between" style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)', color: 'white', cursor: 'pointer', background: 'rgba(255,255,255,0.05)' }}>
              <span>Issue Peshgi</span>
              <span>→</span>
            </button>
            <button className="glass flex-between" style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)', color: 'white', cursor: 'pointer', background: 'rgba(255,255,255,0.05)' }}>
              <span>Add Master Item</span>
              <span>→</span>
            </button>
          </div>
        </Card>
      </div>

    </div>
  );
}
