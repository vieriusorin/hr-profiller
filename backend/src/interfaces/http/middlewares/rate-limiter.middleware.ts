import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * Limits each IP to 100 requests per 15 minutes
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    data: {
      message: 'Too many requests from this IP, please try again after 15 minutes',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for development environment
  skip: () => process.env.NODE_ENV === 'development',
});

/**
 * Stricter limiter for metrics endpoint
 * Limits each IP to 30 requests per hour
 */
export const metricsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit each IP to 30 requests per hour
  message: {
    status: 'error',
    data: {
      message: 'Too many requests to metrics endpoint, please try again after an hour',
      code: 'METRICS_RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for development environment
  skip: () => process.env.NODE_ENV === 'development',
});

/**
 * Authentication limiter
 * Limits each IP to 5 failed login attempts per hour
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 failed login attempts per hour
  message: {
    status: 'error',
    data: {
      message: 'Too many login attempts, please try again after an hour',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for development environment
  skip: () => process.env.NODE_ENV === 'development',
});

/**
 * Swagger UI limiter
 * Limits each IP to 50 requests per 15 minutes for API documentation
 */
export const swaggerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per 15 minutes
  message: {
    status: 'error',
    data: {
      message: 'Too many requests to API documentation, please try again after 15 minutes',
      code: 'SWAGGER_RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for development environment
  skip: () => process.env.NODE_ENV === 'development',
});
