"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectPageWithSession = void 0;
/**
 * Middleware to protect pages with session
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
const protectPageWithSession = async (req, res, next) => {
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
        // Use Next.js's built-in JWT decode function
        const { decode } = await import('next-auth/jwt');
        const decoded = await decode({
            token,
            secret: process.env.NEXTAUTH_SECRET,
        });
        if (!decoded) {
            throw new Error('Token decode returned null');
        }
        // Attach user to request for downstream middlewares (like authorize)
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error('Token decryption failed:', error.message);
        // Redirect to login if token is invalid
        const loginUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const fullCallbackUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        res.redirect(`${loginUrl}/auth/signin?error=InvalidToken&callbackUrl=${encodeURIComponent(fullCallbackUrl)}`);
        return;
    }
};
exports.protectPageWithSession = protectPageWithSession;
