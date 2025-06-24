import { Router } from 'express';
import { container } from '../../../infrastructure/container';
import { TYPES } from '../../../shared/types';
import { AuthController } from '../controllers/auth.controller';
import { protectPageWithSession } from '../middlewares/protectPage.middleware';
import { authorize } from '../middlewares/authorization.middleware';

const router = Router();
const authController = container.get<AuthController>(TYPES.AuthController);

// Public login endpoint
router.post('/login', authController.login.bind(authController));

// Test endpoint to verify NextAuth session authentication
router.get('/test-session', 
  protectPageWithSession,
  (req, res) => {
    res.json({
      message: 'Authentication successful!',
      user: req.user,
      timestamp: new Date().toISOString()
    });
  }
);

// Test endpoint to verify admin authorization
router.get('/test-admin', 
  protectPageWithSession,
  authorize(['admin']),
  (req, res) => {
    res.json({
      message: 'Admin access granted!',
      user: req.user,
      timestamp: new Date().toISOString()
    });
  }
);

export default router; 