import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';

import { typeDefs } from './schema/typeDefs';
import { resolvers } from './resolvers';
import { createLoaders } from './dataloaders';
import pool from './db/postgres';
import redis from './db/redis';

dotenv.config();

async function startServer() {
  const app: express.Application = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => {
      // Create fresh DataLoaders for each request
      const loaders = createLoaders();
      return { loaders };
    },
    introspection: true,
  });

  await server.start();

  server.applyMiddleware({ 
    app,
    path: '/graphql',
    cors: true,
  });

  app.use(cors());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const PORT = process.env.PORT || 4000;
  
  httpServer.listen({ port: PORT }, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀  Soccer GraphQL API Server Ready!                  ║
║                                                          ║
║   📊  GraphQL Playground: http://localhost:${PORT}${server.graphqlPath}
║   ❤️   Health Check: http://localhost:${PORT}/health         ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝

Try this query:

query {
  competitions
  seasons
}
    `);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await pool.end();
  redis.disconnect();
  process.exit(0);
});

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});