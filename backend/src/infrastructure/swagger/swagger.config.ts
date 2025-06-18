import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Tech Interviews Assistant API',
      version: '1.0.0',
      description: 'API documentation for Tech Interviews Assistant',
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
  },
  apis: ['./src/infrastructure/http/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
