import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, hashPassword } from '@/lib/auth';

// GET /api/admin/users - List all user accounts
export async function GET() {
  try {
    await requireAdmin();

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tenantId: true,
        tenant: {
          select: { id: true, name: true, email: true },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized';
    const status = message.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// POST /api/admin/users - Admin creates a new user account
export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { name, email, password, role, tenantId } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role === 'ADMIN' ? 'ADMIN' : 'USER',
        tenantId: tenantId || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tenantId: true,
        tenant: true,
        createdAt: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create user';
    const status = message.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
