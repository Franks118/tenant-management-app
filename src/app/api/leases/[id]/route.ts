import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch a single lease
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const lease = await prisma.lease.findUnique({
      where: { id },
      include: {
        tenant: true,
        unit: { include: { property: true } },
      },
    });

    if (!lease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 });
    }
    return NextResponse.json(lease, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch lease:', error);
    return NextResponse.json({ error: 'Failed to fetch lease' }, { status: 500 });
  }
}

// PUT: Update a lease
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { startDate, endDate, rentAmount, status } = body;

    const updated = await prisma.lease.update({
      where: { id },
      data: {
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(rentAmount && { rentAmount: parseFloat(rentAmount) }),
        ...(status && { status }),
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Failed to update lease:', error);
    return NextResponse.json({ error: 'Failed to update lease' }, { status: 500 });
  }
}

// DELETE: Remove a lease
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.lease.delete({ where: { id } });
    return NextResponse.json({ message: 'Lease deleted' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete lease:', error);
    return NextResponse.json({ error: 'Failed to delete lease' }, { status: 500 });
  }
}
