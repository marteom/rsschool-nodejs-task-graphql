import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { MemberType, MemberTypeId} from './types/member-type.js';
import { memberTypeResolver, memberTypesResolver } from './resolvers/member-type.resolver.js';
import { graphql, GraphQLSchema, GraphQLObjectType, GraphQLList } from 'graphql';
import { postResolver, postsResolver } from './resolvers/post.resolver.js';
import { PostType } from './types/post.js';
import { UserType } from './types/user.js';
import { userResolver, usersResolver } from './resolvers/user.resolver.js';
import { ProfileType } from './types/profile.js';
import { profileResolver, profilesResolver } from './resolvers/profile.resolver.js';
import { UUIDType } from './types/uuid.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {

  const { prisma } = fastify;

  const graphQLSchema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'resourcesSchema',
      fields: {
        memberTypes: {
          type: new GraphQLList(MemberType),
          resolve: async () => await memberTypesResolver(prisma),
        },
        posts: {
          type: new GraphQLList(PostType),
          resolve: async () => await postsResolver(prisma),
        },
        users: {
          type: new GraphQLList(UserType),
          resolve: async () => usersResolver(prisma),
        },
        profiles: {
          type: new GraphQLList(ProfileType),
          resolve: async () => await profilesResolver(prisma),
        },

        memberType: {
          type: MemberType,
          args: {
            id: { type: MemberTypeId },
          },
          resolve: async (_, args) => memberTypeResolver(args, prisma),
        },
        post: {
          type: PostType,
          args: {
            id: { type: UUIDType },
          },
          resolve: async (_, args) => postResolver(args, prisma),
        },

        user: {
          type: UserType,
          args: {
            id: { type: UUIDType },
          },
          resolve: async (_, args) => userResolver(args, prisma),
        },

        profile: {
          type: ProfileType,
          args: {
            id: { type: UUIDType },
          },
          resolve: async (_, args) => profileResolver(args, prisma),
        },
      }
    })
  })

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const { query, variables } = req.body;

      const result = await graphql({
        schema: graphQLSchema,
        source: query,
        variableValues: variables,
      });
      return result;
    },
  });
};

export default plugin;
