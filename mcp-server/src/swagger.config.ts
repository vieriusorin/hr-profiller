import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'MCP Server API',
      version: '1.0.0',
      description: 'API documentation for the Model Context Protocol (MCP) server exposing AI tools as HTTP endpoints.',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Development server',
      }
    ],
    components: {
      responses: {
        NotFound: {
          description: 'The specified resource was not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'Resource not found' }
                }
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string', example: 'Internal server error' }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/server.ts'], // Path to the API docs (JSDoc comments)
};

export const swaggerSpec = swaggerJsdoc(options); 