import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import { Trade } from '@/lib/db/models';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    const trades = await Trade.find({ companyId: (session.user as any).companyId })
      .sort({ tradeDate: -1, createdAt: -1 })
      .lean();
    
    // Map to simplified data for the table
    const mappedTrades = trades.map((t: any) => {
      // Find primary commodity from first source line
      const commodity = t.sourceLines?.[0]?.commodityName || 'Unknown';
      const source = t.sourceLines?.[0]?.sourceCityName || 'Unknown';
      
      // Calculate total quantity
      let totalQty = 0;
      t.sourceLines?.forEach((line: any) => {
        totalQty += parseFloat(line.quantityKg?.toString() || '0');
      });

      return {
        id: t._id.toString(),
        tradeNumber: t.tradeNumber,
        date: new Date(t.tradeDate).toISOString().split('T')[0],
        commodity,
        source,
        qty: `${totalQty} kg`,
        grossSale: `₹ ${t.financials?.totalGrossSale?.toString() || '0'}`,
        netProfit: `₹ ${t.financials?.netProfitAfterPeshgi?.toString() || '0'}`,
        status: t.status
      };
    });

    return NextResponse.json(mappedTrades);
  } catch (err: any) {
    console.error('GET Trades Error:', err);
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
    
    // Auto-generate a Trade Number
    const count = await Trade.countDocuments({ companyId: (session.user as any).companyId });
    const year = new Date().getFullYear();
    const tradeNumber = `TRD-${year}-${(count + 1).toString().padStart(4, '0')}`;
    
    const newTrade = await Trade.create({
      ...body,
      companyId: (session.user as any).companyId,
      tradeNumber,
      createdBy: (session.user as any).id,
      status: 'DRAFT',
    });

    return NextResponse.json(newTrade);
  } catch (err: any) {
    console.error('POST Trade Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
