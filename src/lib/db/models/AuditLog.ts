import mongoose, { Schema, Document, Types } from 'mongoose';
import tenantPlugin from '../plugins/tenantPlugin';

export interface IAuditLog extends Document {
  companyId: Types.ObjectId;
  entityType: string;
  entityId: Types.ObjectId;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'DENY' | 'STATUS_CHANGE';
  changes: Array<{
    fieldPath: string;
    oldValue?: any;
    newValue?: any;
  }>;
  userId: Types.ObjectId;
  userName?: string;
  ipAddress?: string;
  userAgent?: string;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'DENY', 'STATUS_CHANGE'],
      required: true,
    },
    changes: [
      {
        fieldPath: String,
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed,
      },
    ],
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: String,
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
);

AuditLogSchema.plugin(tenantPlugin);

AuditLogSchema.index({ companyId: 1, entityType: 1, entityId: 1 });
AuditLogSchema.index({ companyId: 1, createdAt: -1 });

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
