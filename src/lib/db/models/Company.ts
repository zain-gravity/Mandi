import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  slug: string;
  licenseType: 'TRIAL' | 'BASIC' | 'PRO' | 'ENTERPRISE';
  licenseExpiresAt?: Date;
  isActive: boolean;
  partners: Array<{
    userId: Types.ObjectId;
    name: string;
    profitSharePercentage: Types.Decimal128;
    fixedPayout: Types.Decimal128;
  }>;
  settings: {
    defaultCurrency: string;
    financialYearStart: number;
  };
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    licenseType: {
      type: String,
      enum: ['TRIAL', 'BASIC', 'PRO', 'ENTERPRISE'],
      default: 'TRIAL',
    },
    licenseExpiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
    partners: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        name: { type: String },
        profitSharePercentage: { type: Schema.Types.Decimal128 },
        fixedPayout: { type: Schema.Types.Decimal128 },
      },
    ],
    settings: {
      defaultCurrency: { type: String, default: 'INR' },
      financialYearStart: { type: Number, default: 4 }, // April
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// We do NOT apply the tenantPlugin here because Company is the root tenant entity itself.

export default mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);
