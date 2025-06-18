import express, { ErrorRequestHandler } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import routes from './routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../../infrastructure/swagger/swagger.config';
import {
  apiLimiter,
  authLimiter,
  metricsLimiter,
  swaggerLimiter,
} from './middlewares/rate-limiter.middleware';
import { helmetMiddleware } from './middlewares/helmet.middleware';
import { payloadLimiter, speedLimiter } from './middlewares/request-limiter.middleware';
import { securityHeaders } from './middlewares/security-header.middleware';
import { errorHandler } from './middlewares/error-handler.middleware';

/**
 * Create a new server instance
 * @returns The server instance
 */
const createServer = () => {
  const app = express();

  app.use(helmetMiddleware);

  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  );
  app.use(morgan('dev'));
  app.use(payloadLimiter);
  app.use(speedLimiter);
  app.use(express.urlencoded({ extended: true }));
  app.use(apiLimiter, metricsLimiter, authLimiter, swaggerLimiter);
  app.use(securityHeaders);

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use('/api/v1', routes);

  app.use(errorHandler as unknown as ErrorRequestHandler);

  return app;
};

export default createServer;
