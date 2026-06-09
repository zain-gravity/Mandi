import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface CreateTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateTradeModal: React.FC<CreateTradeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    tradeDate: new Date().toISOString().split('T')[0],
    commodityName: '',
    sourceCityName: '',
    farmerName: '',
    quantityKg: '',
    purchasePricePerKg: '',
    vehicleType: '',
    driverName: '',
    freightCost: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Construct the nested Trade object based on the Mongoose schema
    const payload = {
      tradeDate: formData.tradeDate,
      sourceLines: [
        {
          commodityName: formData.commodityName,
          sourceCityName: formData.sourceCityName,
          farmerName: formData.farmerName,
          quantityKg: formData.quantityKg || '0',
          purchasePricePerKg: formData.purchasePricePerKg || '0',
          totalPurchaseCost: (parseFloat(formData.quantityKg || '0') * parseFloat(formData.purchasePricePerKg || '0')).toString(),
          gradingSplits: [] // Empty for MVP phase 1
        }
      ],
      logistics: {
        vehicleType: formData.vehicleType,
        driverName: formData.driverName,
        freightCost: formData.freightCost || '0'
      },
      expenses: [],
      peshgiDeductions: [],
      financials: {
        totalSourceCost: (parseFloat(formData.quantityKg || '0') * parseFloat(formData.purchasePricePerKg || '0')).toString(),
        totalGrossSale: '0',
        totalAPMCTax: '0',
        totalNetSale: '0',
        totalFreightAndExpenses: formData.freightCost || '0',
        totalCapitalDeployed: '0',
        grossProfit: '0',
        netProfitAfterPeshgi: '0'
      }
    };

    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        onSuccess();
        onClose();
        setStep(1);
        setFormData({
          tradeDate: new Date().toISOString().split('T')[0],
          commodityName: '', sourceCityName: '', farmerName: '', quantityKg: '',
          purchasePricePerKg: '', vehicleType: '', driverName: '', freightCost: ''
        });
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create trade');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formInputStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'var(--text-primary)', width: '100%' };
  const labelStyle = { fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Trade" size="md">
      <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); setStep(2); }}>
        
        {/* STEP 1: Basic & Sourcing */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Trade Date</label>
              <input required type="date" style={formInputStyle} value={formData.tradeDate} onChange={e => handleChange('tradeDate', e.target.value)} />
            </div>
            
            <h4 style={{ color: 'var(--text-primary)', marginTop: '8px' }}>Sourcing Details</h4>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Commodity</label>
                <input required placeholder="e.g. Tomato" style={formInputStyle} value={formData.commodityName} onChange={e => handleChange('commodityName', e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Source City</label>
                <input required placeholder="e.g. Nashik" style={formInputStyle} value={formData.sourceCityName} onChange={e => handleChange('sourceCityName', e.target.value)} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Farmer Name</label>
              <input placeholder="e.g. Ramesh Patel" style={formInputStyle} value={formData.farmerName} onChange={e => handleChange('farmerName', e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Quantity (Kg)</label>
                <input required type="number" placeholder="0" style={formInputStyle} value={formData.quantityKg} onChange={e => handleChange('quantityKg', e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Purchase Price (₹/Kg)</label>
                <input required type="number" placeholder="0.00" style={formInputStyle} value={formData.purchasePricePerKg} onChange={e => handleChange('purchasePricePerKg', e.target.value)} />
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <Button type="submit">Next: Logistics →</Button>
            </div>
          </div>
        )}

        {/* STEP 2: Logistics */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ color: 'var(--text-primary)' }}>Freight & Logistics</h4>
            
            <div>
              <label style={labelStyle}>Vehicle Type</label>
              <select required style={formInputStyle} value={formData.vehicleType} onChange={e => handleChange('vehicleType', e.target.value)}>
                <option value="">Select Vehicle</option>
                <option value="TATA_ACE">Tata Ace (1.5t)</option>
                <option value="BOLERO_PICKUP">Bolero Pickup (1.7t)</option>
                <option value="EICHER_14FT">Eicher 14ft (5t)</option>
                <option value="TRUCK_10_WHEELER">10 Wheeler Truck (16t)</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Driver Name (Optional)</label>
              <input placeholder="e.g. Suresh Kumar" style={formInputStyle} value={formData.driverName} onChange={e => handleChange('driverName', e.target.value)} />
            </div>

            <div>
              <label style={labelStyle}>Total Freight Cost (₹)</label>
              <input required type="number" placeholder="0.00" style={formInputStyle} value={formData.freightCost} onChange={e => handleChange('freightCost', e.target.value)} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
              <Button variant="outline" type="button" onClick={() => setStep(1)}>← Back</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Draft Trade'}
              </Button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};
