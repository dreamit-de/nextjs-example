// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import {
  buildSchema,
  GraphQLError,
  GraphQLSchema,
  ExecutionResult
} from 'graphql'

import { 
  GraphQLServer, 
  JsonLogger 
} from '@dreamit/graphql-server'

type Data = {
  name: string
}

interface User {
  userId: string
  userName: string
}

interface LogoutResult {
  result: string
}

export const userOne: User = {userId: '1', userName:'UserOne'}
export const userTwo: User = {userId: '2', userName:'UserTwo'}


const userSchema = buildSchema(`
  schema {
    query: Query
    mutation: Mutation
  }
  
  type Query {
    returnError: User 
    users: [User]
    user(id: String!): User
  }
  
  type Mutation {
    login(userName: String, password: String): LoginData
    logout: LogoutResult
  }
  
  type User {
    userId: String
    userName: String
  }
  
  type LoginData {
    jwt: String
  }
  
  type LogoutResult {
    result: String
  }
`)

const userSchemaResolvers= {
  returnError(): User {
      throw new GraphQLError('Something went wrong!', {})
  },
  users(): User[] {
      return [userOne, userTwo]
  },
  user(input: { id: string }): User {
      switch (input.id) {
      case '1': {
          return userOne
      }
      case '2': {
          return userTwo
      }
      default: {
          throw new GraphQLError(`User for userid=${input.id} was not found`, {})
      }
      }
  },
  logout(): LogoutResult {
      return {result: 'Goodbye!'}
  }
}


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
  await graphqlServer.handleRequest( {
    url: req.url || '',
    method: req.method,
    headers: req.headers,
    body: req.body
  } , res)
}
