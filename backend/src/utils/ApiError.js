/**
 * Predictable, categorized application error.
 * Every thrown business/validation/auth error should be an ApiError so the
 * central error handler can format a consistent response.
 */
export class ApiError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} message
   * @param {string} code - machine-readable error code, e.g. "VALIDATION_ERROR"
   * @param {Array}  errors - optional field-level error details
   */
  constructor(statusCode, message, code = 'ERROR', errors = []) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request', errors = []) {
    return new ApiError(400, message, 'BAD_REQUEST', errors);
  }

  static validation(message = 'Validation failed', errors = []) {
    return new ApiError(422, message, 'VALIDATION_ERROR', errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message, 'FORBIDDEN');
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message, 'NOT_FOUND');
  }

  static conflict(message = 'Conflict') {
    return new ApiError(409, message, 'CONFLICT');
  }

  static tooMany(message = 'Too many requests') {
    return new ApiError(429, message, 'RATE_LIMITED');
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message, 'INTERNAL_ERROR');
  }
}
