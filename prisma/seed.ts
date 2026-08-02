import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Criar a Família
  const family = await prisma.family.create({
    data: {
      name: 'Família Oliveira',
    },
  });

  // 2. Criar os Usuários
  const thales = await prisma.user.create({
    data: {
      name: 'Thales',
      role: 'CHILD',
      familyId: family.id,
      progress: {
        create: {
          totalXp: 150,
          level: 2,
          xpExplorador: 35,
          xpCriador: 50,
          xpAtleta: 30,
          xpCientista: 35,
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      name: 'Marcos',
      email: 'marcos@email.com',
      role: 'PARENT',
      familyId: family.id,
    },
  });

  // 3. Criar as primeiras Cartas de Missão
  await prisma.mission.createMany({
    data: [
      {
        title: 'MISSÃO EXPLORADOR',
        description: 'Descubra cinco palavras novas em inglês.',
        skillArea: 'EXPLORADOR',
        xpReward: 35,
      },
      {
        title: 'MISSÃO CRIADOR',
        description: 'Construa algo no Minecraft e explique como fez.',
        skillArea: 'CRIADOR',
        xpReward: 50,
      },
      {
        title: 'MISSÃO FAMÍLIA',
        description: 'Pergunte ao papai qual era o desenho favorito dele.',
        skillArea: 'FAMILIA',
        xpReward: 40,
      },
      {
        title: 'MISSÃO CORPO',
        description: 'Jogue bola por vinte minutos.',
        skillArea: 'ATLETA',
        xpReward: 30,
      },
      {
        title: 'MISSÃO CURIOSIDADE',
        description: 'Assista a um vídeo científico e conte uma descoberta.',
        skillArea: 'CIENTISTA',
        xpReward: 25,
      },
    ],
  });

  console.log('✅ SEED EXECUTADO! Família Oliveira e Missões cadastradas com sucesso.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });