import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import {
  clearResponsavelCookie,
  getFamilySession,
  getResponsavelSession,
  normalizeEmail,
  setFamilyCookie,
  setResponsavelCookie,
  verifyPassword,
} from '../../../../lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Verificar se este aparelho já reconhece uma família, e se o Responsável já está autenticado
export async function GET() {
  return NextResponse.json(
    {
      ok: Boolean(getResponsavelSession()),
      familyLinked: Boolean(getFamilySession()),
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    }
  );
}

// Validar e-mail + senha do Responsável e gravar os cookies (família + responsável)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(String(body?.email || ''));
    const password = String(body?.password || '');

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: 'Preencha e-mail e senha.' },
        { status: 400 }
      );
    }

    const usuario = await prisma.user.findUnique({ where: { email } });

    if (!usuario || usuario.role !== 'PARENT' || !usuario.password) {
      return NextResponse.json(
        { ok: false, error: 'E-mail ou senha incorretos.' },
        { status: 401 }
      );
    }

    const senhaCorreta = await verifyPassword(password, usuario.password);

    if (!senhaCorreta) {
      return NextResponse.json(
        { ok: false, error: 'E-mail ou senha incorretos.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true });
    setFamilyCookie(response, usuario.familyId);
    setResponsavelCookie(response, usuario.familyId, usuario.id);

    return response;
  } catch (error) {
    console.error('Erro ao validar login do responsável:', error);
    return NextResponse.json(
      { ok: false, error: 'Não foi possível validar o login agora.' },
      { status: 500 }
    );
  }
}

// Sair da área do Responsável — o aparelho continua reconhecendo a família
// (o Explorador não é afetado), só a sessão de Responsável é esquecida.
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  clearResponsavelCookie(response);
  return response;
}
