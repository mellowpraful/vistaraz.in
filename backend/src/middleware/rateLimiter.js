/**
 * rateLimiter.js — Lightweight In-Memory Rate Limiting Middleware
 *
 * Protects authentication endpoints (/api/auth/*) from brute-force
 * and denial-of-service attacks without external dependencies.
 */

const requestCounts = new Map();

/**
 * Creates an Express rate limiter middleware.
 *
 * @param {object} options
 * @param {number} options.windowMs Time window in milliseconds (default: 15 mins)
 * @param {number} options.max      Max requests allowed within windowMs (default: 30)
 * @param {string} options.message  Error message returned when throttled
 */
export function createRateLimiter({
  windowMs = 15 * 60 * 1000,
  max = 60,
  message = 'Too many requests. Please try again after a few minutes.',
} = {}) {
  // Periodically purge stale IP entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of requestCounts.entries()) {
      if (now - entry.startTime > windowMs) {
        requestCounts.delete(ip);
      }
    }
  }, 5 * 60 * 1000).unref();

  return function rateLimiter(req, res, next) {
    const clientIp =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';

    const now = Date.now();
    const current = requestCounts.get(clientIp);

    if (!current || now - current.startTime > windowMs) {
      requestCounts.set(clientIp, { count: 1, startTime: now });
      res.setHeader('RateLimit-Limit', max);
      res.setHeader('RateLimit-Remaining', max - 1);
      return next();
    }

    current.count += 1;
    const remaining = Math.max(0, max - current.count);
    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', remaining);

    if (current.count > max) {
      const retryAfterSeconds = Math.ceil((current.startTime + windowMs - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);

      return res.status(429).json({
        success: false,
        error: message,
        code: 'RATE_LIMIT_EXCEEDED',
      });
    }

    next();
  };
}

// Pre-configured limiter for authentication routes
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
});

