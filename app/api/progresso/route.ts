import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const COOKIE_NAME = 'mapa_responsavel';

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

// Creditar XP ao Thales e marcar a missão como aprovada (usado pelo Observatório)
export async function POST(request: Request) {
  try {
    if (!isResponsavelAutorizado()) {
      return NextResponse.json(
        { error: 'Só o Responsável pode aprovar missões. Entre com o PIN no Observatório.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const xpAdicional = Number(body?.xpAdicional || 0);
    const logId = body?.logId ? String(body.logId) : '';

    if (!xpAdicional || xpAdicional <= 0) {
      return NextResponse.json(
        { error: 'xpAdicional inválido' },
        { status: 400 }
      );
    }

    if (!logId) {
      return NextResponse.json(
        { error: 'logId é obrigatório para aprovar a missão' },
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

    // Busca o envio pendente
    const log = await prisma.missionLog.findUnique({
      where: { id: logId },
      include: {
        mission: true,
      },
    });

    if (!log) {
      return NextResponse.json(
        { error: 'Registro da missão não encontrado' },
        { status: 404 }
      );
    }

    // Já foi aprovada antes? Não soma XP de novo e não deixa voltar pra lista
    if (log.status === 'APPROVED' || log.status === 'COMPLETED') {
      return NextResponse.json({
        ok: true,
        alreadyApproved: true,
        name: thales.name,
        xpAdicionado: 0,
        totalXp: thales.progress.totalXp,
        level: thales.progress.level,
      });
    }

    if (log.status !== 'PENDING_VALIDATION') {
      return NextResponse.json(
        { error: `Status inválido para aprovação: ${log.status}` },
        { status: 400 }
      );
    }

    const area = (log.mission?.skillArea || '').toUpperCase();
    const novoTotalXp = thales.progress.totalXp + xpAdicional;
    const novoLevel = Math.max(1, Math.floor(novoTotalXp / 100) + 1);

    // Prepara o XP por área (quando fizer sentido)
    const dataProgresso: {
      totalXp: number;
      level: number;
      xpExplorador?: number;
      xpCriador?: number;
      xpAtleta?: number;
      xpCientista?: number;
    } = {
      totalXp: novoTotalXp,
      level: novoLevel,
    };

    if (area === 'EXPLORADOR') {
      dataProgresso.xpExplorador = thales.progress.xpExplorador + xpAdicional;
    } else if (area === 'CRIADOR') {
      dataProgresso.xpCriador = thales.progress.xpCriador + xpAdicional;
    } else if (area === 'ATLETA' || area === 'CORPO') {
      dataProgresso.xpAtleta = thales.progress.xpAtleta + xpAdicional;
    } else if (area === 'CIENTISTA' || area === 'CURIOSIDADE') {
      dataProgresso.xpCientista = thales.progress.xpCientista + xpAdicional;
    }

    // 1) Marca a missão como APROVADA (sai da lista do Observatório)
    await prisma.missionLog.update({
      where: { id: logId },
      data: {
        status: 'APPROVED',
        completedAt: new Date(),
      },
    });

    // 2) Credita o XP
    const progressAtualizado = await prisma.childProgress.update({
      where: { id: thales.progress.id },
      data: dataProgresso,
    });

    return NextResponse.json({
      ok: true,
      name: thales.name,
      xpAdicionado: xpAdicional,
      totalXp: progressAtualizado.totalXp,
      level: progressAtualizado.level,
      logId,
      status: 'APPROVED',
    });
  } catch (error) {
    console.error('Erro ao atualizar progresso:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar progresso' },
      { status: 500 }
    );
  }
}