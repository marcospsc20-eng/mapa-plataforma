import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getFamilyChild, getFamilySession, getResponsavelSession } from '../../../lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Ler o progresso atual da criança desta família
export async function GET() {
  try {
    const sessao = getFamilySession();

    if (!sessao) {
      return NextResponse.json(
        { error: 'Este aparelho não está vinculado a nenhuma família.' },
        { status: 401 }
      );
    }

    const crianca = await prisma.user.findFirst({
      where: { familyId: sessao.familyId, role: 'CHILD' },
      include: { progress: true },
    });

    if (!crianca || !crianca.progress) {
      return NextResponse.json(
        { error: 'Progresso da criança não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        userId: crianca.id,
        name: crianca.name,
        totalXp: crianca.progress.totalXp,
        level: crianca.progress.level,
        xpExplorador: crianca.progress.xpExplorador,
        xpCriador: crianca.progress.xpCriador,
        xpAtleta: crianca.progress.xpAtleta,
        xpCientista: crianca.progress.xpCientista,
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

// Creditar XP à criança e marcar a missão como aprovada (usado pelo Observatório)
export async function POST(request: Request) {
  try {
    const sessao = getResponsavelSession();

    if (!sessao) {
      return NextResponse.json(
        { error: 'Só o Responsável pode aprovar missões. Entre com e-mail e senha no Observatório.' },
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

    const crianca = await getFamilyChild(sessao.familyId);

    if (!crianca) {
      return NextResponse.json(
        { error: 'Criança da família não encontrada' },
        { status: 404 }
      );
    }

    const progressoAtual = await prisma.childProgress.findUnique({
      where: { userId: crianca.id },
    });

    if (!progressoAtual) {
      return NextResponse.json(
        { error: 'Progresso da criança não encontrado' },
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

    if (log.userId !== crianca.id) {
      return NextResponse.json(
        { error: 'Esse registro não pertence à sua família.' },
        { status: 403 }
      );
    }

    // Já foi aprovada antes? Não soma XP de novo e não deixa voltar pra lista
    if (log.status === 'APPROVED' || log.status === 'COMPLETED') {
      return NextResponse.json({
        ok: true,
        alreadyApproved: true,
        name: crianca.name,
        xpAdicionado: 0,
        totalXp: progressoAtual.totalXp,
        level: progressoAtual.level,
      });
    }

    if (log.status !== 'PENDING_VALIDATION') {
      return NextResponse.json(
        { error: `Status inválido para aprovação: ${log.status}` },
        { status: 400 }
      );
    }

    const area = (log.mission?.skillArea || '').toUpperCase();
    const novoTotalXp = progressoAtual.totalXp + xpAdicional;
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
      dataProgresso.xpExplorador = progressoAtual.xpExplorador + xpAdicional;
    } else if (area === 'CRIADOR') {
      dataProgresso.xpCriador = progressoAtual.xpCriador + xpAdicional;
    } else if (area === 'ATLETA' || area === 'CORPO') {
      dataProgresso.xpAtleta = progressoAtual.xpAtleta + xpAdicional;
    } else if (area === 'CIENTISTA' || area === 'CURIOSIDADE') {
      dataProgresso.xpCientista = progressoAtual.xpCientista + xpAdicional;
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
      where: { id: progressoAtual.id },
      data: dataProgresso,
    });

    return NextResponse.json({
      ok: true,
      name: crianca.name,
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
