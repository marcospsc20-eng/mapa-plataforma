import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const COOKIE_NAME = 'mapa_responsavel';
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 horas

function getParentPin() {
  // Depois colocamos PARENT_PIN na Vercel.
  // Enquanto isso, o PIN provisório da família é este:
  return process.env.PARENT_PIN || '2580';
}

function makeToken(pin: string) {
  return Buffer.from(`thaju-responsavel:${pin}`).toString('base64url');
}

function isAuthorized() {
  const jar = cookies();
  const cookie = jar.get(COOKIE_NAME)?.value;
  if (!cookie) return false;
  return cookie === makeToken(getParentPin());
}

// Verificar se o Responsável já desbloqueou nesta sessão do navegador
export async function GET() {
  return NextResponse.json(
    { ok: isAuthorized() },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    }
  );
}

// Validar PIN e gravar cookie httpOnly
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const pin = String(body?.pin || '').trim();

    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { ok: false, error: 'O PIN deve ter 4 números.' },
        { status: 400 }
      );
    }

    if (pin !== getParentPin()) {
      return NextResponse.json(
        { ok: false, error: 'PIN incorreto.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true });

    response.cookies.set(COOKIE_NAME, makeToken(pin), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.error('Erro ao validar PIN do responsável:', error);
    return NextResponse.json(
      { ok: false, error: 'Erro ao validar PIN.' },
      { status: 500 }
    );
  }
}

// Sair da área do Responsável
export async function DELETE() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });

  return response;
}