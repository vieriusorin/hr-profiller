import { Response, NextFunction } from 'express';
import { JWTTokenService } from '../../../domain/auth/services/jwt-token.service';
import { AuthenticatedRequest } from '../../../domain/interfaces/auth.interface';

/**
 * @interface TechnicalAuthRequest
 * @description Extends AuthenticatedRequest to include technical token details.
 * @property {object} [technicalToken] - Decoded technical token information.
 * @property {string} technicalToken.userId - User ID associated with the technical token.
 * @property {string} technicalToken.email - Email associated with the technical token.
 * @property {string} technicalToken.name - Name associated with the technical token.
 * @property {string} technicalToken.role - Role associated with the technical token.
 * @property {string[]} technicalToken.permissions - Permissions granted by the technical token.
 * @property {string} technicalToken.clientId - Client ID of the technical token.
 * @property {string} technicalToken.scope - Scope of the technical token.
 * @property {number} technicalToken.expiresIn - Expiration time of the technical token in seconds.
 */
export interface TechnicalAuthRequest extends AuthenticatedRequest {
  technicalToken?: {
    userId: string;
    email: string;
    name: string;
    role: string;
    permissions: string[];
    clientId: string;
    scope: string;
    expiresIn: number;
  };
}

/**
 * Enhanced JWT middleware that works with both regular JWT tokens and technical tokens
 */
/**
 * @class JWTTechnicalAuthMiddleware
 * @description Middleware class to handle JWT authentication for both regular and technical tokens.
 * @private {JWTTokenService} jwtTokenService - Service to handle JWT token operations.
 * Methods:
 * - authenticateJWTToken: Authenticate requests using JWT tokens.
 * - requirePermissions: Middleware to enforce required permissions on technical tokens.
 * - requireScope: Middleware to enforce required scopes on technical tokens.
 * - requireTechnicalTokenOnly: Middleware to allow only technical tokens.
 * - rateLimitByClient: Middleware to apply rate limiting based on technical token client.
 * - logTokenUsage: Middleware to log technical token usage for monitoring.
 */
export class JWTTechnicalAuthMiddleware {
  private jwtTokenService: JWTTokenService;

  constructor() {
    this.jwtTokenService = new JWTTokenService();
  }

