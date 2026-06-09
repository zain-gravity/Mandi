import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useSession } from 'next-auth/react';
import { generateTradeToken, buildWhatsAppShareURL } from '@/lib/services/whatsappShare';

interface TradeDetailsModalProps {
  isOpen: boolean;
  tradeId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const TradeDetailsModal: React.FC<TradeDetailsModalProps> = ({ isOpen, tradeId, onClose, onSuccess }) => {
  const { data: session } = useSession();
  const [trade, setTrade] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen && tradeId) {
      setLoading(true);
      fetch(`/api/trades/${tradeId}`)
        .then(res => res.json())
        .then(data => {
          setTrade(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [isOpen, tradeId]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this DRAFT trade?')) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/trades/${tradeId}`, { method: 'DELETE' });
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!confirm('Submit this trade for Maker-Checker approval?')) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/trades/${tradeId}/submit`, { method: 'POST' });
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to submit');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveDeny = async (action: 'APPROVE' | 'DENY') => {
    let remarks = '';
    if (action === 'DENY') {
      const input = prompt('Please enter a reason for rejection:');
      if (input === null) return; // cancelled
      if (input.trim() === '') {
        alert('Remarks are required to deny a trade.');
        return;
      }
      remarks = input;
    } else {
      if (!confirm('Are you sure you want to APPROVE this trade?')) return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/trades/${tradeId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, remarks })
      });
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || `Failed to ${action.toLowerCase()}`);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const labelStyle = { color: 'var(--text-secondary)', fontSize: '0.85rem' };
  const valueStyle = { color: 'var(--text-primary)', fontWeight: 500, fontSize: '1rem', marginTop: '4px' };

  const currentUserId = (session?.user as any)?.id;
  const currentUserRole = (session?.user as any)?.role;
  const isMaker = trade?.createdBy === currentUserId;
  const canApprove = (currentUserRole === 'COMPANY_ADMIN' || currentUserRole === 'SUPER_ADMIN') && !isMaker;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={trade ? `Trade: ${trade.tradeNumber}` : 'Loading...'} size="lg">
      {loading || !trade ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Trade Details...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', background: 'var(--bg-elevated)', padding: '16px', borderRadius: '8px' }}>
            <div><div style={labelStyle}>Status</div><div style={{ ...valueStyle, color: 'var(--accent-indigo)' }}>{trade.status}</div></div>
            <div><div style={labelStyle}>Trade Date</div><div style={valueStyle}>{new Date(trade.tradeDate).toLocaleDateString()}</div></div>
            <div><div style={labelStyle}>Created At</div><div style={valueStyle}>{new Date(trade.createdAt).toLocaleString()}</div></div>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '12px' }}>Sourcing Information</h4>
            {trade.sourceLines?.map((line: any, idx: number) => (
              <div key={idx} style={{ border: '1px solid var(--border)', padding: '16px', borderRadius: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div><div style={labelStyle}>Commodity</div><div style={valueStyle}>{line.commodityName}</div></div>
                  <div><div style={labelStyle}>Farmer</div><div style={valueStyle}>{line.farmerName || 'Unknown'}</div></div>
                  <div><div style={labelStyle}>Quantity</div><div style={valueStyle}>{line.quantityKg?.$numberDecimal || line.quantityKg || '0'} kg</div></div>
                  <div><div style={labelStyle}>Purchase Cost</div><div style={valueStyle}>₹ {line.totalPurchaseCost?.$numberDecimal || line.totalPurchaseCost || '0'}</div></div>
                </div>
              </div>
            ))}
            {(!trade.sourceLines || trade.sourceLines.length === 0) && <p style={labelStyle}>No sourcing lines available.</p>}
          </div>

          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '12px' }}>Logistics</h4>
            <div style={{ border: '1px solid var(--border)', padding: '16px', borderRadius: '8px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
               <div><div style={labelStyle}>Vehicle</div><div style={valueStyle}>{trade.logistics?.vehicleType || 'N/A'}</div></div>
               <div><div style={labelStyle}>Driver</div><div style={valueStyle}>{trade.logistics?.driverName || 'N/A'}</div></div>
               <div><div style={labelStyle}>Freight Cost</div><div style={valueStyle}>₹ {trade.logistics?.freightCost?.$numberDecimal || trade.logistics?.freightCost || '0'}</div></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            
            {/* Contextual Messages */}
            <div>
              {trade.status === 'WAITING_FOR_APPROVAL' && !canApprove && (
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {isMaker ? 'Waiting for a different Admin to approve your trade.' : 'Pending Admin Approval.'}
                </span>
              )}
            </div>

            {/* PDF and WhatsApp Export (Always visible once saved) */}
            {trade.status !== 'DRAFT' && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button variant="secondary" onClick={() => {
                  window.open(`/api/trades/${trade._id}/pdf?token=${generateTradeToken(trade._id)}`, '_blank');
                }}>
                  View PDF
                </Button>
                <Button style={{ background: '#25D366', color: 'white' }} onClick={() => {
                  const url = buildWhatsAppShareURL(trade, window.location.origin);
                  window.open(url, '_blank');
                }}>
                  Share via WhatsApp
                </Button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="secondary" onClick={onClose}>Close</Button>
              
              {/* DRAFT Actions */}
              {trade.status === 'DRAFT' && (
                <Button variant="danger" onClick={handleDelete} disabled={isProcessing}>
                  Delete Draft
                </Button>
              )}
              {trade.status === 'DRAFT' && (
                <Button onClick={handleSubmitForApproval} disabled={isProcessing}>
                  Submit for Approval
                </Button>
              )}

              {/* WAITING_FOR_APPROVAL Actions (Checker Only) */}
              {trade.status === 'WAITING_FOR_APPROVAL' && canApprove && (
                <>
                  <Button variant="danger" onClick={() => handleApproveDeny('DENY')} disabled={isProcessing}>
                    Reject
                  </Button>
                  <Button onClick={() => handleApproveDeny('APPROVE')} disabled={isProcessing}>
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>

        </div>
      )}
    </Modal>
  );
};
