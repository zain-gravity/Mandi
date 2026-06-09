import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import connectDB from '@/lib/db/connect';
import { RouteMatrix } from '@/lib/db/models';

// GET: Fetch distance between two cities
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    const { searchParams } = new URL(request.url);
    const fromCityId = searchParams.get('from');
    const toCityId = searchParams.get('to');

    if (!fromCityId || !toCityId) {
      return NextResponse.json({ error: 'Missing from/to parameters' }, { status: 400 });
    }

    await connectDB();

    // Try approved route first
    let route = await RouteMatrix.findOne({
      companyId: user.companyId,
      fromCityId,
      toCityId,
      status: 'APPROVED',
    });

    // Try reverse direction
    if (!route) {
      route = await RouteMatrix.findOne({
        companyId: user.companyId,
        fromCityId: toCityId,
        toCityId: fromCityId,
        status: 'APPROVED',
      });
    }

    if (!route) {
      return NextResponse.json({
        found: false,
        message: 'No approved route found. Please submit a proposal.',
      }, { status: 404 });
    }

    return NextResponse.json({
      found: true,
      route: {
        distanceKm: route.distanceKm,
        estimatedTransitHours: route.estimatedTransitHours,
        avgFreightCostPerKg: route.avgFreightCostPerKg?.toString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Partner proposes a new distance
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    const body = await request.json();

    if (!body.fromCityId || !body.toCityId || !body.distanceKm) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    // Check if route already exists (either direction)
    const existing = await RouteMatrix.findOne({
      companyId: user.companyId,
      $or: [
        { fromCityId: body.fromCityId, toCityId: body.toCityId },
        { fromCityId: body.toCityId, toCityId: body.fromCityId },
      ],
    });

    if (existing) {
      return NextResponse.json({ error: 'Route already exists' }, { status: 409 });
    }

    const route = await RouteMatrix.create({
      companyId: user.companyId,
      fromCityId: body.fromCityId,
      fromCityName: body.fromCityName,
      toCityId: body.toCityId,
      toCityName: body.toCityName,
      distanceKm: body.distanceKm,
      estimatedTransitHours: body.estimatedTransitHours,
      status: user.role === 'COMPANY_ADMIN' ? 'APPROVED' : 'WAITING_FOR_APPROVAL',
      proposedBy: user.id,
    });

    return NextResponse.json({ route }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
