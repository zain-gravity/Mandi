import mongoose, { Schema, Document, Types } from 'mongoose';
import tenantPlugin from '../plugins/tenantPlugin';

// Sub-document Interfaces
export interface IGradeSplit {
  gradeName: string;
  quantityKg: Types.Decimal128;
  pricePerKg: Types.Decimal128;
  destinationCityId?: Types.ObjectId;
  destinationCityName?: string;
  buyerName?: string;
  buyerPhone?: string;
  apmcTaxPercentage?: Types.Decimal128;
  apmcTaxAmount?: Types.Decimal128;
  grossSaleAmount?: Types.Decimal128;
  netSaleAmount?: Types.Decimal128;
}

export interface ISourceLine {
  commodityId?: Types.ObjectId;
  commodityName?: string;
  farmerName?: string;
  farmerPhone?: string;
  sourceCityId?: Types.ObjectId;
  sourceCityName?: string;
  quantityKg: Types.Decimal128;
  purchasePricePerKg: Types.Decimal128;
  totalPurchaseCost: Types.Decimal128;
  gradingSplits: IGradeSplit[];
  transitLoss?: {
    lossKg: Types.Decimal128;
    lossPercentage: Types.Decimal128;
    adjustedNetCostPerKg: Types.Decimal128;
  };
}

export interface IExpenseLine {
  headId?: Types.ObjectId;
  headName?: string;
  amount: Types.Decimal128;
  paidTo?: string;
  notes?: string;
}

export interface IPeshgiDeduction {
  peshgiId?: Types.ObjectId;
  recipientName?: string;
  recipientType?: 'DRIVER' | 'FARMER' | 'HAMAL' | 'OTHER';
  advanceAmount: Types.Decimal128;
  deductedAmount: Types.Decimal128;
  remainingBalance: Types.Decimal128;
}

export interface ITrade extends Document {
  companyId: Types.ObjectId;
  tradeNumber: string;
  tradeDate: Date;
  status: 'DRAFT' | 'WAITING_FOR_APPROVAL' | 'APPROVED' | 'SETTLED' | 'CANCELLED';
  
  sourceLines: ISourceLine[];
  
  logistics: {
    vehicleId?: Types.ObjectId;
    vehicleNumber?: string;
    vehicleType?: string;
    driverName?: string;
    driverPhone?: string;
    routeId?: Types.ObjectId;
    routeDescription?: string;
    distanceKm?: number;
    freightCost?: Types.Decimal128;
    freightCostPerKg?: Types.Decimal128;
  };
  
  expenses: IExpenseLine[];
  totalExpenses?: Types.Decimal128;
  
  peshgiDeductions: IPeshgiDeduction[];
  totalPeshgiDeducted?: Types.Decimal128;
  
  financials?: {
    totalSourceCost: Types.Decimal128;
    totalGrossSale: Types.Decimal128;
    totalAPMCTax: Types.Decimal128;
    totalNetSale: Types.Decimal128;
    totalFreightAndExpenses: Types.Decimal128;
    totalCapitalDeployed: Types.Decimal128;
    grossProfit: Types.Decimal128;
    netProfitAfterPeshgi: Types.Decimal128;
  };
  
  settlement?: {
    capitalReturned: Types.Decimal128;
    fixedPayouts: Array<{
      partnerId: Types.ObjectId;
      partnerName: string;
      amount: Types.Decimal128;
    }>;
    profitSplits: Array<{
      partnerId: Types.ObjectId;
      partnerName: string;
      sharePercentage: Types.Decimal128;
      amount: Types.Decimal128;
    }>;
    totalDistributed: Types.Decimal128;
  };
  
  createdBy?: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  pdfUrl?: string;
  pdfGeneratedAt?: Date;
}

// Sub-schemas
const GradeSplitSchema = new Schema<IGradeSplit>({
  gradeName: { type: String, required: true },
  quantityKg: { type: Schema.Types.Decimal128 },
  pricePerKg: { type: Schema.Types.Decimal128 },
  destinationCityId: { type: Schema.Types.ObjectId, ref: 'MasterItem' },
  destinationCityName: String,
  buyerName: String,
  buyerPhone: String,
  apmcTaxPercentage: { type: Schema.Types.Decimal128 },
  apmcTaxAmount: { type: Schema.Types.Decimal128 },
  grossSaleAmount: { type: Schema.Types.Decimal128 },
  netSaleAmount: { type: Schema.Types.Decimal128 },
});

