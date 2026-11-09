import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch a single maintenance ticket
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ticket = await prisma.maintenance.findUnique({
      where: { id },
      include: { tenant: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Maintenance ticket not found' }, { status: 404 });
    }
    return NextResponse.json(ticket, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch maintenance ticket:', error);
    return NextResponse.json({ error: 'Failed to fetch maintenance ticket' }, { status: 500 });
  }
}

// PUT: Update a maintenance ticket (e.g., change status)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, status, priority } = body;

    const updated = await prisma.maintenance.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
      },
      include: { tenant: true },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Failed to update maintenance ticket:', error);
    return NextResponse.json({ error: 'Failed to update maintenance ticket' }, { status: 500 });
  }
}

// DELETE: Remove a maintenance ticket
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.maintenance.delete({ where: { id } });
    return NextResponse.json({ message: 'Maintenance ticket deleted' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete maintenance ticket:', error);
    return NextResponse.json({ error: 'Failed to delete maintenance ticket' }, { status: 500 });
  }
}
