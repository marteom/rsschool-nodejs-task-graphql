import { PrismaClient } from '@prisma/client';

export const memberTypeResolver = async (
    args: Record<string, any>,
    prisma: PrismaClient,
  ) => {
    return await prisma.memberType.findUnique({
      where: { id: args.id },
    });
  };

export const memberTypesResolver = async (prisma: PrismaClient) =>
  await prisma.memberType.findMany();
