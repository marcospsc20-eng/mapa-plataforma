import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const COOKIE_NAME = 'mapa_responsavel';

const AREAS_VALIDAS = [
  'EXPLORADOR',
  'CRIADOR',
  'ATLETA',
  'CIENTISTA',
  'FAMILIA',
  'LEITURA',
] as const;

function jsonSemCache(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    },
  });
}

function getParentPin() {
  return process.env.PARENT_PIN || '2580';
}

function makeToken(pin: string) {
  return Buffer.from(`thaju-responsavel:${pin}`).toString('base64url');
}

function isResponsavelAutorizado() {
  const jar = cookies();
  const cookie = jar.get(COOKIE_NAME)?.value;
  if (!cookie) return false;
  return cookie === makeToken(getParentPin());
}

// GET: lista as missões para o painel do Thales e do Observatório
export async function GET() {
  try {
    const missoes = await prisma.mission.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return jsonSemCache(missoes);
  } catch (error) {
    console.error('Erro ao buscar missões:', error);
    return jsonSemCache({ error: 'Erro ao buscar missões' }, 500);
  }
}

// POST: Responsável cria uma nova missão (precisa do cookie do PIN)
export async function POST(request: Request) {
  try {
    if (!isResponsavelAutorizado()) {
      return jsonSemCache(
        { error: 'Somente o Responsável pode criar missões. Entre com o PIN no Observatório.' },
        401
      );
    }

    const body = await request.json();

    const title = String(body?.title || '').trim();
    const description = String(body?.description || '').trim();
    const skillArea = String(body?.skillArea || '')
      .trim()
      .toUpperCase();
    const xpReward = Number(body?.xpReward ?? 25);
    const icon =
      typeof body?.icon === 'string' && body.icon.trim()
        ? body.icon.trim()
        : null;

    if (!title) {
      return jsonSemCache({ error: 'Informe o título da missão.' }, 400);
    }

    if (!description) {
      return jsonSemCache({ error: 'Informe a descrição da missão.' }, 400);
    }

    if (!AREAS_VALIDAS.includes(skillArea as (typeof AREAS_VALIDAS)[number])) {
      return jsonSemCache(
        {
          error:
            'Área inválida. Use: EXPLORADOR, CRIADOR, ATLETA, CIENTISTA, FAMILIA ou LEITURA.',
        },
        400
      );
    }

    if (!Number.isFinite(xpReward) || xpReward < 1 || xpReward > 500) {
      return jsonSemCache(
        { error: 'XP inválido. Use um número entre 1 e 500.' },
        400
      );
    }

    // Liga a missão à família do Thales, se existir
    const thales = await prisma.user.findFirst({
      where: {
        name: 'Thales',
        role: 'CHILD',
      },
    });

    const criada = await prisma.mission.create({
      data: {
        title,
        description,
        skillArea,
        xpReward: Math.round(xpReward),
        icon,
        isAiGenerated: false,
        familyId: thales?.familyId ?? null,
      },
    });

    return jsonSemCache({
      ok: true,
      mission: criada,
    });
  } catch (error) {
    console.error('Erro ao criar missão:', error);
    return jsonSemCache({ error: 'Erro ao criar missão no banco.' }, 500);
  }
}