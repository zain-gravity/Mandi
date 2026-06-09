'use client';

import React, { useEffect, useState } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/bi')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const formatCurrency = (val: number) => `₹ ${val.toLocaleString('en-IN')}`;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <StatCard 
          title="Total Gross Sale (Today)" 
          value={loading ? '...' : formatCurrency(data?.stats?.todayGross || 0)} 
          trend={loading ? 0 : (data?.stats?.todayGross > 0 ? 12.5 : 0)} 
          glowColor="emerald"
        />
        <StatCard 
          title="Net Profit (Today)" 
          value={loading ? '...' : formatCurrency(data?.stats?.todayNet || 0)} 
          trend={loading ? 0 : (data?.stats?.todayNet > 0 ? 8.2 : 0)} 
          glowColor="amber"
        />
        <StatCard 
          title="Active Peshgi" 
          value="₹ 1,80,000" 
          trend={-2.1} 
          glowColor="indigo"
        />
        <StatCard 
          title="Pending Approvals" 
          value={loading ? '...' : `${data?.stats?.pendingCount || 0}`} 
          glowColor={data?.stats?.pendingCount > 0 ? "amber" : "none"}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <Card>
          <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Net Realization Trend (%)</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Measures the percentage of Gross Sale retained as Net Profit.
          </p>
          <div style={{ height: '300px', width: '100%' }}>
            {loading ? <p>Loading chart...</p> : data?.realizationTrend?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.realizationTrend}>
                  <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--accent-emerald)' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="var(--accent-emerald)" strokeWidth={3} dot={{ r: 4, fill: 'var(--accent-emerald)' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                No recent settled trades to display.
              </div>
            )}
          </div>
        </Card>

        <Card glowColor="indigo">
          <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={() => router.push('/app/trades')} className="glass flex-between" style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)', color: 'white', cursor: 'pointer', background: 'rgba(255,255,255,0.05)' }}>
              <span>Go to Trades</span>
              <span>→</span>
            </button>
            <button onClick={() => router.push('/app/ledger')} className="glass flex-between" style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)', color: 'white', cursor: 'pointer', background: 'rgba(255,255,255,0.05)' }}>
              <span>Peshgi Ledger</span>
              <span>→</span>
            </button>
            <button onClick={async () => {
              const res = await fetch('/api/seed-mock');
              const d = await res.json();
              alert(d.message || d.error);
              window.location.reload();
            }} className="glass flex-between" style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)', color: 'var(--accent-amber)', cursor: 'pointer', background: 'rgba(255,255,255,0.05)' }}>
              <span>Seed Mock Data (Dev)</span>
              <span>⚡</span>
            </button>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <Card>
          <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Freight Benchmark (₹ / Kg)</h3>
          <div style={{ height: '300px', width: '100%' }}>
             {loading ? <p>Loading...</p> : data?.freightBenchmark?.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={data.freightBenchmark} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" stroke="var(--text-secondary)" fontSize={12} />
                    <YAxis type="category" dataKey="vehicleType" stroke="var(--text-secondary)" fontSize={12} />
                    <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                    <Bar dataKey="avgCostPerKg" fill="var(--accent-indigo)" radius={[0, 4, 4, 0]} barSize={24} />
                 </BarChart>
               </ResponsiveContainer>
             ) : <p style={{ color: 'var(--text-secondary)' }}>No freight data available.</p>}
          </div>
        </Card>

        <Card>
          <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Commodity Price Heatmap (Max ₹/Kg)</h3>
          <div style={{ height: '300px', width: '100%' }}>
             {loading ? <p>Loading...</p> : data?.priceHeatmap?.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={data.priceHeatmap}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="commodity" stroke="var(--text-secondary)" fontSize={12} />
                    <YAxis stroke="var(--text-secondary)" fontSize={12} />
                    <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                    <Bar dataKey="maxPrice" fill="var(--accent-rose)" radius={[4, 4, 0, 0]} barSize={32} />
                 </BarChart>
               </ResponsiveContainer>
             ) : <p style={{ color: 'var(--text-secondary)' }}>No pricing data available.</p>}
          </div>
        </Card>
      </div>

    </div>
  );
}
