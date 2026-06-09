import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import { Trade } from '@/lib/db/models';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    const trade = await Trade.findOne({
      _id: id,
      companyId: (session.user as any).companyId,
    });

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }

    if (trade.status !== 'DRAFT') {
      return NextResponse.json({ error: 'Only DRAFT trades can be submitted' }, { status: 400 });
    }

    trade.status = 'WAITING_FOR_APPROVAL';
    await trade.save();

    return NextResponse.json(trade);
  } catch (err: any) {
    console.error('Submit Trade Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
