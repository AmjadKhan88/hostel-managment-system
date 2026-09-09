import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectDB, disconnectDB } from './config/db.js';

async function bootstrap() {
  await connectDB();

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 API listening on http://localhost:${env.PORT}${env.API_PREFIX}`);
    logger.info(`📄 API docs available at http://localhost:${env.PORT}/api-docs`);
  });

  // Socket.IO, BullMQ workers, and scheduled jobs attach to `server` /
  // the Redis connection starting from the day those features are built.

  const shutdown = async (signal) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      await disconnectDB();
      logger.info('Shutdown complete');
      process.exit(0);
    });

    // Force-exit if graceful shutdown hangs.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error({ err: reason }, 'Unhandled promise rejection');
  });

  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught exception — exiting');
    process.exit(1);
  });
}

bootstrap();
