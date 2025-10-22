import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../domain/interfaces/auth.interface';
import { authenticateToken } from './auth.middleware';
import { authenticateTechnicalToken } from './technical-auth.middleware';

/**
 * @enum AuthType
 * @description Enumeration of authentication types.
 * USER - User JWT token authentication.
 * TECHNICAL - Technical token authentication.
 * BOTH - Either user or technical token authentication.
 */
export enum AuthType {
  USER = 'user',
  TECHNICAL = 'technical',
  BOTH = 'both'
}

/**
 * Middleware to authenticate requests based on allowed authentication types.
 * @param allowedTypes - Array of allowed authentication types.
 * @returns Middleware function.
 */
export const authenticateRequest = (allowedTypes: AuthType[] = [AuthType.BOTH]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const hasUserToken = req.headers['authorization'];
    const hasTechnicalToken = req.headers['x-api-key'] || 
                             req.headers['x-technical-token'] || 
                             req.headers['x-auth-token'];

    // Determine which authentication method to use
    if (hasTechnicalToken && (allowedTypes.includes(AuthType.TECHNICAL) || allowedTypes.includes(AuthType.BOTH))) {
      // Try technical authentication first if technical token is present
      try {
        await authenticateTechnicalToken(req, res, (error) => {
          if (error) {
            // If technical auth fails and user auth is allowed, try user auth
            if (hasUserToken && (allowedTypes.includes(AuthType.USER) || allowedTypes.includes(AuthType.BOTH))) {
              authenticateToken(req, res, next);
            } else {
              next(error);
            }
          } else {
            next();
          }
        });
        return;
      } catch (error) {
        console.error('Technical token authentication failed:', error);
        // Fall through to user authentication if allowed
        if (!hasUserToken || (!allowedTypes.includes(AuthType.USER) && !allowedTypes.includes(AuthType.BOTH))) {
          res.status(401).json({ 
            status: 'error',
            data: { message: 'Invalid technical token' },
            meta: { authType: 'technical' }
          });
          return;
        }
      }
    }

    if (hasUserToken && (allowedTypes.includes(AuthType.USER) || allowedTypes.includes(AuthType.BOTH))) {
      // Use existing user authentication
      authenticateToken(req, res, next);
      return;
    }

    // No valid authentication method found
    const allowedMethods = allowedTypes.map(type => {
      switch (type) {
        case AuthType.USER: return 'User JWT token (Authorization header)';
        case AuthType.TECHNICAL: return 'Technical token (X-API-Key header)';
        case AuthType.BOTH: return 'User JWT or Technical token';
        default: return 'Unknown';
      }
    }).join(' or ');

    res.status(401).json({ 
      status: 'error',
      data: { 
        message: 'Authentication required',
        allowedMethods
      },
      meta: { 
        allowedTypes,
        hasUserToken: !!hasUserToken,
        hasTechnicalToken: !!hasTechnicalToken
      }
    });
  };
};

// Convenience middleware for common authentication patterns
/**
 * Middleware to authenticate user-only requests.
 * @returns Middleware function.
 */
export const authenticateUserOnly = () => authenticateRequest([AuthType.USER]);
/**
 * Middleware to authenticate technical-only requests.
 * @returns Middleware function.
 */
export const authenticateTechnicalOnly = () => authenticateRequest([AuthType.TECHNICAL]);
/**
 * Middleware to authenticate any requests (user or technical).
 * @returns Middleware function.
 */
export const authenticateAny = () => authenticateRequest([AuthType.BOTH]);

// Admin endpoints that require either admin user or admin technical token
/**
 * Middleware to authenticate admin requests.
 * @returns Middleware function.
 */
export const authenticateAdmin = () => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    await authenticateRequest([AuthType.BOTH])(req, res, (error) => {
      if (error) {
        next(error);
        return;
      }

      // Check if user has admin role OR technical client has admin permissions
      const isAdminUser = req.user?.role === 'admin';
      const isAdminTechnicalClient = req.technicalClient?.id === 'admin-scripts' || 
                                    req.technicalClient?.permissions.some(p => p.resource === 'admin');

      if (!isAdminUser && !isAdminTechnicalClient) {
        res.status(403).json({ 
          status: 'error',
          data: { message: 'Admin privileges required' },
          meta: { 
            userRole: req.user?.role,
            technicalClient: req.technicalClient?.name
          }
        });
        return;
      }

      next();
    });
  };
};

// Middleware to log authentication method used (non-breaking)
/**
 * Middleware to log authentication method used.
 * @returns Middleware function.
 */
export const logAuthMethod = () => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      const authInfo: any = {
        method: req.method,
        path: req.path,
        timestamp: new Date().toISOString()
      };

      if (req.user) {
        authInfo.authType = 'user';
        authInfo.userId = req.user.id;
        authInfo.userEmail = req.user.email;
      }

      if (req.technicalClient) {
        authInfo.authType = req.user ? 'hybrid' : 'technical';
        authInfo.technicalClient = req.technicalClient.name;
        authInfo.clientId = req.technicalClient.id;
      }

      // Only add auth info if there's authentication
      if (!req.user && !req.technicalClient) {
        authInfo.authType = 'none';
      }

      // Only log in development or if explicitly enabled
      if (process.env.NODE_ENV === 'development' || process.env.LOG_AUTH_USAGE === 'true') {
        console.log('Auth usage:', authInfo);
      }
    } catch (error) {
      // Don't break the request if logging fails
      console.error('Error in auth logging:', error);
    }

    next();
  };
};