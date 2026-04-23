import { Redis } from '@upstash/redis'

// Redis is optional in local dev — falls back to no-op if not configured
const hasRedis =
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN

const realRedis = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

// No-op fallback so app works locally without Upstash
export const redis = {
  get: async (key: string): Promise<string | null> =>
    realRedis ? (realRedis.get(key) as any) : null,
  set: async (key: string, value: any): Promise<any> =>
    realRedis ? realRedis.set(key, value) : null,
  setex: async (key: string, ttl: number, value: any): Promise<any> =>
    realRedis ? realRedis.setex(key, ttl, value) : null,
  del: async (key: string): Promise<any> =>
    realRedis ? realRedis.del(key) : null,
}
