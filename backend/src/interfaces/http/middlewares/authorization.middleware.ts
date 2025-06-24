import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../domain/interfaces/auth.interface';

export const authorize = (requiredRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role) {
      res.status(403).json({ error: 'Insufficient permissions. User role not found.' });
      return;
    }

    const hasPermission = requiredRoles.includes(req.user.role);

    if (!hasPermission) {
      res.status(403).json({ error: 'Insufficient permissions.' });
      return;
    }

    next();
  };
}; 