const SourceLineSchema = new Schema<ISourceLine>({
  commodityId: { type: Schema.Types.ObjectId, ref: 'MasterItem' },
  commodityName: String,
  farmerName: String,
  farmerPhone: String,
  sourceCityId: { type: Schema.Types.ObjectId, ref: 'MasterItem' },
  sourceCityName: String,
  quantityKg: { type: Schema.Types.Decimal128, required: true },
  purchasePricePerKg: { type: Schema.Types.Decimal128, required: true },
  totalPurchaseCost: { type: Schema.Types.Decimal128, required: true },
  gradingSplits: [GradeSplitSchema],
  transitLoss: {
    lossKg: { type: Schema.Types.Decimal128 },
    lossPercentage: { type: Schema.Types.Decimal128 },
    adjustedNetCostPerKg: { type: Schema.Types.Decimal128 },
  },
});

const ExpenseLineSchema = new Schema<IExpenseLine>({
  headId: { type: Schema.Types.ObjectId, ref: 'MasterItem' },
  headName: String,
  amount: { type: Schema.Types.Decimal128, required: true },
  paidTo: String,
  notes: String,
});

const PeshgiDeductionSchema = new Schema<IPeshgiDeduction>({
  peshgiId: { type: Schema.Types.ObjectId, ref: 'Peshgi' },
  recipientName: String,
  recipientType: { type: String, enum: ['DRIVER', 'FARMER', 'HAMAL', 'OTHER'] },
  advanceAmount: { type: Schema.Types.Decimal128 },
  deductedAmount: { type: Schema.Types.Decimal128 },
  remainingBalance: { type: Schema.Types.Decimal128 },
});

// Main Schema
const TradeSchema = new Schema<ITrade>(
  {
    tradeNumber: { type: String, required: true },
    tradeDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['DRAFT', 'WAITING_FOR_APPROVAL', 'APPROVED', 'SETTLED', 'CANCELLED'],
      default: 'DRAFT',
    },
    
    sourceLines: [SourceLineSchema],
    
    logistics: {
      vehicleId: { type: Schema.Types.ObjectId, ref: 'MasterItem' },
      vehicleNumber: String,
      vehicleType: String,
      driverName: String,
      driverPhone: String,
      routeId: { type: Schema.Types.ObjectId, ref: 'MasterItem' },
      routeDescription: String,
      distanceKm: Number,
      freightCost: { type: Schema.Types.Decimal128 },
      freightCostPerKg: { type: Schema.Types.Decimal128 },
    },
    
    expenses: [ExpenseLineSchema],
    totalExpenses: { type: Schema.Types.Decimal128 },
    
    peshgiDeductions: [PeshgiDeductionSchema],
    totalPeshgiDeducted: { type: Schema.Types.Decimal128 },
    
    financials: {
      totalSourceCost: { type: Schema.Types.Decimal128 },
      totalGrossSale: { type: Schema.Types.Decimal128 },
      totalAPMCTax: { type: Schema.Types.Decimal128 },
      totalNetSale: { type: Schema.Types.Decimal128 },
      totalFreightAndExpenses: { type: Schema.Types.Decimal128 },
      totalCapitalDeployed: { type: Schema.Types.Decimal128 },
      grossProfit: { type: Schema.Types.Decimal128 },
      netProfitAfterPeshgi: { type: Schema.Types.Decimal128 },
    },
    
    settlement: {
      capitalReturned: { type: Schema.Types.Decimal128 },
      fixedPayouts: [
        {
          partnerId: { type: Schema.Types.ObjectId, ref: 'User' },
          partnerName: String,
          amount: { type: Schema.Types.Decimal128 },
        },
      ],
      profitSplits: [
        {
          partnerId: { type: Schema.Types.ObjectId, ref: 'User' },
          partnerName: String,
          sharePercentage: { type: Schema.Types.Decimal128 },
          amount: { type: Schema.Types.Decimal128 },
        },
      ],
      totalDistributed: { type: Schema.Types.Decimal128 },
    },
    
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    pdfUrl: String,
    pdfGeneratedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

TradeSchema.plugin(tenantPlugin);

TradeSchema.index({ companyId: 1, tradeDate: -1 });
TradeSchema.index({ companyId: 1, tradeNumber: 1 }, { unique: true });
TradeSchema.index({ companyId: 1, status: 1 });

export default mongoose.models.Trade || mongoose.model<ITrade>('Trade', TradeSchema);
