// src/lib/db/models/LedgerEntry.ts — Partner/Farmer ledger for receivables/payables
import mongoose, { Schema, Document, Model } from 'mongoose';

export type LedgerEntryType = 'RECEIVABLE' | 'PAYABLE';
export type LedgerEntryStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';

export interface ILedgerEntry extends Document {
  _id: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  counterpartyName: string;
  counterpartyPhone: string;
  type: LedgerEntryType;
  amount: mongoose.Types.Decimal128;
  paidAmount: mongoose.Types.Decimal128;
  remainingAmount: mongoose.Types.Decimal128;
  status: LedgerEntryStatus;
  dueDate: Date;
  description: string;
  relatedTradeId: mongoose.Types.ObjectId | null;
  relatedTradeNumber: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LedgerEntrySchema = new Schema<ILedgerEntry>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    counterpartyName: { type: String, required: true, trim: true },
    counterpartyPhone: { type: String, default: '' },
    type: { type: String, enum: ['RECEIVABLE', 'PAYABLE'], required: true },
    amount: { type: Schema.Types.Decimal128, required: true },
    paidAmount: { type: Schema.Types.Decimal128, default: mongoose.Types.Decimal128.fromString('0') },
    remainingAmount: { type: Schema.Types.Decimal128, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'],
      default: 'PENDING',
    },
    dueDate: { type: Date, required: true },
    description: { type: String, default: '' },
    relatedTradeId: { type: Schema.Types.ObjectId, ref: 'Trade', default: null },
    relatedTradeNumber: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

LedgerEntrySchema.index({ companyId: 1, type: 1, status: 1 });
LedgerEntrySchema.index({ companyId: 1, dueDate: 1 });

const LedgerEntry: Model<ILedgerEntry> =
  mongoose.models.LedgerEntry || mongoose.model<ILedgerEntry>('LedgerEntry', LedgerEntrySchema);
export default LedgerEntry;
