import { ApiError } from '../utils/ApiError.js';
import { isProd } from '../config/env.js';
import { logger } from '../config/logger.js';

/**
 * Converts any thrown error (ApiError, Mongoose error, Zod error, or an
 * unexpected exception) into the standard error response shape:
 * { success: false, message, code, errors: [] }
 *
 * Stack traces are never sent to the client in production.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let apiError = err;

  if (!(err instanceof ApiError)) {
    // Normalize known non-ApiError cases without leaking internals.
    if (err?.name === 'ValidationError') {
      apiError = ApiError.validation('Validation failed', formatMongooseValidation(err));
    } else if (err?.code === 11000) {
      apiError = ApiError.conflict('Duplicate value violates a unique constraint');
    } else if (err?.name === 'CastError') {
      apiError = ApiError.badRequest(`Invalid value for field "${err.path}"`);
    } else if (err?.name === 'JsonWebTokenError' || err?.name === 'TokenExpiredError') {
      apiError = ApiError.unauthorized('Invalid or expired session');
    } else {
      apiError = ApiError.internal(isProd ? 'Internal server error' : err.message);
    }
  }

  const logPayload = {
    statusCode: apiError.statusCode,
    code: apiError.code,
    path: req.originalUrl,
    method: req.method,
    requestId: req.id,
  };

  if (apiError.statusCode >= 500) {
    logger.error({ ...logPayload, err }, 'Unhandled/internal error');
  } else {
    logger.warn(logPayload, apiError.message);
  }

  res.status(apiError.statusCode).json({
    success: false,
    message: apiError.message,
    code: apiError.code,
    errors: apiError.errors ?? [],
    ...(isProd ? {} : { stack: err.stack }),
  });
}

function formatMongooseValidation(err) {
  return Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
}
