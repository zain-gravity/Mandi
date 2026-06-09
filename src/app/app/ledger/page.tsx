'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';

export default function LedgerPage() {
  const [peshgi, setPeshgi] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'PESHGI' | 'RECEIVABLES' | 'PAYABLES'>('PESHGI');

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'PESHGI') {
        const res = await fetch('/api/peshgi');
        setPeshgi(await res.json());
      } else {
        const type = tab === 'RECEIVABLES' ? 'RECEIVABLE' : 'PAYABLE';
        const res = await fetch(`/api/ledger?type=${type}`);
        setLedger(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (tab === 'PESHGI') {
      const name = prompt('Recipient Name:');
      const amount = prompt('Advance Amount (₹):');
      if (!name || !amount) return;

      const res = await fetch('/api/peshgi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: name,
          recipientType: 'DRIVER',
          advanceAmount: amount
        })
      });
      if (res.ok) fetchData();
    } else {
      const name = prompt('Entity Name:');
      const amount = prompt('Amount (₹):');
      if (!name || !amount) return;

      const type = tab === 'RECEIVABLES' ? 'RECEIVABLE' : 'PAYABLE';
      const res = await fetch('/api/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityName: name,
          entityType: 'OTHER',
          type,
          amount
        })
      });
      if (res.ok) fetchData();
    }
  };

  const formatCurrency = (val: number) => `₹ ${val.toLocaleString('en-IN')}`;

  const renderContent = () => {
    if (tab === 'PESHGI') {
      return (
        <Table
          data={peshgi}
          keyExtractor={(r: any) => r._id}
          columns={[
            { header: 'Date', accessorKey: 'givenAt', cell: (r: any) => new Date(r.givenAt).toLocaleDateString() },
            { header: 'Recipient', accessorKey: 'recipientName' },
            { header: 'Type', accessorKey: 'recipientType' },
            { header: 'Advance', accessorKey: 'advanceAmount', cell: (r: any) => formatCurrency(r.advanceAmount) },
            { header: 'Balance', accessorKey: 'remainingBalance', cell: (r: any) => formatCurrency(r.remainingBalance) },
            { header: 'Status', accessorKey: 'status' },
            { header: 'Approval', accessorKey: 'approvalStatus' },
          ]}
        />
      );
    }

    return (
      <Table
        data={ledger}
        keyExtractor={(r: any) => r._id}
        columns={[
          { header: 'Created', accessorKey: 'createdAt', cell: (r: any) => new Date(r.createdAt).toLocaleDateString() },
          { header: 'Entity', accessorKey: 'entityName' },
          { header: 'Amount', accessorKey: 'amount', cell: (r: any) => formatCurrency(r.amount) },
          { header: 'Balance', accessorKey: 'balanceAmount', cell: (r: any) => formatCurrency(r.balanceAmount) },
          { header: 'Due Date', accessorKey: 'dueDate', cell: (r: any) => r.dueDate ? new Date(r.dueDate).toLocaleDateString() : 'N/A' },
          { header: 'Status', accessorKey: 'status' },
        ]}
      />
    );
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Financial Ledger</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage Peshgi advances and accounts receivable/payable.</p>
        </div>
        <Button onClick={handleCreate}>
          + New {tab === 'PESHGI' ? 'Advance' : 'Entry'}
        </Button>
      </div>

      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
        <Button variant={tab === 'PESHGI' ? 'primary' : 'ghost'} onClick={() => setTab('PESHGI')}>Peshgi (Advances)</Button>
        <Button variant={tab === 'RECEIVABLES' ? 'primary' : 'ghost'} onClick={() => setTab('RECEIVABLES')}>Receivables (Aging)</Button>
        <Button variant={tab === 'PAYABLES' ? 'primary' : 'ghost'} onClick={() => setTab('PAYABLES')}>Payables</Button>
      </div>

      <Card>
        {loading ? <p>Loading data...</p> : renderContent()}
      </Card>

    </div>
  );
}
