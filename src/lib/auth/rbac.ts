import { Session } from 'next-auth';

type Role = 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'PARTNER';

export function requireAuth(session: Session | null): void {
  if (!session || !session.user) {
    throw new Error('Unauthorized: Authentication required');
  }
}

export function requireRole(session: Session | null, ...roles: Role[]): void {
  requireAuth(session);
  const userRole = (session!.user as any).role as Role;
  if (!roles.includes(userRole)) {
    throw new Error('Forbidden: Insufficient permissions');
  }
}

export function requireCompanyAccess(session: Session | null, companyId: string): void {
  requireAuth(session);
  const user = session!.user as any;
  
  if (user.role === 'SUPER_ADMIN') {
    return; // Super admins can access any company (usually handled differently, but just in case)
  }

  if (user.companyId !== companyId) {
    throw new Error('Forbidden: Cross-tenant access denied');
  }
}

export function isSuperAdmin(session: Session | null): boolean {
  if (!session || !session.user) return false;
  return (session.user as any).role === 'SUPER_ADMIN';
}

export function isCompanyAdmin(session: Session | null): boolean {
  if (!session || !session.user) return false;
  return (session.user as any).role === 'COMPANY_ADMIN';
}

export function isPartner(session: Session | null): boolean {
  if (!session || !session.user) return false;
  return (session.user as any).role === 'PARTNER';
}
