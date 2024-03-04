import { PrismaClient } from '@prisma/client';

export const userResolver = async (args: Record<string, any>, prisma: PrismaClient) => {
  const user = await prisma.user.findUnique({ where: { id: args.id } });

  if (!user) {
    return null;
  }

  const userSubscribers = await prisma.subscribersOnAuthors.findMany({
    where: { subscriberId: user?.id },
  });

  let usersAuthorsUser = await prisma.user.findMany({
    where: {
      id: {
        in: userSubscribers.map((subscription) => subscription.authorId),
      },
    },
  });

  const authorsUser = await Promise.all(
    usersAuthorsUser.map(async (author) => {
      const authorSubsData = await prisma.subscribersOnAuthors.findMany({
        where: { authorId: author.id },
      });

      const subscribersOfThisAuthor = await prisma.user.findMany({
        where: {
          id: {
            in: authorSubsData.map((subscription) => subscription.subscriberId),
          },
        },
      });

      return { ...author, subscribedToUser: subscribersOfThisAuthor };
    }),
  );

  const userAsAuthorData = await prisma.subscribersOnAuthors.findMany({
    where: { authorId: user?.id },
  });

  const usersAsSubscribersOfThisUser = await prisma.user.findMany({
    where: {
      id: {
        in: userAsAuthorData.map((subscription) => subscription.subscriberId),
      },
    },
  });

  const subscribersOfThisUser = await Promise.all(
    usersAsSubscribersOfThisUser.map(async (subscriber) => {
      const subscriberAuthorsData = await prisma.subscribersOnAuthors.findMany({
        where: { subscriberId: subscriber.id },
      });

      const authorsForSubscriber = await prisma.user.findMany({
        where: {
          id: {
            in: subscriberAuthorsData.map((subscription) => subscription.authorId),
          },
        },
      });

      return { ...subscriber, userSubscribedTo: authorsForSubscriber };
    }),
  );

  const profile = await prisma.profile.findUnique({
    where: { userId: user?.id },
  });

  const posts = await prisma.post.findMany({ where: { authorId: user?.id } });

  const userWithProfile = {
    ...user,
    profile: profile ? { ...profile, memberType: { id: profile?.memberTypeId } } : null,
    posts,
    userSubscribedTo: [...authorsUser],
    subscribedToUser: [...subscribersOfThisUser],
  };
  return userWithProfile;
};

export const usersResolver = async (prisma: PrismaClient) => {
  const users = await prisma.user.findMany();

  const promises = users.map(async (user) => {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    const posts = await prisma.post.findMany({ where: { authorId: user.id } });
    return {
      ...user,
      profile: { ...profile, memberType: { id: profile?.memberTypeId } },
      posts,
    };
  });

  try {
    const users = await Promise.all(promises);
    return users;
  } catch (error) {
    console.log('[users resolver error]');
  }
};
