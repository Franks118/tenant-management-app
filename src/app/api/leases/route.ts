import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch all leases
export async function GET() {
  try {
    const leases = await prisma.lease.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        tenant: true,
        unit: { include: { property: true } },
      },
    });
    return NextResponse.json(leases, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch leases:', error);
    return NextResponse.json({ error: 'Failed to fetch leases' }, { status: 500 });
  }
}

// POST: Create a new lease
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { startDate, endDate, rentAmount, tenantId, unitId } = body;

    if (!startDate || !endDate || !rentAmount || !tenantId || !unitId) {
      return NextResponse.json(
        { error: 'Missing required fields: startDate, endDate, rentAmount, tenantId, unitId' },
        { status: 400 }
      );
    }

    const lease = await prisma.lease.create({
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        rentAmount: parseFloat(rentAmount),
        tenantId,
        unitId,
      },
      include: {
        tenant: true,
        unit: { include: { property: true } },
      },
    });

    return NextResponse.json(lease, { status: 201 });
  } catch (error) {
    console.error('Failed to create lease:', error);
    return NextResponse.json({ error: 'Failed to create lease' }, { status: 500 });
  }
}
