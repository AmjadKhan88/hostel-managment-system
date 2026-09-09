import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { randomUUID } from 'crypto';

import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { globalRateLimiter } from './middlewares/rateLimiter.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { swaggerSpec } from './docs/swagger.js';
import apiV1Router from './routes/v1/index.js';

export function createApp() {
  const app = express();

  // Trust the first proxy hop (needed for correct client IPs / secure cookies
  // behind a load balancer in production).
  app.set('trust proxy', 1);

  // ---- Security ----
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
    })
  );
  app.use(hpp());
  app.use(mongoSanitize());

  // ---- Parsing ----
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(compression());

  // ---- Request correlation + logging ----
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => req.headers['x-request-id'] || randomUUID(),
      autoLogging: {
        ignore: (req) => req.url === `${env.API_PREFIX}/health`,
      },
      customLogLevel: (req, res, err) => {
        if (res.statusCode >= 500 || err) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
    })
  );

  // ---- Rate limiting (applied to the whole API) ----
  app.use(env.API_PREFIX, globalRateLimiter);

  // ---- API docs ----
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // ---- Routes ----
  app.use(env.API_PREFIX, apiV1Router);

  app.get('/', (req, res) => {
    res.json({ success: true, message: 'Hostel Management API is running', docs: '/api-docs' });
  });

  // ---- 404 + centralized error handling ----
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
