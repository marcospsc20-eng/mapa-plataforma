import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getFamilyChild, getFamilySession, getResponsavelSession } from '../../../lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function jsonSemCache(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    },
  });
}

function formatarTransferencia(transfer: {
  id: string;
  amountFree: number;
  amountSave: number;
  status: string;
  requestedAt: Date;
  completedAt: Date | null;
  note: string | null;
}) {
  return {
    id: transfer.id,
    amountFree: transfer.amountFree,
    amountSave: transfer.amountSave,
    status: transfer.status,
    requestedAt: transfer.requestedAt,
    completedAt: transfer.completedAt,
    note: transfer.note,
  };
}

// GET: ver se existe mesada pendente da criança desta família
export async function GET() {
  try {
    const sessao = getFamilySession();

    if (!sessao) {
      return jsonSemCache({ error: 'Este aparelho não está vinculado a nenhuma família.' }, 401);
    }

    const crianca = await getFamilyChild(sessao.familyId);

    if (!crianca) {
      return jsonSemCache({ error: 'Criança da família não encontrada' }, 404);
    }

    const pendente = await prisma.allowanceTransfer.findFirst({
      where: {
        userId: crianca.id,
        status: 'PENDING',
      },
      orderBy: {
        requestedAt: 'desc',
      },
    });

    if (pendente) {
      return jsonSemCache({
        hasPending: true,
        transfer: formatarTransferencia(pendente),
      });
    }

    const ultima = await prisma.allowanceTransfer.findFirst({
      where: {
        userId: crianca.id,
      },
      orderBy: {
        requestedAt: 'desc',
      },
    });

    return jsonSemCache({
      hasPending: false,
      transfer: ultima ? formatarTransferencia(ultima) : null,
    });
  } catch (error) {
    console.error('Erro ao buscar mesada:', error);
    return jsonSemCache({ error: 'Erro ao buscar mesada' }, 500);
  }
}

// POST:
// - action: "solicitar"  -> a criança pede a mesada
// - action: "confirmar"  -> o Responsável marca como feita
export async function POST(request: Request) {
  try {
    const familySessao = getFamilySession();

    if (!familySessao) {
      return jsonSemCache({ error: 'Este aparelho não está vinculado a nenhuma família.' }, 401);
    }

    const body = await request.json();
    const action = String(body?.action || '').toLowerCase();

    const crianca = await getFamilyChild(familySessao.familyId);

    if (!crianca) {
      return jsonSemCache({ error: 'Criança da família não encontrada' }, 404);
    }

    // Criança solicita
    if (action === 'solicitar') {
      const amountFree = Number(body?.amountFree ?? 80);
      const amountSave = Number(body?.amountSave ?? 20);
      const note =
        typeof body?.note === 'string' && body.note.trim()
          ? body.note.trim()
          : 'Solicitação de mesada do ciclo';

      if (Number.isNaN(amountFree) || Number.isNaN(amountSave)) {
        return jsonSemCache({ error: 'Valores inválidos' }, 400);
      }

      if (amountFree < 0 || amountSave < 0) {
        return jsonSemCache({ error: 'Valores não podem ser negativos' }, 400);
      }

      const jaPendente = await prisma.allowanceTransfer.findFirst({
        where: {
          userId: crianca.id,
          status: 'PENDING',
        },
        orderBy: {
          requestedAt: 'desc',
        },
      });

      // Se já existe pendente, não cria outra
      if (jaPendente) {
        return jsonSemCache({
          ok: true,
          alreadyPending: true,
          transfer: formatarTransferencia(jaPendente),
        });
      }

      const criada = await prisma.allowanceTransfer.create({
        data: {
          userId: crianca.id,
          amountFree,
          amountSave,
          status: 'PENDING',
          note,
        },
      });

      return jsonSemCache({
        ok: true,
        alreadyPending: false,
        transfer: formatarTransferencia(criada),
      });
    }

    // RESPONSÁVEL confirma
    if (action === 'confirmar') {
      const responsavelSessao = getResponsavelSession();

      if (!responsavelSessao) {
        return jsonSemCache(
          { error: 'Só o Responsável pode confirmar a mesada. Entre com e-mail e senha no Observatório.' },
          401
        );
      }

      const transferId = String(body?.transferId || '');

      let pendente = null;

      if (transferId) {
        pendente = await prisma.allowanceTransfer.findFirst({
          where: {
            id: transferId,
            userId: crianca.id,
          },
        });
      } else {
        pendente = await prisma.allowanceTransfer.findFirst({
          where: {
            userId: crianca.id,
            status: 'PENDING',
          },
          orderBy: {
            requestedAt: 'desc',
          },
        });
      }

      if (!pendente) {
        return jsonSemCache(
          { error: 'Nenhuma solicitação de mesada pendente' },
          404
        );
      }

      if (pendente.status === 'COMPLETED') {
        return jsonSemCache({
          ok: true,
          alreadyCompleted: true,
          transfer: formatarTransferencia(pendente),
        });
      }

      if (pendente.status !== 'PENDING') {
        return jsonSemCache(
          { error: `Status inválido para confirmação: ${pendente.status}` },
          400
        );
      }

      const atualizada = await prisma.allowanceTransfer.update({
        where: { id: pendente.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      return jsonSemCache({
        ok: true,
        alreadyCompleted: false,
        transfer: formatarTransferencia(atualizada),
      });
    }

    return jsonSemCache(
      { error: 'Action inválida. Use "solicitar" ou "confirmar".' },
      400
    );
  } catch (error) {
    console.error('Erro ao processar mesada:', error);
    return jsonSemCache({ error: 'Erro ao processar mesada' }, 500);
  }
}
