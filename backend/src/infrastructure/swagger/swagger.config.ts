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
            },
            // Computed fields from presentation layer (extends schema automatically)
            isHighProbability: {
              type: 'boolean',
              description: 'Whether the opportunity has high probability (>= 80%) - computed from business logic',
              example: true
            },
            duration: {
              type: 'integer',
              nullable: true,
              description: 'Project duration in days - computed from start/end dates',
              example: 180
            },
            isExpiringSoon: {
              type: 'boolean',
              description: 'Whether the opportunity is expiring within 30 days - computed from end date',
              example: false
            }
          },
          required: ['id', 'opportunityName', 'status', 'isActive', 'createdAt', 'updatedAt', 'isHighProbability', 'duration', 'isExpiringSoon']
        },
        // Enhanced presenter response schemas
        PaginationMeta: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              minimum: 1,
              description: 'Current page number',
              example: 1
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              description: 'Items per page',
              example: 10
            },
            total: {
              type: 'integer',
              minimum: 0,
              description: 'Total number of items',
              example: 25
            },
            totalPages: {
              type: 'integer',
              minimum: 0,
              description: 'Total number of pages',
              example: 3
            },
            hasNextPage: {
              type: 'boolean',
              description: 'Whether there is a next page',
              example: true
            },
            hasPreviousPage: {
              type: 'boolean',
              description: 'Whether there is a previous page',
              example: false
            },
            nextPage: {
              type: 'integer',
              nullable: true,
              description: 'Next page number (null if no next page)',
              example: 2
            },
            previousPage: {
              type: 'integer',
              nullable: true,
              description: 'Previous page number (null if no previous page)',
              example: null
            }
          },
          required: ['page', 'limit', 'total', 'totalPages', 'hasNextPage', 'hasPreviousPage', 'nextPage', 'previousPage']
        },
        FilterParams: {
          type: 'object',
          properties: {
            client: {
              type: 'string',
              description: 'Filter by client name (partial match)',
              example: 'Herzog'
            },
            probability: {
              type: 'array',
              items: {
                type: 'integer',
                minimum: 0,
                maximum: 100
              },
              minItems: 2,
              maxItems: 2,
              description: 'Probability range filter [min, max]',
              example: [80, 100]
            },
            status: {
              type: 'string',
              enum: ['In Progress', 'On Hold', 'Done'],
              description: 'Filter by status',
              example: 'Done'
            },
            isActive: {
              type: 'boolean',
              description: 'Filter by active status',
              example: true
            },
            startDate: {
              type: 'string',
              format: 'date',
              description: 'Filter by start date (from)',
              example: '2025-01-01'
            },
            endDate: {
              type: 'string',
              format: 'date',
              description: 'Filter by end date (to)',
              example: '2025-12-31'
            }
          }
        },
        SearchParams: {
          type: 'object',
          properties: {
            search: {
              type: 'string',
              description: 'Search term',
              example: 'Platform'
            },
            searchFields: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['opportunityName', 'clientName', 'comment']
              },
              description: 'Fields to search in',
              example: ['opportunityName', 'clientName']
            }
          }
        },
        SortParams: {
          type: 'object',
          properties: {
            sortBy: {
              type: 'string',
              enum: ['opportunityName', 'clientName', 'probability', 'createdAt', 'updatedAt', 'status'],
              description: 'Field to sort by',
              example: 'probability'
            },
            sortOrder: {
              type: 'string',
              enum: ['asc', 'desc'],
              description: 'Sort order',
              example: 'desc'
            }
          }
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Opportunity'
              },
              description: 'Array of opportunities'
            },
            pagination: {
              $ref: '#/components/schemas/PaginationMeta'
            },
            filters: {
              $ref: '#/components/schemas/FilterParams',
              description: 'Applied filters (if any)'
            },
            search: {
              $ref: '#/components/schemas/SearchParams',
              description: 'Search parameters (if any)'
            },
            sort: {
              $ref: '#/components/schemas/SortParams',
              description: 'Sort parameters (if any)'
            }
          },
          required: ['data', 'pagination']
        },
        EnhancedMeta: {
          type: 'object',
          properties: {
            count: {
              type: 'integer',
              description: 'Number of items in current page',
              example: 5
            },
            filtered: {
              type: 'integer',
              description: 'Total items after filtering',
              example: 15
            },
            total: {
              type: 'integer',
              description: 'Total items in database',
              example: 25
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Response timestamp',
              example: '2025-06-19T11:47:43.584Z'
            },
            endpoint: {
              type: 'string',
              description: 'API endpoint that was called',
              example: '/api/v1/opportunities'
            }
          },
          required: ['count', 'timestamp']
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
              oneOf: [
                { $ref: '#/components/schemas/Opportunity' },
                { type: 'array', items: { $ref: '#/components/schemas/Opportunity' } },
                { $ref: '#/components/schemas/PaginatedResponse' }
              ],
              description: 'Response data (varies by endpoint)'
            },
            meta: {
              oneOf: [
                { $ref: '#/components/schemas/EnhancedMeta' },
                {
                  type: 'object',
                  properties: {
                    timestamp: {
                      type: 'string',
                      format: 'date-time'
                    }
                  }
                }
              ],
              description: 'Response metadata'
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
