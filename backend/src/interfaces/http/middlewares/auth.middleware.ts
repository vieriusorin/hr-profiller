import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { DecodedToken, AuthenticatedRequest } from '../../../domain/interfaces/auth.interface';

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  if (!process.env.NEXTAUTH_SECRET) {
    console.error('NEXTAUTH_SECRET is not defined in environment variables.');
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  jwt.verify(token, process.env.NEXTAUTH_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }

    req.user = decoded as DecodedToken;
    next();
  });
}; 