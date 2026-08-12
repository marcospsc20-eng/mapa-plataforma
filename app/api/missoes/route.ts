import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '../../../lib/prisma';

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

  if (!cookie) {
    return false;
  }

  return cookie === makeToken(getParentPin());
}

type MissaoDoBanco = {
  id: string;
  familyId: string | null;
  title: string;
  description: string;
  skillArea: string;
  xpReward: number;
  icon: string | null;
  isAiGenerated: boolean;
  activeTask: string;
  isTrack: boolean;
  createdAt: Date;
  updatedAt: Date | null;
};

function formatarMissaoParaTela(missao: MissaoDoBanco) {
  const tarefaAtual =
    typeof missao.activeTask === 'string' && missao.activeTask.trim().length > 0
      ? missao.activeTask.trim()
      : missao.description;

  return {
    id: missao.id,
    familyId: missao.familyId,
    title: missao.title,

    // A tela do Thales já usa o campo "description".
    // Aqui ele recebe a tarefa atual, sem criar uma carta nova.
    description: tarefaAtual,

    baseDescription: missao.description,
    activeTask: missao.activeTask || '',
    skillArea: missao.skillArea,
    xpReward: missao.xpReward,
    icon: missao.icon,
    isAiGenerated: missao.isAiGenerated,
    isTrack: missao.isTrack,
    createdAt: missao.createdAt,
    updatedAt: missao.updatedAt,
  };
}

/**
 * GET /api/missoes
 *
 * Retorna as cartas fixas do painel do Thales.
 * Se houver duplicata antiga no banco, mantém somente a carta mais antiga
 * daquela área.
 */
export async function GET() {
  try {
    const todasAsMissoes = await prisma.mission.findMany({
      where: {
        isTrack: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const primeiraPorArea = new Map<string, MissaoDoBanco>();

    for (const missao of todasAsMissoes) {
      const area = String(missao.skillArea || '').trim().toUpperCase();

      if (!area) {
        continue;
      }

      // Como a busca está em ordem crescente, a primeira é a carta original.
      if (!primeiraPorArea.has(area)) {
        primeiraPorArea.set(area, missao);
      }
    }

    const missoesFixas = Array.from(primeiraPorArea.values()).map(
      formatarMissaoParaTela
    );

    return jsonSemCache(missoesFixas);
  } catch (error) {
    console.error('Erro ao buscar missões:', error);

    return jsonSemCache(
      { error: 'Erro ao buscar missões.' },
      500
    );
  }
}

/**
 * POST /api/missoes
 *
 * Bloqueado de propósito: não se cria mais card de missão novo.
 * O Responsável deve atualizar a tarefa do card fixo usando:
 * PATCH /api/missoes/tarefa
 */
export async function POST() {
  if (!isResponsavelAutorizado()) {
    return jsonSemCache(
      {
        error:
          'Somente o Responsável pode gerenciar tarefas. Entre com o PIN no Observatório.',
      },
      401
    );
  }

  return jsonSemCache(
    {
      error:
        'Não criamos cards de missão novos. Atualize a tarefa dentro de uma missão fixa.',
      code: 'USE_TAREFA_ENDPOINT',
    },
    400
  );
}