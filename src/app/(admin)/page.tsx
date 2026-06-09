'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';

export default function AdminDashboardPage() {

  const tenantsData = [
    { id: 'T-001', name: 'Fresh Farms Logistics', slug: 'fresh-farms', license: 'PRO', status: 'ACTIVE', users: 12 },
    { id: 'T-002', name: 'ABC Produce Traders', slug: 'abc-produce', license: 'BASIC', status: 'ACTIVE', users: 4 },
    { id: 'T-003', name: 'Nashik Onion Co', slug: 'nashik-onion', license: 'ENTERPRISE', status: 'ACTIVE', users: 38 },
    { id: 'T-004', name: 'Trial User Co', slug: 'trial-user', license: 'TRIAL', status: 'EXPIRED', users: 1 },
  ];

  type Tenant = typeof tenantsData[number];

  const columns = [
    { header: 'Tenant Name', accessorKey: 'name' as keyof Tenant },
    { header: 'Slug', accessorKey: 'slug' as keyof Tenant },
    { 
      header: 'License', 
      accessorKey: 'license' as keyof Tenant,
      cell: (row: any) => <span style={{ fontWeight: 600, color: 'var(--accent-indigo)' }}>{row.license}</span>
    },
    { header: 'Users', accessorKey: 'users' as keyof Tenant, align: 'right' as const },
    { 
      header: 'Status', 
      accessorKey: 'status' as keyof Tenant,
      cell: (row: any) => (
        <Badge variant={row.status === 'ACTIVE' ? 'success' : 'error'}>
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      cell: () => <Button variant="ghost" size="sm">Manage</Button>,
      align: 'right' as const
    }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        <StatCard title="Total Tenants" value="4" glowColor="emerald" />
        <StatCard title="Active Users" value="55" glowColor="none" />
        <StatCard title="MRR" value="$1,240" glowColor="amber" />
      </div>

      <Card>
        <div className="flex-between" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: 0 }}>Registered Companies</h3>
          <Button size="sm">Provision New Tenant</Button>
        </div>

        <Table 
          data={tenantsData}
          columns={columns}
          keyExtractor={(item) => item.id}
        />
      </Card>

    </div>
  );
}
