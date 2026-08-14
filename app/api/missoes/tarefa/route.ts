import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const COOKIE_NAME = 'mapa_responsavel';

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

/**
 * PATCH /api/missoes/tarefa
 * Responsável atualiza a TAREFA DO DIA de uma missão fixa (isTrack).
 * NÃO cria card novo.
 *
 * Body JSON:
 * {
 *   "missionId": "uuid-da-missao-fixa",
 *   "activeTask": "Ler um texto em inglês e contar 3 palavras novas",
 *   "xpReward": 25   // opcional
 * }
 */
export async function PATCH(request: Request) {
  try {
    if (!isResponsavelAutorizado()) {
      return jsonSemCache(
        { error: 'Só o Responsável pode atualizar a tarefa. Entre com o PIN no Observatório.' },
        401
      );
    }

    const body = await request.json();
    const missionId = String(body?.missionId || '').trim();
    const activeTask = String(body?.activeTask ?? '').trim();

    if (!missionId) {
      return jsonSemCache({ error: 'missionId é obrigatório' }, 400);
    }

    if (!activeTask) {
      return jsonSemCache({ error: 'activeTask não pode ficar vazia' }, 400);
    }

    if (activeTask.length > 500) {
      return jsonSemCache({ error: 'activeTask muito longa (máx. 500 caracteres)' }, 400);
    }

    const missao = await prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!missao) {
      return jsonSemCache({ error: 'Missão não encontrada' }, 404);
    }

    if (missao.isTrack === false) {
      return jsonSemCache(
        {
          error:
            'Esta não é uma missão fixa do painel. Atualize só as cartas isTrack (EXPLORADOR, CRIADOR...).',
        },
        400
      );
    }

    const data: {
      activeTask: string;
      xpReward?: number;
      updatedAt: Date;
    } = {
      activeTask,
      updatedAt: new Date(),
    };

    if (body?.xpReward !== undefined && body?.xpReward !== null && body?.xpReward !== '') {
      const xp = Number(body.xpReward);
      if (Number.isNaN(xp) || xp < 0 || xp > 1000) {
        return jsonSemCache({ error: 'xpReward inválido (use 0 a 1000)' }, 400);
      }
      data.xpReward = Math.round(xp);
    }

    const atualizada = await prisma.mission.update({
      where: { id: missionId },
      data,
    });

    return jsonSemCache({
      ok: true,
      mission: {
        id: atualizada.id,
        title: atualizada.title,
        description: atualizada.description,
        activeTask: atualizada.activeTask,
        skillArea: atualizada.skillArea,
        xpReward: atualizada.xpReward,
        isTrack: atualizada.isTrack,
        updatedAt: atualizada.updatedAt,
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar tarefa da missão:', error);
    return jsonSemCache({ error: 'Erro ao atualizar tarefa da missão' }, 500);
  }
}
