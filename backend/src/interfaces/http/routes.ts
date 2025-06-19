import { Router } from 'express';
import opportunityRoutes from '../../infrastructure/http/routes/opportunities';
import { metricsHandler } from './middlewares/loggs.middleware';

const router = Router();

// API discovery endpoint
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    data: {
      api: {
        name: 'Profiller HR API',
        version: '1.0.0',
        description: 'HR management system API with opportunities management'
      },
      endpoints: {
        documentation: '/api-docs',
        metrics: '/api/v1/metrics',
        opportunities: {
          base: '/api/v1/opportunities',
          methods: {
            'GET /api/v1/opportunities': 'List all opportunities',
            'POST /api/v1/opportunities': 'Create new opportunity (UUID auto-generated)',
            'GET /api/v1/opportunities/:id': 'Get opportunity by UUID',
            'PUT /api/v1/opportunities/:id': 'Update opportunity by UUID', 
            'DELETE /api/v1/opportunities/:id': 'Delete opportunity by UUID'
          }
        }
      },
      features: [
        'Server-side UUID generation',
        'PostgreSQL with Drizzle ORM',
        'Rate limiting',
        'Request validation',
        'Comprehensive logging',
        'Swagger documentation'
      ],
      links: {
        documentation: `${req.protocol}://${req.get('host')}/api-docs`,
        health: `${req.protocol}://${req.get('host')}/api/v1/metrics`
      }
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown'
    }
  });
});

router.get('/metrics', metricsHandler);
router.use('/opportunities', opportunityRoutes);

export default router;
