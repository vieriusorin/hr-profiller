import { Response, NextFunction } from 'express';
import { container } from '../../../infrastructure/container';
import { TYPES } from '../../../shared/types';
import { ITechnicalAuthService, AuthenticatedRequest } from '../../../domain/interfaces/auth.interface';

/**
 * @description Middleware to authenticate technical tokens.
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 * @returns The next function
 */
export const authenticateTechnicalToken = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    // Extract technical token from various headers
    const apiKey = req.headers['x-api-key'] || 
                   req.headers['x-technical-token'] || 
                   req.headers['x-auth-token'];

    if (!apiKey || typeof apiKey !== 'string') {
      res.status(401).json({ 
        status: 'error',
        data: { message: 'Technical token required' },
        meta: { authType: 'technical' }
      });
      return;
    }

    // Get technical auth service from DI container
    const technicalAuthService = container.get<ITechnicalAuthService>(TYPES.TechnicalAuthService);
    
    // Validate the technical token
    const technicalClient = await technicalAuthService.validateToken(apiKey);
    
    if (!technicalClient) {
      res.status(401).json({ 
        status: 'error',
        data: { message: 'Invalid technical token' },
        meta: { authType: 'technical' }
      });
      return;
    }

    // Attach technical client to request
    req.technicalClient = technicalClient;
    
    // Log technical token usage (optional)
    console.log(`Technical auth: ${technicalClient.name} (${technicalClient.id}) accessed ${req.method} ${req.path}`);
    
    next();
  } catch (error) {
    console.error('Technical authentication error:', error);
    res.status(500).json({ 
      status: 'error',
      data: { message: 'Authentication service error' },
      meta: { authType: 'technical' }
    });
  }
};

/**
 * @description Middleware to require specific permissions for technical clients.
 * @param resource - The resource to check permissions against.
 * @param action - The action to check permissions for (default is 'read').
 * @returns The middleware function.
 */
export const requireTechnicalPermission = (resource: string, action: string = 'read') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.technicalClient) {
      res.status(401).json({ 
        status: 'error',
        data: { message: 'Technical authentication required' },
        meta: { authType: 'technical' }
      });
      return;
    }

    try {
      const technicalAuthService = container.get<ITechnicalAuthService>(TYPES.TechnicalAuthService);
      
      const hasPermission = technicalAuthService.hasPermission(
        req.technicalClient, 
        resource, 
        action
      );

      if (!hasPermission) {
        res.status(403).json({ 
          status: 'error',
          data: { 
            message: 'Insufficient permissions',
            required: { resource, action },
            client: req.technicalClient.name
          },
          meta: { authType: 'technical' }
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ 
        status: 'error',
        data: { message: 'Permission service error' },
        meta: { authType: 'technical' }
      });
    }
  };
};

/**
 * @description Middleware to rate limit technical clients based on their configuration.
 * @returns The middleware function.
 */
export const rateLimitTechnicalClient = () => {
  const clientRequests = new Map<string, { count: number; windowStart: number }>();
  
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.technicalClient) {
      next();
      return;
    }

    const client = req.technicalClient;
    const now = Date.now();
    const clientId = client.id;
    
    const currentWindow = clientRequests.get(clientId) || { count: 0, windowStart: now };
    
    // Check if we're still in the same window
    if (now - currentWindow.windowStart > client.rateLimits.windowMs) {
      // Reset window
      currentWindow.count = 1;
      currentWindow.windowStart = now;
    } else {
      currentWindow.count++;
    }
    
    clientRequests.set(clientId, currentWindow);
    
    // Check rate limit
    if (currentWindow.count > client.rateLimits.requests) {
      const resetTime = new Date(currentWindow.windowStart + client.rateLimits.windowMs);
      
      res.status(429).json({ 
        status: 'error',
        data: { 
          message: 'Rate limit exceeded',
          limit: client.rateLimits.requests,
          windowMs: client.rateLimits.windowMs,
          resetTime: resetTime.toISOString()
        },
        meta: { authType: 'technical', clientId: client.id }
      });
      return;
    }

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': client.rateLimits.requests.toString(),
      'X-RateLimit-Remaining': (client.rateLimits.requests - currentWindow.count).toString(),
      'X-RateLimit-Reset': new Date(currentWindow.windowStart + client.rateLimits.windowMs).toISOString()
    });
    
    next();
  };
};