'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { Modal } from '@/components/ui/Modal';

export default function AdminDashboardPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    licenseType: 'TRIAL',
    adminName: '',
    adminPhone: '',
    adminPassword: ''
  });

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/tenants');
      const data = await res.json();
      if (res.ok) setTenants(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        fetchTenants();
        setFormData({ name: '', slug: '', licenseType: 'TRIAL', adminName: '', adminPhone: '', adminPassword: '' });
      } else {
        alert(data.error || 'Failed to create tenant');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { header: 'Tenant Name', accessorKey: 'name' as keyof typeof tenants[0] },
    { header: 'Slug', accessorKey: 'slug' as keyof typeof tenants[0] },
    { 
      header: 'License', 
      accessorKey: 'license' as keyof typeof tenants[0],
      cell: (row: any) => <span style={{ fontWeight: 600, color: 'var(--accent-indigo)' }}>{row.license}</span>
    },
    { header: 'Users', accessorKey: 'users' as keyof typeof tenants[0], align: 'right' as const },
    { 
      header: 'Status', 
      accessorKey: 'status' as keyof typeof tenants[0],
      cell: (row: any) => (
        <Badge variant={row.status === 'ACTIVE' ? 'success' : 'error'}>
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      cell: () => <Button variant="ghost" size="sm" onClick={() => alert("Tenant management interface coming soon.")}>Manage</Button>,
      align: 'right' as const
    }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        <StatCard title="Total Tenants" value={tenants.length.toString()} glowColor="emerald" />
        <StatCard title="Active Users" value={tenants.reduce((sum, t) => sum + t.users, 0).toString()} glowColor="none" />
        <StatCard title="MRR" value="$0" glowColor="amber" />
      </div>

      <Card>
        <div className="flex-between" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: 0 }}>Registered Companies</h3>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>Provision New Tenant</Button>
        </div>

        {loading ? (
          <p>Loading tenants...</p>
        ) : (
          <Table 
            data={tenants}
            columns={columns}
            keyExtractor={(item) => item.id}
          />
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Provision New Tenant">
        <form onSubmit={handleCreateTenant} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Company Name</label>
            <input 
              required 
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'var(--text-primary)' }}
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>URL Slug (e.g. fresh-farms)</label>
            <input 
              required 
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'var(--text-primary)' }}
              value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase()})} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>License Type</label>
            <select 
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'var(--text-primary)' }}
              value={formData.licenseType} onChange={(e) => setFormData({...formData, licenseType: e.target.value})}
            >
              <option value="TRIAL">TRIAL</option>
              <option value="BASIC">BASIC</option>
              <option value="PRO">PRO</option>
              <option value="ENTERPRISE">ENTERPRISE</option>
            </select>
          </div>

          <h4 style={{ margin: '8px 0 0', color: 'var(--text-primary)' }}>Initial Admin User</h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Admin Name</label>
            <input 
              required 
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'var(--text-primary)' }}
              value={formData.adminName} onChange={(e) => setFormData({...formData, adminName: e.target.value})} 
            />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Admin Phone</label>
              <input 
                required 
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'var(--text-primary)' }}
                value={formData.adminPhone} onChange={(e) => setFormData({...formData, adminPhone: e.target.value})} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Admin Password</label>
              <input 
                required type="password"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'var(--text-primary)' }}
                value={formData.adminPassword} onChange={(e) => setFormData({...formData, adminPassword: e.target.value})} 
              />
            </div>
          </div>

          <Button style={{ marginTop: '16px' }} disabled={isSubmitting}>
            {isSubmitting ? 'Provisioning...' : 'Provision Tenant'}
          </Button>

        </form>
      </Modal>

    </div>
  );
}
