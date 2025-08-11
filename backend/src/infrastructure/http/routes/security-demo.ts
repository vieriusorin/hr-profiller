import { Router } from 'express';
import { 
  authenticateJWT, 
  requirePermissions, 
  requireScope, 
  requireTechnicalTokenOnly,
  rateLimitByClient 
} from '../../../interfaces/http/middlewares/jwt-technical-auth.middleware';
import { TechnicalAuthRequest } from '../../../interfaces/http/middlewares/jwt-technical-auth.middleware';

/**
 * Security Demo Routes - Examples of different protection levels
 * 
 * This file demonstrates all the different ways to secure routes with JWT technical tokens.
 * Use these patterns in your actual routes.
 */

const router = Router();

/**
 * 🟢 PUBLIC ROUTE - No authentication required
 * Use for: Health checks, public information, documentation
 */
router.get('/public', (req, res) => {
  res.json({
    message: '🟢 This is a public endpoint - no authentication required',
    timestamp: new Date().toISOString(),
    accessible: 'everyone'
  });
});

/**
 * 🟡 BASIC AUTHENTICATION - JWT token required
 * Use for: General API access, non-sensitive data
 */
router.get('/basic', 
  authenticateJWT,
  (req: TechnicalAuthRequest, res) => {
    res.json({
      message: '🟡 Basic authentication successful',
      user: req.user,
      technicalToken: req.technicalToken ? {
        clientId: req.technicalToken.clientId,
        role: req.technicalToken.role,
        expiresIn: req.technicalToken.expiresIn
      } : null
    });
  }
);

/**
 * 🟠 PERMISSION-BASED - Specific permissions required
 * Use for: Sensitive data, role-specific operations
 */
router.get('/employees', 
  authenticateJWT,
  requirePermissions(['read:employees', 'read:*']),
  rateLimitByClient(),
  (req: TechnicalAuthRequest, res) => {
    res.json({
      message: '🟠 Employee data access granted',
      permissions: req.technicalToken?.permissions || ['user-based-auth'],
      data: {
        employees: ['John Doe', 'Jane Smith', 'Bob Wilson'],
        count: 3,
        accessLevel: 'employee-data'
      }
    });
  }
);

/**
 * 🟠 SCOPE-BASED - Specific scopes required
 * Use for: API access control, limiting what operations can be performed
 */
router.post('/reports', 
  authenticateJWT,
  requirePermissions(['write:reports', 'write:*']),
  requireScope(['api:write']),
  rateLimitByClient(),
  (req: TechnicalAuthRequest, res) => {
    res.json({
      message: '🟠 Report generation access granted',
      scope: req.technicalToken?.scope || 'user-session',
      permissions: req.technicalToken?.permissions || ['user-based-auth'],
      reportGenerated: true
    });
  }
);

/**
 * 🔴 ADMIN ONLY - High-level permissions required
 * Use for: System administration, sensitive operations
 */
router.post('/admin', 
  authenticateJWT,
  requirePermissions(['admin:system', 'admin:users']),
  rateLimitByClient(),
  (req: TechnicalAuthRequest, res) => {
    res.json({
      message: '🔴 Admin access granted',
      adminUser: req.user?.email,
      adminPermissions: req.technicalToken?.permissions || ['admin-user'],
      systemAccess: true,
      availableOperations: [
        'user-management',
        'system-configuration',
        'bulk-operations'
      ]
    });
  }
);

/**
 * 🔵 TECHNICAL TOKEN ONLY - No user session tokens allowed
 * Use for: API-only operations, service-to-service communication
 */
router.get('/api-only', 
  authenticateJWT,
  requireTechnicalTokenOnly,
  rateLimitByClient(),
  (req: TechnicalAuthRequest, res) => {
    res.json({
      message: '🔵 Technical token access only',
      clientId: req.technicalToken!.clientId,
      tokenType: 'technical',
      noUserSessions: true,
      apiAccess: true
    });
  }
);

/**
 * ⚡ RATE LIMITED - Demonstrates rate limiting per client
 */
router.get('/rate-limited', 
  authenticateJWT,
  rateLimitByClient(),
  (req: TechnicalAuthRequest, res) => {
    res.json({
      message: '⚡ Rate limited endpoint',
      clientId: req.technicalToken?.clientId || 'user-session',
      rateLimitHeaders: {
        limit: res.get('X-RateLimit-Limit'),
        remaining: res.get('X-RateLimit-Remaining'),
        reset: res.get('X-RateLimit-Reset')
      },
      tip: 'Check response headers for rate limit info'
    });
  }
);

/**
 * 🎯 COMBINED SECURITY - Multiple protection layers
 * Use for: Highly sensitive operations requiring multiple checks
 */
router.post('/sensitive', 
  authenticateJWT,                                    // Must have valid JWT
  requirePermissions(['read:employees', 'write:reports']), // Must have specific permissions
  requireScope(['api:read', 'api:write']),            // Must have proper scope
  rateLimitByClient(),                                // Rate limited by client
  (req: TechnicalAuthRequest, res) => {
    res.json({
      message: '🎯 Multi-layer security passed',
      securityLayers: {
        authentication: '✅ JWT verified',
        permissions: '✅ Permissions verified',
        scope: '✅ Scope verified',
        rateLimit: '✅ Rate limit applied'
      },
      user: req.user?.email,
      technicalClient: req.technicalToken?.clientId,
      accessGranted: true
    });
  }
);

export default router;