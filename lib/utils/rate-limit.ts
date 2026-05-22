interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean stale entries every 5 minutes to prevent memory growth
setInterval(() => {
  const now = Date.now();
  Array.from(store.keys()).forEach(key => {
    const entry = store.get(key);
    if (entry && entry.resetAt < now) store.delete(key);
  });
}, 5 * 60 * 1000);

export function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) return false;

  entry.count++;
  return true;
}

export function getClientIp(request: Request): string {
  const forwarded = (request as { headers: Headers }).headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() ?? 'unknown';
}
