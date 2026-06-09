import { z } from 'zod';

const phoneRegex = /^[6-9]\d{9}$/;

export const loginSchema = z.object({
  phone: z.string().regex(phoneRegex, 'Invalid Indian phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().regex(phoneRegex, 'Invalid Indian phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['SUPER_ADMIN', 'COMPANY_ADMIN', 'PARTNER']),
  companyId: z.string().optional(), // Required unless SUPER_ADMIN, validated in API
});

export const createMasterItemSchema = z.object({
  type: z.enum(['COMMODITY', 'VEHICLE', 'EXPENSE_HEAD', 'CITY', 'ROUTE']),
  name: z.string().min(2),
  cityData: z.object({
    state: z.string().optional(),
    mandiTaxPercentage: z.string().regex(/^\d+(\.\d+)?$/, 'Must be a valid decimal string').optional(),
    isAPMCRegulated: z.boolean().optional(),
  }).optional(),
  vehicleData: z.object({
    capacityKg: z.number().optional(),
    type: z.enum(['MINI_TRUCK', 'EICHER', 'TATA_407', 'TRAILER', 'OTHER']).optional(),
  }).optional(),
  routeData: z.object({
    fromCityId: z.string().optional(),
    toCityId: z.string().optional(),
    distanceKm: z.number().optional(),
    estimatedTransitHours: z.number().optional(),
  }).optional(),
});

export const createPeshgiSchema = z.object({
  recipientName: z.string().min(2),
  recipientPhone: z.string().regex(phoneRegex, 'Invalid Indian phone number').optional(),
  recipientType: z.enum(['DRIVER', 'FARMER', 'HAMAL', 'OTHER']),
  advanceAmount: z.string().regex(/^\d+(\.\d+)?$/, 'Must be a valid decimal string'),
  purpose: z.string().optional(),
});

export const createTradeSchema = z.object({
  tradeDate: z.string().datetime(), // ISO string
  sourceLines: z.array(z.object({
    commodityId: z.string(),
    commodityName: z.string(),
    farmerName: z.string().optional(),
    farmerPhone: z.string().optional(),
    sourceCityId: z.string(),
    sourceCityName: z.string(),
    quantityKg: z.string(),
    purchasePricePerKg: z.string(),
  })).min(1),
  logistics: z.object({
    vehicleId: z.string().optional(),
    vehicleNumber: z.string().optional(),
    driverName: z.string().optional(),
    driverPhone: z.string().optional(),
    routeId: z.string().optional(),
    distanceKm: z.number().optional(),
    freightCost: z.string().optional(),
  }).optional(),
  expenses: z.array(z.object({
    headId: z.string(),
    headName: z.string(),
    amount: z.string(),
    paidTo: z.string().optional(),
    notes: z.string().optional(),
  })).optional(),
});
