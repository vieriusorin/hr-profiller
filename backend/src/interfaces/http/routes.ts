import { Router } from 'express';
import opportunityRoutes from '../../infrastructure/http/routes/opportunities';
import roleRoutes from '../../infrastructure/http/routes/roles';
import employeeRoutes from '../../infrastructure/http/routes/employees';
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
        },
        roles: {
          base: '/api/v1/roles',
          methods: {
            'GET /api/v1/roles/opportunity/:opportunityId': 'List all roles for an opportunity',
            'GET /api/v1/roles/:id': 'Get role by ID',
            'POST /api/v1/roles': 'Create new role',
            'PUT /api/v1/roles/:id': 'Update role by ID',
            'DELETE /api/v1/roles/:id': 'Delete role by ID'
          }
        },
        employees: {
          base: '/api/v1/employees',
          methods: {
            'GET /api/v1/employees': 'List all employees with filtering and pagination',
            'POST /api/v1/employees': 'Create new employee',
            'GET /api/v1/employees/:id': 'Get employee by ID',
            'PATCH /api/v1/employees/:id': 'Partially update employee by ID',
            'DELETE /api/v1/employees/:id': 'Delete employee by ID'
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
router.use('/roles', roleRoutes);
router.use('/employees', employeeRoutes);

export default router;
