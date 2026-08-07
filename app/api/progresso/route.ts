import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Ler o progresso atual do Thales
export async function GET() {
  try {
    const thales = await prisma.user.findFirst({
      where: {
        name: 'Thales',
        role: 'CHILD',
      },
      include: {
        progress: true,
      },
    });

    if (!thales || !thales.progress) {
      return NextResponse.json(
        { error: 'Progresso do Thales não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        userId: thales.id,
        name: thales.name,
        totalXp: thales.progress.totalXp,
        level: thales.progress.level,
        xpExplorador: thales.progress.xpExplorador,
        xpCriador: thales.progress.xpCriador,
        xpAtleta: thales.progress.xpAtleta,
        xpCientista: thales.progress.xpCientista,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Erro ao buscar progresso:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar progresso' },
      { status: 500 }
    );
  }
}

// Creditar XP ao Thales (usado pelo Observatório)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const xpAdicional = Number(body?.xpAdicional || 0);

    if (!xpAdicional || xpAdicional <= 0) {
      return NextResponse.json(
        { error: 'xpAdicional inválido' },
        { status: 400 }
      );
    }

    const thales = await prisma.user.findFirst({
      where: {
        name: 'Thales',
        role: 'CHILD',
      },
      include: {
        progress: true,
      },
    });

    if (!thales || !thales.progress) {
      return NextResponse.json(
        { error: 'Progresso do Thales não encontrado' },
        { status: 404 }
      );
    }

    const novoTotalXp = thales.progress.totalXp + xpAdicional;
    const novoLevel = Math.max(1, Math.floor(novoTotalXp / 100) + 1);

    const progressAtualizado = await prisma.childProgress.update({
      where: { id: thales.progress.id },
      data: {
        totalXp: novoTotalXp,
        level: novoLevel,
      },
    });

    return NextResponse.json({
      ok: true,
      name: thales.name,
      xpAdicionado: xpAdicional,
      totalXp: progressAtualizado.totalXp,
      level: progressAtualizado.level,
    });
  } catch (error) {
    console.error('Erro ao atualizar progresso:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar progresso' },
      { status: 500 }
    );
  }
}