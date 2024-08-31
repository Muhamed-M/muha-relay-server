import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const findUsersBySearch = async (search: string, loggedUserId: number) => {
  const whereObj: any = {};

  if (search) {
    whereObj['OR'] = [
      {
        username: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        email: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        firstName: {
          contains: search,
          mode: 'insensitive',
        },
      },
    ];
  }
  const users = await prisma.user.findMany({
    where: {
      ...whereObj,
      NOT: {
        id: loggedUserId,
      },
    },
    take: 5,
  });

  return users;
};
