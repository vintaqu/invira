// Rate limiter — uses Upstash Redis in production, in-memory fallback for dev
// In-memory is per-instance so works fine for single-server; Redis for multi-instance

import { NextResponse } from 'next/server'

// In-memory store (dev fallback)
const store = new Map<string, { count: number; resetAt: number }>()

function memoryCheck(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}

async function redisCheck(key: string, limit: number, windowMs: number): Promise<boolean> {
  try {
    const { Redis } = await import('@upstash/redis')
    const redis = new Redis({
      url:   process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, Math.ceil(windowMs / 1000))
    return count <= limit
  } catch {
    // Redis unavailable — fall back to memory
    return memoryCheck(key, limit, windowMs)
  }
}

export async function checkRateLimitAsync(key: string, limit: number, windowMs: number): Promise<boolean> {
  const hasRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  return hasRedis ? redisCheck(key, limit, windowMs) : memoryCheck(key, limit, windowMs)
}

// Synchronous version for backwards compat (memory only)
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  return memoryCheck(key, limit, windowMs)
}

export function rateLimitResponse(retryAfter = 60) {
  return new NextResponse(
    JSON.stringify({ error: 'Demasiadas solicitudes. Inténtalo más tarde.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(retryAfter),
      },
    }
  )
}
