import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { hashPassword, normalizeEmail, setFamilyCookie, setResponsavelCookie } from '../../../../lib/auth';
import { DEFAULT_MISSIONS } from '../../../../lib/defaultMissions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const familyName = String(body?.familyName || '').trim();
    const parentName = String(body?.parentName || '').trim();
    const childName = String(body?.childName || '').trim();
    const email = normalizeEmail(String(body?.email || ''));
    const password = String(body?.password || '');

    if (!familyName || !parentName || !childName || !email || !password) {
      return NextResponse.json({ error: 'Preencha todos os campos.' }, { status: 400 });
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha precisa ter pelo menos 6 caracteres.' },
        { status: 400 }
      );
    }

    const existente = await prisma.user.findUnique({ where: { email } });
    if (existente) {
      return NextResponse.json(
        { error: 'Esse e-mail já tem uma família cadastrada. Use Entrar.' },
        { status: 409 }
      );
    }

    const hashed = await hashPassword(password);

    const { family, parent } = await prisma.$transaction(async (tx) => {
      const family = await tx.family.create({ data: { name: familyName } });

      const parent = await tx.user.create({
        data: {
          familyId: family.id,
          name: parentName,
          email,
          password: hashed,
          role: 'PARENT',
        },
      });

      await tx.user.create({
        data: {
          familyId: family.id,
          name: childName,
          role: 'CHILD',
          progress: { create: {} },
        },
      });

      await tx.mission.createMany({
        data: DEFAULT_MISSIONS.map((missao) => ({ ...missao, familyId: family.id })),
      });

      return { family, parent };
    });

    const response = NextResponse.json({ ok: true });
    setFamilyCookie(response, family.id);
    setResponsavelCookie(response, family.id, parent.id);

    return response;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'Esse e-mail já tem uma família cadastrada. Use Entrar.' },
        { status: 409 }
      );
    }

    console.error('Erro ao cadastrar família:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar família.' }, { status: 500 });
  }
}
