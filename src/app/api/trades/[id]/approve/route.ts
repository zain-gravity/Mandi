import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { ApprovalEngine } from '@/lib/services/approvalEngine';
import { requireRole } from '@/lib/auth/rbac';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // RBAC: Only COMPANY_ADMIN or SUPER_ADMIN can approve
    try {
      requireRole(session, 'COMPANY_ADMIN', 'SUPER_ADMIN');
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const { action, remarks } = body;

    const companyId = (session.user as any).companyId;
    const checkerId = (session.user as any).id;

    let result;

    if (action === 'APPROVE') {
      result = await ApprovalEngine.approveEntity(
        companyId,
        'Trade',
        id,
        checkerId,
        undefined, // no edited data yet
        remarks
      );
    } else if (action === 'DENY') {
      if (!remarks) {
        return NextResponse.json({ error: 'Remarks are required for denial' }, { status: 400 });
      }
      result = await ApprovalEngine.denyEntity(
        companyId,
        'Trade',
        id,
        checkerId,
        remarks
      );
    } else {
      return NextResponse.json({ error: 'Invalid action. Must be APPROVE or DENY.' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Approve Trade Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
