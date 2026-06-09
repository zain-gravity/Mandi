import mongoose, { Schema, Document, Types } from 'mongoose';
import tenantPlugin from '../plugins/tenantPlugin';

export interface ILedger extends Document {
  companyId: Types.ObjectId;
  type: 'RECEIVABLE' | 'PAYABLE' | 'ASSET_RECEIVABLE' | 'ASSET_PAYABLE';
  entityType?: 'BUYER' | 'FARMER' | 'DRIVER' | 'HAMAL' | 'OTHER';
  entityName?: string;
  entityPhone?: string;
  tradeId?: Types.ObjectId;
  tradeNumber?: string;
  description?: string;
  amount: Types.Decimal128;
  paidAmount: Types.Decimal128;
  balanceAmount: Types.Decimal128;
  dueDate?: Date;
  status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'WRITTEN_OFF';
  assetData?: {
    assetType?: 'CRATE' | 'BAG' | 'TARPAULIN' | 'OTHER';
    quantity?: number;
    unitValue?: Types.Decimal128;
  };
  payments: Array<{
    amount: Types.Decimal128;
    paidAt?: Date;
    method?: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'ADJUSTMENT';
    reference?: string;
    recordedBy?: Types.ObjectId;
  }>;
}

const LedgerSchema = new Schema<ILedger>(
  {
    type: {
      type: String,
      enum: ['RECEIVABLE', 'PAYABLE', 'ASSET_RECEIVABLE', 'ASSET_PAYABLE'],
      required: true,
    },
    entityType: {
      type: String,
      enum: ['BUYER', 'FARMER', 'DRIVER', 'HAMAL', 'OTHER'],
    },
    entityName: String,
    entityPhone: String,
    tradeId: { type: Schema.Types.ObjectId, ref: 'Trade' },
    tradeNumber: String,
    description: String,
    amount: { type: Schema.Types.Decimal128, required: true },
    paidAmount: { type: Schema.Types.Decimal128, default: () => Types.Decimal128.fromString('0') },
    balanceAmount: { type: Schema.Types.Decimal128, required: true },
    dueDate: Date,
    status: {
      type: String,
      enum: ['PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'WRITTEN_OFF'],
      default: 'PENDING',
    },
    assetData: {
      assetType: {
        type: String,
        enum: ['CRATE', 'BAG', 'TARPAULIN', 'OTHER'],
      },
      quantity: Number,
      unitValue: { type: Schema.Types.Decimal128 },
    },
    payments: [
      {
        amount: { type: Schema.Types.Decimal128 },
        paidAt: Date,
        method: {
          type: String,
          enum: ['CASH', 'UPI', 'BANK_TRANSFER', 'ADJUSTMENT'],
        },
        reference: String,
        recordedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

LedgerSchema.plugin(tenantPlugin);

LedgerSchema.index({ companyId: 1, type: 1, status: 1 });
LedgerSchema.index({ companyId: 1, dueDate: 1 });
LedgerSchema.index({ companyId: 1, entityName: 1 });

export default mongoose.models.Ledger || mongoose.model<ILedger>('Ledger', LedgerSchema);
