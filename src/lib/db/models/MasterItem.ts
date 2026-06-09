import mongoose, { Schema, Document, Types } from 'mongoose';
import tenantPlugin from '../plugins/tenantPlugin';

export interface IMasterItem extends Document {
  companyId: Types.ObjectId;
  type: 'COMMODITY' | 'VEHICLE' | 'EXPENSE_HEAD' | 'CITY' | 'ROUTE';
  name: string;
  cityData?: {
    state: string;
    mandiTaxPercentage: Types.Decimal128;
    isAPMCRegulated: boolean;
  };
  vehicleData?: {
    capacityKg: number;
    type: 'MINI_TRUCK' | 'EICHER' | 'TATA_407' | 'TRAILER' | 'OTHER';
  };
  routeData?: {
    fromCityId: Types.ObjectId;
    toCityId: Types.ObjectId;
    distanceKm: number;
    estimatedTransitHours?: number;
  };
  status: 'WAITING_FOR_APPROVAL' | 'APPROVED' | 'DENIED';
  proposedBy?: Types.ObjectId;
  reviewedBy?: Types.ObjectId;
  reviewNote?: string;
  reviewedAt?: Date;
}

const MasterItemSchema = new Schema<IMasterItem>(
  {
    type: {
      type: String,
      enum: ['COMMODITY', 'VEHICLE', 'EXPENSE_HEAD', 'CITY', 'ROUTE'],
      required: true,
    },
    name: { type: String, required: true },
    
    // CITY specific
    cityData: {
      state: String,
      mandiTaxPercentage: { type: Schema.Types.Decimal128 },
      isAPMCRegulated: { type: Boolean, default: true },
    },
    
    // VEHICLE specific
    vehicleData: {
      capacityKg: Number,
      type: {
        type: String,
        enum: ['MINI_TRUCK', 'EICHER', 'TATA_407', 'TRAILER', 'OTHER'],
      },
    },

    // ROUTE specific
    routeData: {
      fromCityId: { type: Schema.Types.ObjectId, ref: 'MasterItem' },
      toCityId: { type: Schema.Types.ObjectId, ref: 'MasterItem' },
      distanceKm: Number,
      estimatedTransitHours: Number,
    },

    status: {
      type: String,
      enum: ['WAITING_FOR_APPROVAL', 'APPROVED', 'DENIED'],
      default: 'WAITING_FOR_APPROVAL',
    },
    proposedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewNote: { type: String },
    reviewedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

MasterItemSchema.plugin(tenantPlugin);

MasterItemSchema.index({ companyId: 1, type: 1, status: 1 });
MasterItemSchema.index({ companyId: 1, type: 1, name: 1 }, { unique: true });

export default mongoose.models.MasterItem || mongoose.model<IMasterItem>('MasterItem', MasterItemSchema);
