import rateLimit from 'express-rate-limit'

/**
 * Global API rate limiter — protects against brute force / abuse.
 * Configurable via env (RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX).
 */
const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000
const max = Number(process.env.RATE_LIMIT_MAX) || 100

export const apiLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
})

/**
 * Stricter limiter for auth endpoints (login/register/forgot-password).
 */
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
})
