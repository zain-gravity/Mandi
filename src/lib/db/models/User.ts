import mongoose, { Schema, Document, Types } from 'mongoose';
import tenantPlugin from '../plugins/tenantPlugin';

export interface IUser extends Document {
  companyId?: Types.ObjectId; // null for SUPER_ADMIN
  name: string;
  phone: string;
  email?: string;
  passwordHash: string;
  role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'PARTNER';
  isActive: boolean;
  lastLoginAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    // companyId is added by tenantPlugin, but defined here for TS
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, sparse: true }, // Sparse allows multiple nulls if uniqueness was required
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'PARTNER'],
      required: true,
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

UserSchema.plugin(tenantPlugin);

// Unique phone per company
UserSchema.index({ companyId: 1, phone: 1 }, { unique: true });
UserSchema.index({ companyId: 1, role: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
