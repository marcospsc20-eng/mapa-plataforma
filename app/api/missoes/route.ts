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

  if (!cookie) return false;

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

    // A tela do Thales já lê "description".
    // Portanto, aqui ela recebe a tarefa atual.
    description: tarefaAtual,

    // Informações extras para o Observatório e futuras telas.
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
 * Retorna somente as missões fixas do painel do Thales.
 *
 * Regra:
 * - Missão é um card estável.
 * - Tarefa é o texto dentro do card.
 * - Se existirem duplicatas antigas no banco, só a missão mais antiga
 *   daquela área é exibida.
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

    // Mantém apenas UMA missão fixa por área.
    // Como a lista está em ordem crescente, a primeira é a original do seed.
    const primeiraPorArea = new Map<string, MissaoDoBanco>();

    for (const missao of todasAsMissoes) {
      const area = String(missao.skillArea || '').trim().toUpperCase();

      if (!area) continue;

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
 * Bloqueado de propósito.
 *
 * Antes, esse endpoint criava uma nova linha na tabela Mission e,
 * consequentemente, criava uma nova carta no painel do Thales.
 *
 * Agora o fluxo correto é atualizar a tarefa da missão fixa usando:
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
        'Não criamos cards de missão novos. Atualize a tarefa dentro de uma missão fixa usando PATCH /api/missoes/tarefa.',
      code: 'USE_TAREFA_ENDPOINT',
    },
    400
  );
}
