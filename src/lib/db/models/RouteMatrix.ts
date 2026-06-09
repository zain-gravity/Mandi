import mongoose, { Schema, Document, Types } from 'mongoose';
import tenantPlugin from '../plugins/tenantPlugin';

export interface IRouteMatrix extends Document {
  companyId: Types.ObjectId;
  fromCityId: Types.ObjectId;
  fromCityName?: string;
  toCityId: Types.ObjectId;
  toCityName?: string;
  distanceKm: number;
  estimatedTransitHours?: number;
  status: 'WAITING_FOR_APPROVAL' | 'APPROVED';
  proposedBy?: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  freightHistory: Array<{
    tradeId?: Types.ObjectId;
    freightCostPerKg: Types.Decimal128;
    vehicleType?: string;
    totalWeightKg: Types.Decimal128;
    recordedAt?: Date;
  }>;
  avgFreightCostPerKg?: Types.Decimal128;
}

const RouteMatrixSchema = new Schema<IRouteMatrix>(
  {
    fromCityId: { type: Schema.Types.ObjectId, ref: 'MasterItem', required: true },
    fromCityName: String,
    toCityId: { type: Schema.Types.ObjectId, ref: 'MasterItem', required: true },
    toCityName: String,
    distanceKm: { type: Number, required: true },
    estimatedTransitHours: Number,
    status: {
      type: String,
      enum: ['WAITING_FOR_APPROVAL', 'APPROVED'],
      default: 'WAITING_FOR_APPROVAL',
    },
    proposedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    freightHistory: [
      {
        tradeId: { type: Schema.Types.ObjectId, ref: 'Trade' },
        freightCostPerKg: { type: Schema.Types.Decimal128 },
        vehicleType: String,
        totalWeightKg: { type: Schema.Types.Decimal128 },
        recordedAt: Date,
      },
    ],
    avgFreightCostPerKg: { type: Schema.Types.Decimal128 },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

RouteMatrixSchema.plugin(tenantPlugin);

RouteMatrixSchema.index({ companyId: 1, fromCityId: 1, toCityId: 1 }, { unique: true });

export default mongoose.models.RouteMatrix || mongoose.model<IRouteMatrix>('RouteMatrix', RouteMatrixSchema);
