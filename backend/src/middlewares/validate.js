import { ApiError } from '../utils/ApiError.js';

/**
 * Validates req.body / req.query / req.params against Zod schemas.
 * Usage: router.post('/x', validate({ body: createXSchema }), controller)
 */
export function validate(schemas) {
  return (req, res, next) => {
    for (const key of ['body', 'query', 'params']) {
      const schema = schemas[key];
      if (!schema) continue;

      const result = schema.safeParse(req[key]);
      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        return next(ApiError.validation('Validation failed', errors));
      }
      req[key] = result.data;
    }
    return next();
  };
}
