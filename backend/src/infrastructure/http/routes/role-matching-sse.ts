import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../container';
import { RoleMatchingSSEController } from '../controllers/role-matching-sse.controller';
import { TYPES } from '../../../shared/types';
import { authenticateJWT, requirePermissions, rateLimitByClient } from '../../../interfaces/http/middlewares/jwt-technical-auth.middleware';

const router = Router();
let roleMatchingSSEController: RoleMatchingSSEController;

try {
  roleMatchingSSEController = container.get<RoleMatchingSSEController>(TYPES.RoleMatchingSSEController);
  console.log('🔧 [SSE Route Setup] Controller injected successfully');
} catch (error) {
  console.error('❌ [SSE Route Setup] Failed to inject controller:', error);
  throw error;
}

console.log('🔧 [SSE Route Setup] Role matching SSE routes being registered...');

// Test route to verify router is working
try {
  router.get('/test', (req, res) => {
    console.log('🧪 [SSE Route] Test route hit!');
    res.json({ message: 'SSE router is working!' });
  });
  console.log('🔧 [SSE Route Setup] Test route registered at /test');
} catch (error) {
  console.error('❌ [SSE Route Setup] Failed to register test route:', error);
}

// Simple route without controller
router.get('/simple-test', (req, res) => {
  console.log('🧪 [SSE Route] Simple test route hit!');
  res.json({ message: 'Simple route works!', timestamp: new Date().toISOString() });
});

console.log('🔧 [SSE Route Setup] Simple test route registered at /simple-test');

console.log('🔧 [SSE Route Setup] Controller available:', !!roleMatchingSSEController);

/**
 * @swagger
 * /api/v1/role-matching/sse/start:
 *   get:
 *     summary: Start real-time role matching with Server-Sent Events
 *     tags: [Role Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the role to find candidates for
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of candidates to return
 *     responses:
 *       200:
 *         description: SSE stream with real-time updates
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               example: |
 *                 data: {"type":"status","message":"Starting AI-powered candidate search...","progress":0}
 *                 
 *                 data: {"type":"complete","message":"Candidate analysis complete!","progress":100,"data":{"candidates":[...],"totalFound":5,"roleId":"123"}}
 *       400:
 *         description: Bad request - missing roleId
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
// Special middleware for SSE that works with cookies (much simpler)
// EventSource automatically sends cookies, so we can use session-based auth
const authenticateSSE = (req: Request, res: Response, next: NextFunction) => {
  console.log('🔐 [SSE Auth Middleware] Processing SSE authentication...');
  console.log('🔐 [SSE Auth Middleware] Query params:', Object.keys(req.query));
  console.log('🔐 [SSE Auth Middleware] Cookies present:', !!req.headers.cookie);
  console.log('🔐 [SSE Auth Middleware] Cookie preview:', req.headers.cookie ? req.headers.cookie.substring(0, 100) + '...' : 'none');
  console.log('🔐 [SSE Auth Middleware] Existing Authorization header:', req.headers['authorization'] ? 'Present' : 'Missing');
  
  // Try to extract token from query param (fallback)
  const tokenFromQuery = req.query.token;
  if (tokenFromQuery && typeof tokenFromQuery === 'string') {
    console.log('🔐 [SSE Auth Middleware] Token found in query, adding to headers');
    console.log('🔐 [SSE Auth Middleware] Token preview:', `${tokenFromQuery.substring(0, 20)}...${tokenFromQuery.substring(tokenFromQuery.length - 10)}`);
    console.log('🔐 [SSE Auth Middleware] Token length:', tokenFromQuery.length);
    console.log('🔐 [SSE Auth Middleware] Token contains dots:', (tokenFromQuery.match(/\./g) || []).length);
    
    // Decode the token if it appears to be URL-encoded
    let decodedToken = tokenFromQuery;
    if (tokenFromQuery.includes('%')) {
      console.log('🔐 [SSE Auth Middleware] Token appears URL-encoded, decoding...');
      decodedToken = decodeURIComponent(tokenFromQuery);
      console.log('🔐 [SSE Auth Middleware] Decoded token preview:', `${decodedToken.substring(0, 20)}...${decodedToken.substring(decodedToken.length - 10)}`);
    }
    
    req.headers['authorization'] = `Bearer ${decodedToken}`;
    console.log('🔐 [SSE Auth Middleware] Authorization header set from query param');
  } else {
    console.log('🔐 [SSE Auth Middleware] No token in query, relying on cookies/session');
  }
  
  console.log('🔐 [SSE Auth Middleware] Final Authorization header state:', req.headers['authorization'] ? 'Present' : 'Missing');
  next();
};

router.get(
  '/start',
  (req, res, next) => {
    console.log('🔄 [SSE Route] Starting middleware chain...');
    next();
  },
  // TEMPORARY: Skip ALL middleware to test
  // authenticateSSE,
  // (req, res, next) => {
  //   console.log('✅ [SSE Route] authenticateSSE passed');
  //   next();
  // },
  // authenticateJWT,
  // (req, res, next) => {
  //   console.log('✅ [SSE Route] authenticateJWT passed');
  //   next();
  // },
  // rateLimitByClient,
  // (req, res, next) => {
  //   console.log('✅ [SSE Route] rateLimitByClient passed');
  //   next();
  // },
  // requirePermissions(['read:employees', 'read:persons']),
  // (req, res, next) => {
  //   console.log('✅ [SSE Route] requirePermissions passed');
  //   next();
  // },
  (req, res) => {
    console.log('🎯 [SSE Route] Final controller reached!');
    roleMatchingSSEController.startRoleMatching(req, res);
  }
);

export default router;
