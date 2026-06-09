import { Schema } from 'mongoose';

/**
 * Mongoose plugin to enforce multi-tenancy by automatically injecting and
 * requiring the `companyId` field on all applicable schemas.
 */
export default function tenantPlugin(schema: Schema) {
  // 1. Add companyId to the schema if it doesn't exist
  schema.add({
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
  });

  // 2. Enforce companyId in all queries
  const enforceTenant = function (this: any, next: (err?: Error) => void) {
    const query = this.getQuery();
    
    // Bypass check if explicitly disabled (e.g., for Super Admin operations)
    if (this.options?.bypassTenantCheck) {
      return next();
    }

    if (!query.companyId && !query._id) { // allow findById if _id is strictly provided, but usually both are better
        return next(new Error('companyId filter is required for all queries to ensure data isolation.'));
    }
    next();
  };

  const queryMethods = [
    'find',
    'findOne',
    'findOneAndUpdate',
    'findOneAndDelete',
    'findOneAndRemove',
    'findOneAndReplace',
    'countDocuments'
  ];

  queryMethods.forEach((method) => {
    schema.pre(method as any, enforceTenant);
  });
  
  // Aggregate pipelines need manual companyId injection at the $match stage, 
  // so we pre-check aggregations to ensure the first pipeline stage is a $match with companyId
  schema.pre('aggregate' as any, function (this: any, next: (err?: Error) => void) {
    const pipeline = this.pipeline();
    
    if (this.options?.bypassTenantCheck) {
      return next();
    }

    if (!pipeline || pipeline.length === 0 || !pipeline[0].$match || !pipeline[0].$match.companyId) {
      return next(new Error('Aggregate pipelines must start with a $match stage containing companyId.'));
    }
    next();
  });
}
