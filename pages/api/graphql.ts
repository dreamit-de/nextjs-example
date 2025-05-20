// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import {
  ExecutionResult
} from 'graphql'

import { 
  GraphQLServer, 
  JsonLogger 
} from '@dreamit/graphql-server'
import { 
  userSchema,
  userSchemaResolvers 
} from '@dreamit/graphql-testing'

const graphqlServer = new GraphQLServer(
  {
      schema: userSchema,
      rootValue: userSchemaResolvers,
      logger: new JsonLogger('fastifyServer', 'user-service')
  }
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExecutionResult>
) {
  await graphqlServer.handleRequest(req, {
    end: function(chunk) {
      res.end(chunk)
      return this
  },
    removeHeader: res.removeHeader,
    setHeader: function(name, value) {
      res.setHeader(name, value)
      return this 
  },
    statusCode: res.statusCode
  })
}