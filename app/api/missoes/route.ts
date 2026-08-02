import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Buscar todas as missões cadastradas
export async function GET() {
  try {
    const missoes = await prisma.missao.findMany();
    return NextResponse.json(missoes);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar missões' }, { status: 500 });
  }
}