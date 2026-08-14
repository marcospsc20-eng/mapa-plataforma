import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getFamilyChild, getFamilySession, getResponsavelSession } from '../../../lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Listar envios aguardando validação da própria família (para o Observatório)
export async function GET() {
  try {
    const sessao = getResponsavelSession();

    if (!sessao) {
      return NextResponse.json(
        { error: 'Só o Responsável pode ver os envios do diário. Entre com e-mail e senha no Observatório.' },
        { status: 401 }
      );
    }

    const pendentes = await prisma.missionLog.findMany({
      where: {
        status: 'PENDING_VALIDATION',
        user: {
          familyId: sessao.familyId,
        },
      },
      include: {
        mission: true,
        user: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    const lista = pendentes.map((item) => ({
      id: item.id,
      titulo: item.mission.title,
      area: item.mission.skillArea,
      xp: item.mission.xpReward,
      filho: item.user.name,
      feedbackText: item.feedbackText,
      missionId: item.missionId,
      userId: item.userId,
    }));

    return NextResponse.json(lista, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  } catch (error) {
    console.error('Erro ao listar diário:', error);
    return NextResponse.json(
      { error: 'Erro ao listar envios do diário' },
      { status: 500 }
    );
  }
}

// A criança envia registro de missão para validação dos pais
export async function POST(request: Request) {
  try {
    const sessao = getFamilySession();

    if (!sessao) {
      return NextResponse.json(
        { error: 'Este aparelho não está vinculado a nenhuma família.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const missionId = String(body?.missionId || '');
    const feedbackText = String(body?.feedbackText || '').trim();

    if (!missionId) {
      return NextResponse.json(
        { error: 'missionId é obrigatório' },
        { status: 400 }
      );
    }

    if (!feedbackText) {
      return NextResponse.json(
        { error: 'Escreva o registro do diário antes de enviar' },
        { status: 400 }
      );
    }

    const crianca = await getFamilyChild(sessao.familyId);

    if (!crianca) {
      return NextResponse.json(
        { error: 'Criança da família não encontrada' },
        { status: 404 }
      );
    }

    const missao = await prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!missao || missao.familyId !== sessao.familyId) {
      return NextResponse.json(
        { error: 'Missão não encontrada' },
        { status: 404 }
      );
    }

    const log = await prisma.missionLog.create({
      data: {
        userId: crianca.id,
        missionId: missao.id,
        status: 'PENDING_VALIDATION',
        feedbackText,
      },
    });

    // Também guarda no diário/memória
    await prisma.journalEntry.create({
      data: {
        userId: crianca.id,
        question: `Registro da missão: ${missao.title}`,
        type: 'TEXT',
        content: feedbackText,
      },
    });

    return NextResponse.json({
      ok: true,
      logId: log.id,
      status: log.status,
      missionTitle: missao.title,
    });
  } catch (error) {
    console.error('Erro ao salvar diário:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar registro do diário' },
      { status: 500 }
    );
  }
}
