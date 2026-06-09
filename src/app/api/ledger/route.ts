import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import { Ledger } from '@/lib/db/models';
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
    if (type) query.type = type;
    if (status) query.status = status;

    const records = await Ledger.find(query).sort({ dueDate: 1, createdAt: -1 }).lean();

    // Map Decimal128 values for client
    const mapped = records.map((r: any) => ({
      ...r,
      amount: parseFloat(r.amount?.toString() || '0'),
      paidAmount: parseFloat(r.paidAmount?.toString() || '0'),
      balanceAmount: parseFloat(r.balanceAmount?.toString() || '0')
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

    const newLedger = await Ledger.create({
      ...body,
      companyId: (session.user as any).companyId,
      paidAmount: 0,
      balanceAmount: body.amount,
      status: 'PENDING',
    });

    return NextResponse.json(newLedger);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
