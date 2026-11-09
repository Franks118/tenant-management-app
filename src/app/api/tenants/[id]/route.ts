import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch a single tenant by ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        leases: { include: { unit: { include: { property: true } } } },
        maintenance: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }
    return NextResponse.json(tenant, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch tenant:', error);
    return NextResponse.json({ error: 'Failed to fetch tenant' }, { status: 500 });
  }
}

// PUT: Update a tenant
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, phone } = body;

    const updated = await prisma.tenant.update({
      where: { id },
      data: { name, email, phone },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Failed to update tenant:', error);
    return NextResponse.json({ error: 'Failed to update tenant' }, { status: 500 });
  }
}

// DELETE: Remove a tenant
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.tenant.delete({ where: { id } });
    return NextResponse.json({ message: 'Tenant deleted' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete tenant:', error);
    return NextResponse.json({ error: 'Failed to delete tenant' }, { status: 500 });
  }
}
