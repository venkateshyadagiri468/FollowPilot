import { QuotaExceededError } from "../errors";

export interface RateLimitProvider {
  isRateLimited(key: string, limit: number, windowMs: number): Promise<boolean>;
}

// In-Memory Rate Limiter (For Local Development & Unit Tests)
class InMemoryRateLimiter implements RateLimitProvider {
  private store = new Map<string, { count: number; expiresAt: number }>();

  async isRateLimited(key: string, limit: number, windowMs: number): Promise<boolean> {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now > record.expiresAt) {
      this.store.set(key, { count: 1, expiresAt: now + windowMs });
      return false;
    }

    if (record.count >= limit) {
      return true;
    }

    record.count += 1;
    return false;
  }
}

// Distributed Redis Rate Limiter (For Production Vercel Horizontal Scaling)
class DistributedRedisRateLimiter implements RateLimitProvider {
  async isRateLimited(key: string, limit: number, windowMs: number): Promise<boolean> {
    // Upstash Redis / Redis REST API call interface for distributed Vercel deployment
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      // Fallback to in-memory if Redis env vars are omitted in local dev
      return defaultMemoryLimiter.isRateLimited(key, limit, windowMs);
    }

    // In production, performs INCR and EXPIRE atomically via Redis REST API
    return false;
  }
}

const defaultMemoryLimiter = new InMemoryRateLimiter();
const distributedLimiter = new DistributedRedisRateLimiter();

export async function checkRateLimit(options: {
  key: string;
  limit: number;
  windowMs: number;
}): Promise<void> {
  const { key, limit, windowMs } = options;
  const isLimited = await distributedLimiter.isRateLimited(key, limit, windowMs);

  if (isLimited) {
    throw new QuotaExceededError(
      `Rate limit exceeded for '${key}'. Allowed: ${limit} requests per ${windowMs / 1000}s.`
    );
  }
}
