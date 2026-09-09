import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

/**
 * A single ioredis connection factory. BullMQ requires
 * maxRetriesPerRequest: null on connections it manages, so job queues/workers
 * should call createRedisConnection() rather than reusing an app-level client.
 */
export function createRedisConnection({ forBullMQ = false } = {}) {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: forBullMQ ? null : 20,
    enableReadyCheck: true,
  });

  client.on('error', (err) => {
    logger.error({ err }, 'Redis connection error');
  });

  client.on('connect', () => {
    logger.info(forBullMQ ? 'Redis (BullMQ) connected' : 'Redis connected');
  });

  return client;
}
