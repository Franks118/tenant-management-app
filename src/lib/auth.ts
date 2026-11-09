import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'tenant-management-super-secret-key-32-chars!'
);

export const COOKIE_NAME = 'tenant_session';

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  tenantId?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: UserPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<UserPayload> {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }
  return user;
}

// Auto-seed default admin if no users exist
export async function ensureDefaultAdmin() {
  try {
    const count = await prisma.user.count();
    if (count === 0) {
      const defaultPassword = await hashPassword('admin123');
      await prisma.user.create({
        data: {
          name: 'System Admin',
          email: 'admin@rental.com',
          password: defaultPassword,
          role: 'ADMIN',
        },
      });
      console.log('Seeded default admin account: admin@rental.com / admin123');
    }
  } catch (err) {
    // Database may not be connected yet during build
    console.warn('ensureDefaultAdmin skipped:', err);
  }
}
