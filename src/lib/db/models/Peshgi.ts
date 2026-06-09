import mongoose, { Schema, Document, Types } from 'mongoose';
import tenantPlugin from '../plugins/tenantPlugin';

export interface IPeshgi extends Document {
  companyId: Types.ObjectId;
  recipientName: string;
  recipientPhone?: string;
  recipientType: 'DRIVER' | 'FARMER' | 'HAMAL' | 'OTHER';
  advanceAmount: Types.Decimal128;
  remainingBalance: Types.Decimal128;
  purpose?: string;
  status: 'ACTIVE' | 'PARTIALLY_SETTLED' | 'FULLY_SETTLED' | 'WRITTEN_OFF';
  settlements: Array<{
    tradeId?: Types.ObjectId;
    tradeNumber?: string;
    amountDeducted: Types.Decimal128;
    settledAt?: Date;
    settledBy?: Types.ObjectId;
  }>;
  approvalStatus: 'WAITING_FOR_APPROVAL' | 'APPROVED' | 'DENIED';
  proposedBy?: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  givenAt?: Date;
}

const PeshgiSchema = new Schema<IPeshgi>(
  {
    recipientName: { type: String, required: true },
    recipientPhone: String,
    recipientType: {
      type: String,
      enum: ['DRIVER', 'FARMER', 'HAMAL', 'OTHER'],
      required: true,
    },
    advanceAmount: { type: Schema.Types.Decimal128, required: true },
    remainingBalance: { type: Schema.Types.Decimal128, required: true },
    purpose: String,
    status: {
      type: String,
      enum: ['ACTIVE', 'PARTIALLY_SETTLED', 'FULLY_SETTLED', 'WRITTEN_OFF'],
      default: 'ACTIVE',
    },
    settlements: [
      {
        tradeId: { type: Schema.Types.ObjectId, ref: 'Trade' },
        tradeNumber: String,
        amountDeducted: { type: Schema.Types.Decimal128 },
        settledAt: Date,
        settledBy: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    approvalStatus: {
      type: String,
      enum: ['WAITING_FOR_APPROVAL', 'APPROVED', 'DENIED'],
      default: 'WAITING_FOR_APPROVAL',
    },
    proposedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    givenAt: Date,
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

PeshgiSchema.plugin(tenantPlugin);

PeshgiSchema.index({ companyId: 1, status: 1 });
PeshgiSchema.index({ companyId: 1, recipientType: 1, recipientName: 1 });

export default mongoose.models.Peshgi || mongoose.model<IPeshgi>('Peshgi', PeshgiSchema);
