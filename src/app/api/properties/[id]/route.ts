import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch a single property
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        units: {
          include: {
            leases: { include: { tenant: true } },
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }
    return NextResponse.json(property, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch property:', error);
    return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 });
  }
}

// PUT: Update a property
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, address } = body;

    const updated = await prisma.property.update({
      where: { id },
      data: { name, address },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Failed to update property:', error);
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
  }
}

// DELETE: Remove a property and its units
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.property.delete({ where: { id } });
    return NextResponse.json({ message: 'Property deleted' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete property:', error);
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
  }
}
