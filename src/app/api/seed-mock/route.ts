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

    // Check if we already have a bunch of trades
    const count = await Trade.countDocuments({ companyId });
    if (count > 5) {
      return NextResponse.json({ message: 'Already seeded' });
    }

    // Seed mock trades for BI
    const year = new Date().getFullYear();
    const mockTrades = [];

    const commodities = ['Tomato', 'Onion', 'Potato', 'Garlic'];
    const cities = ['Nashik', 'Lasalgaon', 'Agra', 'Mandsaur'];
    const vehicles = ['TATA_ACE', 'BOLERO_PICKUP', 'EICHER_14FT', 'TRUCK_10_WHEELER'];

    for (let i = 1; i <= 15; i++) {
      const isApproved = i % 3 !== 0;
      const isSettled = i % 5 === 0;
      
      const qty = 1000 + (Math.random() * 4000); // 1000 to 5000 kg
      const purchasePrice = 10 + (Math.random() * 30); // 10 to 40 per kg
      const freight = 5000 + (Math.random() * 15000); // 5000 to 20000
      
      const grossSale = (qty * purchasePrice) * (1.1 + Math.random() * 0.4); // 10% to 50% margin
      const netProfit = grossSale - (qty * purchasePrice) - freight;

      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // random within last 30 days

      mockTrades.push({
        companyId,
        tradeNumber: `TRD-${year}-MOCK${i.toString().padStart(3, '0')}`,
        tradeDate: date,
        status: isSettled ? 'SETTLED' : (isApproved ? 'APPROVED' : 'WAITING_FOR_APPROVAL'),
        sourceLines: [
          {
            commodityName: commodities[i % commodities.length],
            sourceCityName: cities[i % cities.length],
            quantityKg: qty.toFixed(2),
            purchasePricePerKg: purchasePrice.toFixed(2),
            totalPurchaseCost: (qty * purchasePrice).toFixed(2),
            gradingSplits: []
          }
        ],
        logistics: {
          vehicleType: vehicles[i % vehicles.length],
          freightCost: freight.toFixed(2),
          freightCostPerKg: (freight / qty).toFixed(2)
        },
        financials: {
          totalSourceCost: (qty * purchasePrice).toFixed(2),
          totalGrossSale: grossSale.toFixed(2),
          totalNetSale: grossSale.toFixed(2),
          totalFreightAndExpenses: freight.toFixed(2),
          grossProfit: netProfit.toFixed(2),
          netProfitAfterPeshgi: netProfit.toFixed(2)
        },
        createdBy: (session.user as any).id
      });
    }

    await Trade.insertMany(mockTrades);

    return NextResponse.json({ message: 'Seeded 15 mock trades successfully!' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
