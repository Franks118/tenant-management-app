import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch all properties with units
export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        units: {
          orderBy: { unitNumber: 'asc' },
          include: {
            _count: { select: { leases: true } },
          },
        },
      },
    });
    return NextResponse.json(properties, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch properties:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

// POST: Create a property with optional units
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, address, units } = body;

    if (!name || !address) {
      return NextResponse.json({ error: 'Missing required fields: name, address' }, { status: 400 });
    }

    const property = await prisma.property.create({
      data: {
        name,
        address,
        units: units?.length
          ? {
              create: units.map((u: { unitNumber: string }) => ({
                unitNumber: u.unitNumber,
              })),
            }
          : undefined,
      },
      include: { units: true },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error('Failed to create property:', error);
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}
