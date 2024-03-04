import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, GraphQLSchema } from 'graphql';
import { Queries } from './queries/queries.js';
import { Mutations } from './mutations/mutations.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {

  const { prisma } = fastify;

  const graphQLSchema = new GraphQLSchema({
    query: Queries(prisma),
    mutation: Mutations(prisma)
  });

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
