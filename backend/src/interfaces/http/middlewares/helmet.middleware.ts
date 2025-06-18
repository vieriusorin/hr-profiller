import helmet from 'helmet';

/**
 * Helmet middleware to secure the application by setting various HTTP headers
 * @see https://helmetjs.github.io/docs/
 *
 * @description
 * This middleware is used to secure the application by setting various HTTP headers.
 * It is used to protect the application from common web vulnerabilities such as XSS, CSRF, and other attacks.
 *
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 * @returns The next function
 */
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
    },
  },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'same-origin' },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});
