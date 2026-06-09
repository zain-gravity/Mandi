import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import { Peshgi } from '@/lib/db/models';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    const companyId = (session.user as any).companyId;

    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    const status = url.searchParams.get('status');

    const query: any = { companyId };
    if (type) query.recipientType = type;
    if (status) query.status = status;

    const records = await Peshgi.find(query).sort({ givenAt: -1, createdAt: -1 }).lean();

    // Map Decimal128 values for client
    const mapped = records.map((r: any) => ({
      ...r,
      advanceAmount: parseFloat(r.advanceAmount?.toString() || '0'),
      remainingBalance: parseFloat(r.remainingBalance?.toString() || '0')
    }));

    return NextResponse.json(mapped);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    const body = await req.json();

    const newPeshgi = await Peshgi.create({
      ...body,
      companyId: (session.user as any).companyId,
      remainingBalance: body.advanceAmount,
      proposedBy: (session.user as any).id,
      approvalStatus: 'WAITING_FOR_APPROVAL',
      givenAt: body.givenAt || new Date(),
    });

    return NextResponse.json(newPeshgi);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
