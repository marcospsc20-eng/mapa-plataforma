import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

export const FAMILY_COOKIE = 'thaju_family';
export const RESPONSAVEL_COOKIE = 'thaju_responsavel';

const FAMILY_MAX_AGE = 60 * 60 * 24 * 90; // 90 dias
const RESPONSAVEL_MAX_AGE = 60 * 60 * 12; // 12 horas

type FamilySession = { familyId: string };
type ResponsavelSession = { familyId: string; userId: string };

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET não configurado.');
  }
  return secret;
}

function sign(payload: Record<string, unknown>, maxAgeSeconds: number): string {
  const exp = Date.now() + maxAgeSeconds * 1000;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const sig = crypto.createHmac('sha256', getSecret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verify<T>(token: string | undefined): T | null {
  if (!token) return null;

  const [body, sig] = token.split('.');
  if (!body || !sig) return null;

  const expectedSig = crypto.createHmac('sha256', getSecret()).update(body).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);

  if (
    sigBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(new Uint8Array(sigBuf), new Uint8Array(expectedBuf))
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
    return payload as T;
  } catch {
    return null;
  }
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true as const,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  };
}

export function setFamilyCookie(response: NextResponse, familyId: string) {
  response.cookies.set(FAMILY_COOKIE, sign({ familyId }, FAMILY_MAX_AGE), cookieOptions(FAMILY_MAX_AGE));
}

export function setResponsavelCookie(response: NextResponse, familyId: string, userId: string) {
  response.cookies.set(
    RESPONSAVEL_COOKIE,
    sign({ familyId, userId }, RESPONSAVEL_MAX_AGE),
    cookieOptions(RESPONSAVEL_MAX_AGE)
  );
}

export function clearResponsavelCookie(response: NextResponse) {
  response.cookies.set(RESPONSAVEL_COOKIE, '', cookieOptions(0));
}

export function getFamilySession(): FamilySession | null {
  return verify<FamilySession>(cookies().get(FAMILY_COOKIE)?.value);
}

export function getResponsavelSession(): ResponsavelSession | null {
  return verify<ResponsavelSession>(cookies().get(RESPONSAVEL_COOKIE)?.value);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function getFamilyChild(familyId: string) {
  return prisma.user.findFirst({ where: { familyId, role: 'CHILD' } });
}
