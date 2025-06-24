import 'reflect-metadata';
import express, { ErrorRequestHandler } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
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
import { protectPageWithSession } from './middlewares/protectPage.middleware';
import { authorize } from './middlewares/authorization.middleware';

const createServer = () => {
  const app = express();

  app.use(helmetMiddleware);

  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl requests, or Postman)
        if (!origin) return callback(null, true);

        // In development, be more permissive
        if (process.env.NODE_ENV === 'development') {
          // Allow localhost and 127.0.0.1 with any port
          if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
          }
        }

        // Check against allowed origins
        if (allowedOrigins.indexOf(origin) !== -1) {
          return callback(null, true);
        }

        // Allow the server's own origin for Swagger UI
        if (origin.includes(`http://localhost:${process.env.PORT || 3001}`)) {
          return callback(null, true);
        }

        console.log(`CORS: Rejecting origin: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
      credentials: true,
    })
  );
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(cookieParser());
  app.use(payloadLimiter);
  app.use(speedLimiter);
  app.use(express.urlencoded({ extended: true }));
  app.use(apiLimiter, metricsLimiter, authLimiter, swaggerLimiter);
  app.use(securityHeaders);

  app.use(
    '/api-docs',
    protectPageWithSession,
    authorize(['admin']),
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
  );

  app.use('/api/v1', routes);

  app.use(errorHandler as unknown as ErrorRequestHandler);

  return app;
};

export default createServer;
