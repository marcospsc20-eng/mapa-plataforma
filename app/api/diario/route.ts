import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Listar envios aguardando validação (para o Observatório)
export async function GET() {
  try {
    const pendentes = await prisma.missionLog.findMany({
      where: {
        status: 'PENDING_VALIDATION',
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

// Thales envia registro de missão para validação dos pais
export async function POST(request: Request) {
  try {
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

    const thales = await prisma.user.findFirst({
      where: {
        name: 'Thales',
        role: 'CHILD',
      },
    });

    if (!thales) {
      return NextResponse.json(
        { error: 'Usuário Thales não encontrado' },
        { status: 404 }
      );
    }

    const missao = await prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!missao) {
      return NextResponse.json(
        { error: 'Missão não encontrada' },
        { status: 404 }
      );
    }

    const log = await prisma.missionLog.create({
      data: {
        userId: thales.id,
        missionId: missao.id,
        status: 'PENDING_VALIDATION',
        feedbackText,
      },
    });

    // Também guarda no diário/memória
    await prisma.journalEntry.create({
      data: {
        userId: thales.id,
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