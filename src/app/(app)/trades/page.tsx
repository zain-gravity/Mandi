'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export default function TradesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Dummy data for visual representation
  const tradesData = [
    { id: 'TRD-2026-0001', date: '2026-06-09', commodity: 'Tomato', source: 'Nashik', qty: '1200 kg', grossSale: '₹ 45,000', netProfit: '₹ 4,200', status: 'WAITING_FOR_APPROVAL' },
    { id: 'TRD-2026-0002', date: '2026-06-08', commodity: 'Onion', source: 'Lasalgaon', qty: '4500 kg', grossSale: '₹ 1,20,000', netProfit: '₹ 12,500', status: 'APPROVED' },
    { id: 'TRD-2026-0003', date: '2026-06-08', commodity: 'Potato', source: 'Agra', qty: '3000 kg', grossSale: '₹ 80,000', netProfit: '₹ 7,800', status: 'SETTLED' },
    { id: 'TRD-2026-0004', date: '2026-06-07', commodity: 'Garlic', source: 'Mandsaur', qty: '800 kg', grossSale: '₹ 65,000', netProfit: '₹ 9,000', status: 'SETTLED' },
    { id: 'TRD-2026-0005', date: '2026-06-06', commodity: 'Tomato', source: 'Nashik', qty: '1500 kg', grossSale: '₹ 55,000', netProfit: '₹ 5,100', status: 'DRAFT' },
  ];

  type TradeRow = typeof tradesData[number];

  const columns = [
    { header: 'Trade #', accessorKey: 'id' as keyof TradeRow },
    { header: 'Date', accessorKey: 'date' as keyof TradeRow },
    { header: 'Commodity', accessorKey: 'commodity' as keyof TradeRow },
    { header: 'Source', accessorKey: 'source' as keyof TradeRow },
    { header: 'Quantity', accessorKey: 'qty' as keyof TradeRow, align: 'right' as const },
    { header: 'Gross Sale', accessorKey: 'grossSale' as keyof TradeRow, align: 'right' as const },
    { header: 'Net Profit', accessorKey: 'netProfit' as keyof TradeRow, align: 'right' as const },
    { 
      header: 'Status', 
      accessorKey: 'status' as keyof TradeRow,
      cell: (row: any) => {
        let variant: 'warning' | 'success' | 'info' | 'neutral' = 'neutral';
        if (row.status === 'WAITING_FOR_APPROVAL') variant = 'warning';
        if (row.status === 'APPROVED') variant = 'success';
        if (row.status === 'SETTLED') variant = 'info';
        
        return (
          <Badge variant={variant} pulse={row.status === 'WAITING_FOR_APPROVAL'}>
            {row.status.replace(/_/g, ' ')}
          </Badge>
        );
      }
    },
    {
      header: 'Actions',
      cell: () => (
        <Button variant="ghost" size="sm">View</Button>
      ),
      align: 'right' as const
    }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className="flex-between">
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Trade Operations</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage and track all commodity trades.</p>
        </div>
        <Button iconLeft={<span style={{ fontSize: '1.2rem' }}>+</span>}>
          New Trade
        </Button>
      </div>

      <Card>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '240px' }}>
            <Input 
              placeholder="Search by Trade #, Commodity, or Source..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              iconPrefix={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              }
            />
          </div>
          <div style={{ width: '200px' }}>
            <Select 
              options={[
                { label: 'All Statuses', value: 'ALL' },
                { label: 'Draft', value: 'DRAFT' },
                { label: 'Waiting Approval', value: 'WAITING_FOR_APPROVAL' },
                { label: 'Approved', value: 'APPROVED' },
                { label: 'Settled', value: 'SETTLED' },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
        </div>

        <Table 
          data={tradesData}
          columns={columns}
          keyExtractor={(item) => item.id}
          onRowClick={(item) => console.log('Clicked', item)}
        />
      </Card>

    </div>
  );
}
