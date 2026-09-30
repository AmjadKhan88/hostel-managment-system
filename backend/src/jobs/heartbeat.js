import { createRedisConnection } from '../config/redis.js';

const HEARTBEAT_KEY = 'automation:worker:heartbeat';
const HEARTBEAT_TTL_SECONDS = 60;
const HEARTBEAT_INTERVAL_MS = 20_000;

let redisClient = null;
function getRedisClient() {
  if (!redisClient) redisClient = createRedisConnection();
  return redisClient;
}

/**
 * Called by the worker process on an interval. This is the only thing that
 * proves a worker is actually alive and processing — not just that Redis
 * itself is reachable (the API process can reach Redis too, with no worker
 * running at all).
 */
export function startWorkerHeartbeat() {
  const client = getRedisClient();
  const beat = () =>
    client.set(HEARTBEAT_KEY, Date.now().toString(), 'EX', HEARTBEAT_TTL_SECONDS).catch(() => {});
  beat();
  const interval = setInterval(beat, HEARTBEAT_INTERVAL_MS);
  return () => clearInterval(interval);
}

/**
 * Called by the API process. If the key has expired (worker stopped
 * refreshing it, or was never started), this returns alive: false — the
 * TTL means an honest "gone" rather than a stale guess.
 */
export async function getWorkerHeartbeat() {
  const client = getRedisClient();
  const value = await client.get(HEARTBEAT_KEY).catch(() => null);
  if (!value) return { alive: false, lastSeenAt: null };

  const lastSeenAt = new Date(Number(value));
  const ageMs = Date.now() - lastSeenAt.getTime();
  return { alive: ageMs < HEARTBEAT_TTL_SECONDS * 1000, lastSeenAt };
}