  /**
   * Authenticate JWT token (works with both regular and technical tokens)
   */
  authenticateJWTToken = (req: TechnicalAuthRequest, res: Response, next: NextFunction): void => {
    // Skip authentication for OPTIONS requests (CORS preflight)
    if (req.method === 'OPTIONS') {
      next();
      return;
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log('JWT Auth: No token provided in Authorization header');
      res.status(401).json({ 
        success: false,
        error: 'Access token required' 
      });
      return;
    }


    try {
      // First, try to validate as technical token
      const technicalValidation = this.jwtTokenService.validateToken(token);
      
      
      if (technicalValidation.valid && technicalValidation.payload) {
        // It's a technical token
        const payload = technicalValidation.payload;
        
        req.technicalToken = {
          userId: payload.userId,
          email: payload.email,
          name: payload.name,
          role: payload.role,
          permissions: payload.permissions,
          clientId: payload.clientId || 'unknown',
          scope: payload.scope || '',
          expiresIn: technicalValidation.expiresIn || 0
        };

        // Also set user for backwards compatibility
        req.user = {
          id: payload.userId,
          email: payload.email,
          name: payload.name,
          role: payload.role,
          sub: payload.userId,
          iat: payload.iat,
          exp: payload.exp
        };

        
        next();
        return;
      }

      // If technical token validation failed, try regular JWT validation
      // (This maintains compatibility with existing NextAuth tokens)
      if (!process.env.NEXTAUTH_SECRET) {
        console.error('NEXTAUTH_SECRET is not defined in environment variables.');
        res.status(500).json({ 
          success: false,
          error: 'Server configuration error' 
        });
        return;
      }

      const jwt = require('jsonwebtoken');
      jwt.verify(token, process.env.NEXTAUTH_SECRET, (err: any, decoded: any) => {
        if (err) {
          res.status(403).json({ 
            success: false,
            error: technicalValidation.error || 'Invalid or expired token' 
          });
          return;
        }
        
        req.user = decoded;
        next();
      });

    } catch (error) {
      console.error('JWT authentication error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Authentication service error' 
      });
    }
  };

  /**
   * Require specific permissions for technical tokens
   */
  requirePermissions = (requiredPermissions: string[]) => {
    return (req: TechnicalAuthRequest, res: Response, next: NextFunction): void => {
      // Skip for OPTIONS requests
      if (req.method === 'OPTIONS') {
        next();
        return;
      }
      // If it's a technical token, check permissions
      if (req.technicalToken) {
        const hasPermission = requiredPermissions.some(permission => 
          req.technicalToken!.permissions.includes(permission) ||
          req.technicalToken!.permissions.includes('*') ||
          req.technicalToken!.permissions.includes('read:*') && permission.startsWith('read:') ||
          req.technicalToken!.permissions.includes('write:*') && permission.startsWith('write:')
        );

        if (!hasPermission) {
          res.status(403).json({
            success: false,
            error: 'Insufficient permissions',
            required: requiredPermissions,
            available: req.technicalToken.permissions
          });
          return;
        }
      } 
      // For regular user tokens, fall back to role-based authorization
      else if (req.user) {
        // You can implement role-based permission mapping here if needed
        // For now, assume users with roles have appropriate permissions
      } 
      else {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      next();
    };
  };

  /**
   * Require specific scopes for technical tokens
   */
  requireScope = (requiredScopes: string[]) => {
    return (req: TechnicalAuthRequest, res: Response, next: NextFunction): void => {
      // Skip for OPTIONS requests
      if (req.method === 'OPTIONS') {
        next();
        return;
      }

      if (req.technicalToken) {
        const tokenScopes = req.technicalToken.scope.split(' ');
        const hasScope = requiredScopes.some(scope => 
          tokenScopes.includes(scope) ||
          tokenScopes.includes('api:full') ||
          tokenScopes.includes('*')
        );

        if (!hasScope) {
          res.status(403).json({
            success: false,
            error: 'Insufficient scope',
            required: requiredScopes,
            available: tokenScopes
          });
          return;
        }
      }

      next();
    };
  };

  /**
   * Only allow technical tokens (not regular user session tokens)
   */
  requireTechnicalTokenOnly = (req: TechnicalAuthRequest, res: Response, next: NextFunction): void => {
    // Skip for OPTIONS requests
    if (req.method === 'OPTIONS') {
      next();
      return;
    }

    if (!req.technicalToken) {
      res.status(401).json({
        success: false,
        error: 'Technical token required'
      });
      return;
    }

    next();
  };

  /**
   * Rate limiting based on technical token client
   */
  rateLimitByClient = () => {
    const clientRequestCounts = new Map<string, { count: number; resetTime: number }>();
    const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
    
    // Default rate limits per client type
    const CLIENT_LIMITS: Record<string, number> = {
      'frontend': 1000,
      'mobile': 500,
      'api-client': 200,
      'default': 100
    };

    return (req: TechnicalAuthRequest, res: Response, next: NextFunction): void => {
      // Skip for OPTIONS requests
      if (req.method === 'OPTIONS') {
        next();
        return;
      }

      if (!req.technicalToken) {
        next();
        return;
      }

      const clientId = req.technicalToken.clientId;
      const now = Date.now();
      const windowStart = Math.floor(now / WINDOW_MS) * WINDOW_MS;
      
      const clientData = clientRequestCounts.get(clientId) || { count: 0, resetTime: windowStart };
      
      // Reset count if we're in a new window
      if (clientData.resetTime !== windowStart) {
        clientData.count = 0;
        clientData.resetTime = windowStart;
      }
      
      clientData.count++;
      clientRequestCounts.set(clientId, clientData);
      
      const limit = CLIENT_LIMITS[clientId] || CLIENT_LIMITS['default'];
      
      if (clientData.count > limit) {
        res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          limit,
          resetTime: new Date(windowStart + WINDOW_MS).toISOString()
        });
        return;
      }

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': Math.max(0, limit - clientData.count).toString(),
        'X-RateLimit-Reset': new Date(windowStart + WINDOW_MS).toISOString()
      });

      next();
    };
  };

  /**
   * Log technical token usage for monitoring
   */
  logTokenUsage = () => {
    return (req: TechnicalAuthRequest, res: Response, next: NextFunction): void => {
      if (req.technicalToken) {
        console.log(`Technical Token Usage: ${req.technicalToken.clientId} (${req.technicalToken.email}) - ${req.method} ${req.path}`);
      } else if (req.user) {
        console.log(`User Token Usage: ${req.user.email || req.user.id} - ${req.method} ${req.path}`);
      }

      next();
    };
  };
}

// Export singleton instance for easy use
export const jwtTechnicalAuth = new JWTTechnicalAuthMiddleware();

// Export convenience methods
export const authenticateJWT = jwtTechnicalAuth.authenticateJWTToken;
export const requirePermissions = jwtTechnicalAuth.requirePermissions;
export const requireScope = jwtTechnicalAuth.requireScope;
export const requireTechnicalTokenOnly = jwtTechnicalAuth.requireTechnicalTokenOnly;
export const rateLimitByClient = jwtTechnicalAuth.rateLimitByClient;
export const logTokenUsage = jwtTechnicalAuth.logTokenUsage;