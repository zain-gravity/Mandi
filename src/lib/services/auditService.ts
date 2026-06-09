import { AuditLog } from '../db/models';

export interface Change {
  fieldPath: string;
  oldValue: any;
  newValue: any;
}

export class AuditService {
  
  /**
   * Creates an audit log entry for any entity mutation
   */
  static async logChange(
    companyId: string,
    entityType: string,
    entityId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'DENY' | 'STATUS_CHANGE',
    changes: Change[],
    userId: string,
    userName?: string,
    req?: Request // To extract IP/UserAgent if needed
  ) {
    let ipAddress, userAgent;
    
    if (req) {
      ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('remote-addr');
      userAgent = req.headers.get('user-agent');
    }

    await AuditLog.create({
      companyId,
      entityType,
      entityId,
      action,
      changes,
      userId,
      userName,
      ipAddress,
      userAgent
    });
  }

  /**
   * Deep diffs two objects and returns an array of changes.
   * Useful for the 'UPDATE' action.
   */
  static diffObjects(oldObj: any, newObj: any, prefix: string = ''): Change[] {
    const changes: Change[] = [];
    
    // Simplistic diff for MVP. For production, use a library like 'deep-diff'
    const keys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);
    
    for (const key of keys) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      const oldVal = oldObj ? oldObj[key] : undefined;
      const newVal = newObj ? newObj[key] : undefined;
      
      // Skip mongoose specific fields
      if (key === '_id' || key === 'createdAt' || key === 'updatedAt' || key === '__v') continue;

      // Basic equality check
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({
          fieldPath: fullPath,
          oldValue: oldVal,
          newValue: newVal
        });
      }
    }
    
    return changes;
  }

  /**
   * Retrieves the full history for a specific entity
   */
  static async getEntityHistory(companyId: string, entityType: string, entityId: string) {
    return await AuditLog.find({
      companyId,
      entityType,
      entityId
    }).sort({ createdAt: -1 }).populate('userId', 'name role');
  }
}
