import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, hashPassword } from '@/lib/auth';

// PUT /api/admin/users/[id] - Update user account
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const { name, email, password, role, tenantId } = body;

    const dataToUpdate: Record<string, unknown> = {};
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email.toLowerCase().trim();
    if (role) dataToUpdate.role = role === 'ADMIN' ? 'ADMIN' : 'USER';
    if (tenantId !== undefined) dataToUpdate.tenantId = tenantId || null;
    if (password && password.length >= 6) {
      dataToUpdate.password = await hashPassword(password);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
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

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update user';
    const status = message.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// DELETE /api/admin/users/[id] - Delete user account
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    if (admin.id === id) {
      return NextResponse.json(
        { error: 'You cannot delete your own admin account' },
        { status: 400 }
      );
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    const status = message.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
