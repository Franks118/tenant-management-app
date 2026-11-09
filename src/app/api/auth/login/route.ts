import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  comparePassword,
  createSessionToken,
  ensureDefaultAdmin,
  COOKIE_NAME,
  UserPayload,
} from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Ensure default admin exists on first login attempt
    await ensureDefaultAdmin();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { tenant: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'ADMIN' | 'USER',
      tenantId: user.tenantId,
    };

    const token = await createSessionToken(payload);

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenant: user.tenant,
        },
      },
      { status: 200 }
    );

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
