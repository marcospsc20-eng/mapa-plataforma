import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const prisma = new PrismaClient();

// Buscar todas as missões cadastradas no Neon
export async function GET() {
  try {
    const missoes = await prisma.mission.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(missoes, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar missões:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar missões' },
      { status: 500 }
    );
  }
}