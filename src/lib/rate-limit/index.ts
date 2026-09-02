import { QuotaExceededError } from "../errors";

interface RateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
}

const rateLimitStore = new Map<string, { count: number; expiresAt: number }>();

export function checkRateLimit(options: RateLimitOptions): void {
  const { key, limit, windowMs } = options;
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.expiresAt) {
    rateLimitStore.set(key, { count: 1, expiresAt: now + windowMs });
    return;
  }

  if (record.count >= limit) {
    throw new QuotaExceededError(
      `Rate limit exceeded for key '${key}'. Maximum ${limit} requests per ${windowMs / 1000}s.`
    );
  }

  record.count += 1;
}
