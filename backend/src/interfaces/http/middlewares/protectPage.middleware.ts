import { Response, NextFunction } from 'express';
import { hkdfSync } from 'crypto';
import { DecodedToken, AuthenticatedRequest } from '@domain/interfaces/auth.interface';

/**
 * Middleware to protect pages with session
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const protectPageWithSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  // Determine cookie name based on environment.
  // In production, NextAuth uses a '__Secure-' prefix for cookies.
  const sessionCookieName = process.env.NODE_ENV === 'production'
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token';

  const token = req.cookies?.[sessionCookieName];

  if (!token) {
    // Redirect to the frontend login page if not authenticated
    const loginUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const fullCallbackUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    res.redirect(`${loginUrl}/auth/signin?error=SessionRequired&callbackUrl=${encodeURIComponent(fullCallbackUrl)}`);
    return;
  }

  if (!process.env.NEXTAUTH_SECRET) {
    console.error('NEXTAUTH_SECRET is not defined in environment variables.');
    res.status(500).send('Server configuration error');
    return;
  }

  try {
    // Dynamic import for jose library (ESM module)
    const { jwtDecrypt } = await import('jose');
    
    // Next.js uses HKDF to derive the encryption key from the secret
    // This matches the internal Next.js implementation
    const secret = process.env.NEXTAUTH_SECRET;
    const salt = 'NextAuth.js Generated Encryption Key';
    const info = '';
    
    // Derive 32-byte key using HKDF-SHA256 (matching Next.js)
    const derivedKey = new Uint8Array(hkdfSync('sha256', secret, salt, info, 32));
    
    const { payload } = await jwtDecrypt(token, derivedKey);
    
    // Attach user to request for downstream middlewares (like authorize)
    req.user = payload as DecodedToken;
    next();
  } catch (error) {
    console.error('Token decryption failed:', (error as Error).message);
    // Redirect to login if token is invalid
    const loginUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const fullCallbackUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    res.redirect(`${loginUrl}/auth/signin?error=InvalidToken&callbackUrl=${encodeURIComponent(fullCallbackUrl)}`);
    return;
  }
};