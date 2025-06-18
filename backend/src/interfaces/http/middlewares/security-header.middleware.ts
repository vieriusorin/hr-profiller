import { Request, Response, NextFunction } from 'express';

/**
 * Security headers middleware to secure the application by setting various HTTP headers
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 * @returns The next function
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent browsers from detecting the MIME type
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Enable XSS filter in the browser
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Disable caching for sensitive routes
  if (req.path.startsWith('/api/v1/auth')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
};
