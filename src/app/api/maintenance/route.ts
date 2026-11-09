import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch all maintenance tickets
export async function GET() {
  try {
    const tickets = await prisma.maintenance.findMany({
      orderBy: { createdAt: 'desc' },
      include: { tenant: true },
    });
    return NextResponse.json(tickets, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch maintenance tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch maintenance tickets' }, { status: 500 });
  }
}

// POST: Submit a maintenance ticket
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, priority, tenantId } = body;

    if (!title || !description || !tenantId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, tenantId' },
        { status: 400 }
      );
    }

    const ticket = await prisma.maintenance.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        tenantId,
      },
      include: { tenant: true },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Failed to create maintenance ticket:', error);
    return NextResponse.json({ error: 'Failed to create maintenance ticket' }, { status: 500 });
  }
}
