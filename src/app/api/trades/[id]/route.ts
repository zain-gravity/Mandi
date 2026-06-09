import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import { Trade } from '@/lib/db/models';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
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
    }).lean();

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }

    return NextResponse.json(trade);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    const trade = await Trade.findOne({ _id: id, companyId: (session.user as any).companyId });
    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }

    if (trade.status !== 'DRAFT') {
      return NextResponse.json({ error: 'Only DRAFT trades can be directly edited.' }, { status: 400 });
    }

    const body = await req.json();
    
    // Only allow updating certain fields, prevent changing companyId
    delete body.companyId;
    delete body.tradeNumber;

    Object.assign(trade, body);
    await trade.save();

    return NextResponse.json(trade);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    const trade = await Trade.findOne({ _id: id, companyId: (session.user as any).companyId });
    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }

    if (trade.status !== 'DRAFT') {
      return NextResponse.json({ error: 'Only DRAFT trades can be deleted.' }, { status: 400 });
    }

    await Trade.deleteOne({ _id: trade._id });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
