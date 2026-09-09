import { ApiError } from '../utils/ApiError.js';
import { SUPER_ADMIN_WILDCARD } from '../constants/permissions.js';

/**
 * Deny-by-default permission check. Must run after `authenticate`.
 * Usage: router.get('/', authenticate, authorize('student.read'), controller)
 */
export function authorize(...requiredPermissions) {
  return (req, res, next) => {
    const userPermissions = req.user?.permissions ?? [];

    if (userPermissions.includes(SUPER_ADMIN_WILDCARD)) return next();

    const hasAll = requiredPermissions.every((p) => userPermissions.includes(p));
    if (!hasAll) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    return next();
  };
}