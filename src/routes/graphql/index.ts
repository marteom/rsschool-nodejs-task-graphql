import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { MemberType, MemberTypeId} from './types/member-type.js';
import { memberTypeResolver, memberTypesResolver } from './resolvers/member-type.resolver.js';
import { graphql, GraphQLSchema, GraphQLObjectType, GraphQLList } from 'graphql';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {

  const { prisma } = fastify;

  const graphQLSchema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'resourcesSchema',
      fields: {
        memberType: {
          type: MemberType,
          args: {
            id: { type: MemberTypeId },
          },
          resolve: async (_, args) => memberTypeResolver(args, prisma),
        },
        memberTypes: {
          type: new GraphQLList(MemberType),
          resolve: async () => await memberTypesResolver(prisma),
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
