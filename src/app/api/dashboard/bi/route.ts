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
    const companyId = (session.user as any).companyId;

    // We will do several simple aggregations

    // 1. Net Realization Score (Net Profit / Gross Sale) over time
    // We fetch recent settled/approved trades
    const recentTrades = await Trade.find({
      companyId,
      status: { $in: ['APPROVED', 'SETTLED'] }
    })
      .sort({ tradeDate: 1 }) // Chronological
      .limit(30)
      .lean();

    const realizationTrend = recentTrades.map((t: any) => {
      const gross = parseFloat(t.financials?.totalGrossSale?.toString() || '0');
      const net = parseFloat(t.financials?.netProfitAfterPeshgi?.toString() || '0');
      const score = gross > 0 ? (net / gross) * 100 : 0;
      
      return {
        date: new Date(t.tradeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: parseFloat(score.toFixed(2)),
        tradeNumber: t.tradeNumber
      };
    });

    // 2. Freight Intelligence Benchmark
    // Group by Vehicle Type and average the Freight Cost Per Kg
    const freightBenchmark = await Trade.aggregate([
      { $match: { companyId, 'logistics.vehicleType': { $exists: true, $ne: null }, 'logistics.freightCostPerKg': { $exists: true } } },
      {
        $group: {
          _id: '$logistics.vehicleType',
          avgCostPerKg: { $avg: '$logistics.freightCostPerKg' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          vehicleType: '$_id',
          avgCostPerKg: { $round: ['$avgCostPerKg', 2] },
          count: 1,
          _id: 0
        }
      }
    ]);

    // 3. Max Price Heatmap (Max Purchase Price by Commodity)
    // We unroll source lines and group by Commodity
    const priceHeatmap = await Trade.aggregate([
      { $match: { companyId } },
      { $unwind: '$sourceLines' },
      {
        $group: {
          _id: '$sourceLines.commodityName',
          maxPrice: { $max: '$sourceLines.purchasePricePerKg' },
          avgPrice: { $avg: '$sourceLines.purchasePricePerKg' }
        }
      },
      {
        $project: {
          commodity: '$_id',
          maxPrice: { $round: ['$maxPrice', 2] },
          avgPrice: { $round: ['$avgPrice', 2] },
          _id: 0
        }
      }
    ]);

    // 4. Pending Approvals Count
    const pendingCount = await Trade.countDocuments({ companyId, status: 'WAITING_FOR_APPROVAL' });

    // 5. Total Gross Sale (Today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTrades = await Trade.find({
      companyId,
      tradeDate: { $gte: today }
    }).lean();

    let todayGross = 0;
    let todayNet = 0;
    todayTrades.forEach((t: any) => {
      todayGross += parseFloat(t.financials?.totalGrossSale?.toString() || '0');
      todayNet += parseFloat(t.financials?.netProfitAfterPeshgi?.toString() || '0');
    });

    return NextResponse.json({
      realizationTrend,
      freightBenchmark,
      priceHeatmap,
      stats: {
        pendingCount,
        todayGross,
        todayNet
      }
    });

  } catch (err: any) {
    console.error('BI Dashboard Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
