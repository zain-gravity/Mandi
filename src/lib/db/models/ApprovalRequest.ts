// src/lib/db/models/ApprovalRequest.ts — Maker-Checker approval queue
import mongoose, { Schema, Document, Model } from 'mongoose';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'DENIED';
export type ApprovalAction = 'CREATE' | 'UPDATE' | 'DELETE';

export interface IApprovalRequest extends Document {
  _id: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  entityType: string;
  entityId: mongoose.Types.ObjectId;
  action: ApprovalAction;
  proposedData: Record<string, unknown>;
  status: ApprovalStatus;
  makerId: mongoose.Types.ObjectId;
  makerName: string;
  checkerId: mongoose.Types.ObjectId | null;
  checkerName: string;
  editedData: Record<string, unknown> | null;
  remarks: string;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ApprovalRequestSchema = new Schema<IApprovalRequest>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE'],
      required: true,
    },
    proposedData: { type: Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'DENIED'],
      default: 'PENDING',
    },
    makerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    makerName: { type: String, required: true },
    checkerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    checkerName: { type: String, default: '' },
    editedData: { type: Schema.Types.Mixed, default: null },
    remarks: { type: String, default: '' },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ApprovalRequestSchema.index({ companyId: 1, status: 1 });
ApprovalRequestSchema.index({ companyId: 1, entityType: 1, status: 1 });

const ApprovalRequest: Model<IApprovalRequest> =
  mongoose.models.ApprovalRequest ||
  mongoose.model<IApprovalRequest>('ApprovalRequest', ApprovalRequestSchema);
export default ApprovalRequest;
