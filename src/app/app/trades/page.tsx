'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CreateTradeModal } from '@/components/trades/CreateTradeModal';
import { TradeDetailsModal } from '@/components/trades/TradeDetailsModal';

export default function TradesPage() {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const [detailsTradeId, setDetailsTradeId] = useState<string | null>(null);

  const fetchTrades = async () => {
    try {
      const res = await fetch('/api/trades');
      const data = await res.json();
      if (res.ok) setTrades(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const filteredTrades = trades.filter((t) => {
    const matchesSearch = 
      t.tradeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.source.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { header: 'Trade #', accessorKey: 'tradeNumber' as keyof typeof trades[0] },
    { header: 'Date', accessorKey: 'date' as keyof typeof trades[0] },
    { header: 'Commodity', accessorKey: 'commodity' as keyof typeof trades[0] },
    { header: 'Source', accessorKey: 'source' as keyof typeof trades[0] },
    { header: 'Quantity', accessorKey: 'qty' as keyof typeof trades[0], align: 'right' as const },
    { header: 'Gross Sale', accessorKey: 'grossSale' as keyof typeof trades[0], align: 'right' as const },
    { header: 'Net Profit', accessorKey: 'netProfit' as keyof typeof trades[0], align: 'right' as const },
    { 
      header: 'Status', 
      accessorKey: 'status' as keyof typeof trades[0],
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
      cell: (row: any) => (
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDetailsTradeId(row.id); }}>
          View
        </Button>
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
        <Button iconLeft={<span style={{ fontSize: '1.2rem' }}>+</span>} onClick={() => setIsCreateOpen(true)}>
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

        {loading ? (
           <p style={{ color: 'var(--text-secondary)' }}>Loading trades...</p>
        ) : filteredTrades.length === 0 ? (
           <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '8px' }}>
             <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>No trades found matching your criteria.</p>
             <Button onClick={() => setIsCreateOpen(true)}>Create First Trade</Button>
           </div>
        ) : (
          <Table 
            data={filteredTrades}
            columns={columns}
            keyExtractor={(item) => item.id}
            onRowClick={(item) => setDetailsTradeId(item.id)}
          />
        )}
      </Card>

      <CreateTradeModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSuccess={fetchTrades} 
      />

      <TradeDetailsModal
        isOpen={!!detailsTradeId}
        tradeId={detailsTradeId}
        onClose={() => setDetailsTradeId(null)}
        onSuccess={fetchTrades}
      />

    </div>
  );
}
