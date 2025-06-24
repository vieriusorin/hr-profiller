import { Router } from 'express';
import opportunityRoutes from '../../infrastructure/http/routes/opportunities';
import roleRoutes from '../../infrastructure/http/routes/roles';
import employeeRoutes from '../../infrastructure/http/routes/employees';
import personRoutes from '../../infrastructure/http/routes/persons';
import { lookupRoutes } from '../../infrastructure/http/routes/lookup';
import mcpRoutes from '../../infrastructure/http/routes/mcp';
import aiRoutes from '../../infrastructure/http/routes/ai';
import { metricsHandler } from './middlewares/loggs.middleware';
import authRoutes from '../../infrastructure/http/routes/auth';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'success',
    data: {
      api: {
        name: 'Profiller HR API',
        version: '1.0.0',
        description: 'HR management system API with opportunities management, MCP integration, and AI-powered RAG capabilities'
      },
      endpoints: {
        documentation: '/api-docs',
        metrics: '/api/v1/metrics',
        auth: {
          base: '/api/v1/auth',
          methods: {
            'POST /api/v1/auth/login': 'Login with email and password',
            'GET /api/v1/auth/profile': 'Get user profile',
            'POST /api/v1/auth/logout': 'Logout user'
          }
        },
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
            'DELETE /api/v1/employees/:id': 'Delete employee by ID',
            'POST /api/v1/employees/:id/skills': 'Add skill to employee',
            'PATCH /api/v1/employees/:id/skills/:skillId': 'Update employee skill',
            'DELETE /api/v1/employees/:id/skills/:skillId': 'Remove skill from employee',
            'POST /api/v1/employees/:id/technologies': 'Add technology to employee',
            'PATCH /api/v1/employees/:id/technologies/:technologyId': 'Update employee technology',
            'DELETE /api/v1/employees/:id/technologies/:technologyId': 'Remove technology from employee',
            'POST /api/v1/employees/:id/education': 'Add education to employee',
            'PATCH /api/v1/employees/:id/education/:educationId': 'Update employee education',
            'DELETE /api/v1/employees/:id/education/:educationId': 'Remove education from employee',
            'POST /api/v1/employees/search/skills': 'Search employees by skills',
            'POST /api/v1/employees/search/technologies': 'Search employees by technologies',
            'POST /api/v1/employees/search/education': 'Search employees by education',
            'GET /api/v1/employees/:id/searchable-content': 'Get employee searchable content for RAG'
          }
        },
        persons: {
          base: '/api/v1/persons',
          methods: {
            'GET /api/v1/persons': 'List all persons with filtering and pagination',
            'POST /api/v1/persons': 'Create new person',
            'GET /api/v1/persons/:id': 'Get person by ID',
            'PATCH /api/v1/persons/:id': 'Partially update person by ID',
            'DELETE /api/v1/persons/:id': 'Delete person by ID',
            'POST /api/v1/persons/:id/skills': 'Add skill to person',
            'PATCH /api/v1/persons/:id/skills/:skillId': 'Update person skill',
            'DELETE /api/v1/persons/:id/skills/:skillId': 'Remove skill from person',
            'POST /api/v1/persons/:id/technologies': 'Add technology to person',
            'PATCH /api/v1/persons/:id/technologies/:technologyId': 'Update person technology',
            'DELETE /api/v1/persons/:id/technologies/:technologyId': 'Remove technology from person',
            'POST /api/v1/persons/:id/education': 'Add education to person',
            'PATCH /api/v1/persons/:id/education/:educationId': 'Update person education',
            'DELETE /api/v1/persons/:id/education/:educationId': 'Remove education from person',
            'POST /api/v1/persons/search/skills': 'Search persons by skills',
            'POST /api/v1/persons/search/technologies': 'Search persons by technologies',
            'POST /api/v1/persons/search/education': 'Search persons by education',
            'GET /api/v1/persons/:id/capabilities': 'Get person capabilities summary',
            'POST /api/v1/persons/:id/analyze-ai': 'Analyze person capabilities using AI',
            'POST /api/v1/persons/:id/generate-report': 'Generate AI-powered report for person'
          }
        },
        lookup: {
          base: '/api/v1/lookup',
          methods: {
            'GET /api/v1/lookup/skills': 'Get all available skills with search and filtering',
            'GET /api/v1/lookup/skills/categories': 'Get all skill categories',
            'GET /api/v1/lookup/technologies': 'Get all available technologies with search and filtering',
            'GET /api/v1/lookup/technologies/categories': 'Get all technology categories'
          }
        },
        mcp: {
          base: '/api/v1/mcp',
          methods: {
            'GET /api/v1/mcp/tools': 'List available MCP tools',
            'POST /api/v1/mcp/analyze': 'Analyze data using MCP tools',
            'POST /api/v1/mcp/report': 'Generate reports using MCP tools',
            'POST /api/v1/mcp/execute': 'Execute any MCP tool with custom arguments',
            'GET /api/v1/mcp/health': 'Check MCP server health status'
          }
        },
        ai: {
          base: '/api/v1/ai',
          methods: {
            'POST /api/v1/ai/embeddings/generate': 'Generate embedding for a person',
            'POST /api/v1/ai/embeddings/generate-all': 'Generate embeddings for all persons',
            'POST /api/v1/ai/search/similar': 'Find similar persons using RAG',
            'POST /api/v1/ai/analyze/rag': 'Analyze person with RAG context',
            'POST /api/v1/ai/report/rag': 'Generate report with RAG context',
            'POST /api/v1/ai/analyze/direct': 'Direct AI analysis using OpenAI',
            'GET /api/v1/ai/stats': 'Get AI system statistics'
          }
        }
      },
      features: [
        'Server-side UUID generation',
        'PostgreSQL with Drizzle ORM',
        'Rate limiting',
        'Request validation',
        'Comprehensive logging',
        'Swagger documentation',
        'Employee skills and technologies management',
        'Education tracking',
        'RAG-ready searchable content generation',
        'Lookup endpoints for skills/technologies discovery',
        'MCP (Model Context Protocol) integration for AI tools',
        'OpenAI embeddings and vector similarity search',
        'pgvector integration for high-performance similarity search',
        'RAG (Retrieval-Augmented Generation) for AI-powered analysis',
        'Market context analysis and positioning'
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
router.use('/persons', personRoutes);
router.use('/lookup', lookupRoutes);
router.use('/mcp', mcpRoutes);
router.use('/ai', aiRoutes);
router.use('/auth', authRoutes);

export default router;
