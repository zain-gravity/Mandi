'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';

export default function LedgerPage() {
  const [ledgerType, setLedgerType] = useState('ALL');

  // Dummy Data
  const ledgerData = [
    { id: 'LDG-001', date: '2026-06-09', entity: 'Ramesh Transport', type: 'PAYABLE', amount: '₹ 15,000', status: 'PENDING', ref: 'TRD-2026-0001' },
    { id: 'LDG-002', date: '2026-06-08', entity: 'Suresh Farmers', type: 'PAYABLE', amount: '₹ 80,000', status: 'PAID', ref: 'TRD-2026-0002' },
    { id: 'LDG-003', date: '2026-06-08', entity: 'ABC Traders', type: 'RECEIVABLE', amount: '₹ 1,20,000', status: 'PENDING', ref: 'TRD-2026-0002' },
    { id: 'LDG-004', date: '2026-06-07', entity: 'Driver Raju', type: 'ASSET_RECEIVABLE', amount: '50 Crates', status: 'OVERDUE', ref: 'TRD-2026-0003' },
  ];

  type LedgerRow = typeof ledgerData[number];

  const columns = [
    { header: 'Date', accessorKey: 'date' as keyof LedgerRow },
    { header: 'Entity', accessorKey: 'entity' as keyof LedgerRow },
    { 
      header: 'Type', 
      accessorKey: 'type' as keyof LedgerRow,
      cell: (row: any) => {
        let color = 'var(--text-secondary)';
        if (row.type.includes('RECEIVABLE')) color = 'var(--accent-emerald)';
        if (row.type.includes('PAYABLE')) color = 'var(--accent-red)';
        return <span style={{ color, fontWeight: 500, fontSize: '0.8rem' }}>{row.type.replace('_', ' ')}</span>;
      }
    },
    { header: 'Amount / Qty', accessorKey: 'amount' as keyof LedgerRow, align: 'right' as const },
    { header: 'Ref Trade', accessorKey: 'ref' as keyof LedgerRow },
    { 
      header: 'Status', 
      accessorKey: 'status' as keyof LedgerRow,
      cell: (row: any) => {
        let variant: 'error' | 'success' | 'warning' | 'neutral' = 'neutral';
        if (row.status === 'PENDING') variant = 'warning';
        if (row.status === 'PAID') variant = 'success';
        if (row.status === 'OVERDUE') variant = 'error';
        
        return <Badge variant={variant}>{row.status}</Badge>;
      }
    },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className="flex-between">
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Financial Ledger</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Track receivables, payables, and asset inventory.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        <StatCard title="Total Receivables" value="₹ 3.5L" glowColor="emerald" />
        <StatCard title="Total Payables" value="₹ 1.2L" glowColor="amber" />
        <StatCard title="Overdue" value="₹ 45k" glowColor="none" />
      </div>

      <Card>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '250px' }}>
            <Select 
              options={[
                { label: 'All Entries', value: 'ALL' },
                { label: 'Receivables Only', value: 'RECEIVABLE' },
                { label: 'Payables Only', value: 'PAYABLE' },
                { label: 'Assets (Crates/Bags)', value: 'ASSET' },
              ]}
              value={ledgerType}
              onChange={setLedgerType}
            />
          </div>
        </div>

        <Table 
          data={ledgerData}
          columns={columns}
          keyExtractor={(item) => item.id}
        />
      </Card>

    </div>
  );
}
