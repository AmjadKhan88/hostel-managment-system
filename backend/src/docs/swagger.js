import swaggerJSDoc from 'swagger-jsdoc';
import { env } from '../config/env.js';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Hostel Management System API',
    version: '0.1.0',
    description: 'REST API for the Hostel Management System.',
  },
  servers: [{ url: `http://localhost:${env.PORT}${env.API_PREFIX}` }],
  components: {
    securitySchemes: {
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'accessToken' },
    },
  },
};

// JSDoc `@openapi` blocks in route files are collected here as each module
// is implemented. Empty on Day 1 since only infra routes exist.
export const swaggerSpec = swaggerJSDoc({
  swaggerDefinition,
  apis: ['./src/routes/**/*.js'],
});
