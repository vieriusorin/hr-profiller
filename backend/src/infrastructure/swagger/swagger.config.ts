import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Profiller HR API',
      version: '1.0.0',
      description: 'HR management system API with opportunities management',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api.production.com',
        description: 'Production server',
      },
    ],
    components: {
      schemas: {
        Opportunity: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier (UUID) for the opportunity',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            opportunityName: {
              type: 'string',
              description: 'Name of the opportunity',
              example: 'E-Commerce Platform Redesign'
            },
            clientId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'Client UUID reference',
              example: '456e7890-e89b-12d3-a456-426614174001'
            },
            clientName: {
              type: 'string',
              nullable: true,
              description: 'Client company name',
              example: 'TechCorp Inc.'
            },
            expectedStartDate: {
              type: 'string',
              format: 'date',
              nullable: true,
              description: 'Expected project start date',
              example: '2024-03-15'
            },
            expectedEndDate: {
              type: 'string',
              format: 'date',
              nullable: true,
              description: 'Expected project end date',
              example: '2024-09-15'
            },
            probability: {
              type: 'integer',
              minimum: 0,
              maximum: 100,
              nullable: true,
              description: 'Success probability percentage',
              example: 75
            },
            status: {
              type: 'string',
              enum: ['In Progress', 'On Hold', 'Done'],
              description: 'Current status of the opportunity',
              example: 'In Progress'
            },
            comment: {
              type: 'string',
              nullable: true,
              description: 'Additional comments or notes',
              example: 'High priority client project'
            },
            isActive: {
              type: 'boolean',
              description: 'Whether the opportunity is currently active',
              example: true
            },
            activatedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'When the opportunity was activated',
              example: '2024-01-15T10:30:00Z'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the opportunity was created',
              example: '2024-01-10T09:00:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the opportunity was last updated',
              example: '2024-01-16T14:20:00Z'
            }
          },
          required: ['id', 'opportunityName', 'status', 'isActive', 'createdAt', 'updatedAt']
        },
        ApiResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['success', 'error'],
              description: 'Response status',
              example: 'success'
            },
            data: {
              description: 'Response data (varies by endpoint)'
            },
            meta: {
              type: 'object',
              properties: {
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Response timestamp',
                  example: '2024-01-16T15:30:00Z'
                },
                endpoint: {
                  type: 'string',
                  description: 'API endpoint that was called',
                  example: '/api/v1/opportunities'
                },
                count: {
                  type: 'number',
                  description: 'Number of items returned (for list endpoints)',
                  example: 12
                }
              }
            }
          },
          required: ['status', 'data', 'meta']
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['error'],
              example: 'error'
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Opportunity not found'
            },
            meta: {
              type: 'object',
              properties: {
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                  example: '2024-01-16T15:30:00Z'
                },
                endpoint: {
                  type: 'string',
                  example: '/api/v1/opportunities/invalid-id'
                }
              }
            }
          },
          required: ['status', 'message', 'meta']
        }
      }
    }
  },
  apis: ['./src/infrastructure/http/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
