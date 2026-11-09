import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch all tenants
export async function GET() {
  try {
    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        leases: {
          include: { unit: { include: { property: true } } },
        },
        _count: { select: { maintenance: true } },
      },
    });
    return NextResponse.json(tenants, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch tenants:', error);
    return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 });
  }
}

// POST: Create a new tenant
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone } = body;

    if (!name || !email || !phone) {
      return NextResponse.json({ error: 'Missing required fields: name, email, phone' }, { status: 400 });
    }

    const newTenant = await prisma.tenant.create({
      data: { name, email, phone },
    });

    return NextResponse.json(newTenant, { status: 201 });
  } catch (error: unknown) {
    console.error('Failed to create tenant:', error);
    if (error instanceof Error && 'code' in error && (error as { code: string }).code === 'P2002') {
      return NextResponse.json({ error: 'A tenant with this email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create tenant' }, { status: 500 });
  }
}
