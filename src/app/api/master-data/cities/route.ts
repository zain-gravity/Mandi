import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/connect';
import { MasterItem } from '@/lib/db/models';
import { toDecimal128 } from '@/lib/utils/decimal';

// GET: Fetch approved cities + auto-populate APMC tax
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    if (!user.companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
    }

    await connectDB();

    const cities = await MasterItem.find({
      companyId: user.companyId,
      type: 'CITY',
      status: 'APPROVED',
    }).lean();

    return NextResponse.json({ cities });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Partner proposes new city -> WAITING_FOR_APPROVAL
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    if (!user.companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
    }

    const body = await request.json();
    await connectDB();

    // Check for existing city
    const existing = await MasterItem.findOne({
      companyId: user.companyId,
      type: 'CITY',
      name: body.name,
    });

    if (existing) {
      return NextResponse.json({ error: 'City already exists' }, { status: 409 });
    }

    // Create city with APMC data
    const city = await MasterItem.create({
      companyId: user.companyId,
      type: 'CITY',
      name: body.name,
      cityData: {
        state: body.state,
        mandiTaxPercentage: body.mandiTaxPercentage ? toDecimal128(body.mandiTaxPercentage) : undefined,
        isAPMCRegulated: body.isAPMCRegulated ?? true,
      },
      status: user.role === 'COMPANY_ADMIN' ? 'APPROVED' : 'WAITING_FOR_APPROVAL',
      proposedBy: user.id,
    });

    // Background calculation mock for distances (would typically be a queue/webhook)
    if (city.status === 'APPROVED') {
      // fireAndForgetDistanceCalculation(user.companyId, city._id);
    }

    return NextResponse.json({ city }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
