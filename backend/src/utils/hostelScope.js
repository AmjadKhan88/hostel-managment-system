import { ApiError } from './ApiError.js';
import { SUPER_ADMIN_WILDCARD } from '../constants/permissions.js';

/**
 * Resolves which hostelId a request is allowed to touch, enforcing
 * object-level authorization: a non-super-admin can never read or write
 * another hostel's data just by changing an ID/query param.
 *
 * @returns {string|null} the hostelId to filter by, or null (super admin,
 *   no filter — sees everything) when no specific hostel was requested.
 */
export function resolveHostelScope(user, requestedHostelId) {
  const isSuperAdmin = user.permissions.includes(SUPER_ADMIN_WILDCARD);

  if (isSuperAdmin) {
    return requestedHostelId || null;
  }

  if (!user.hostelId) {
    throw ApiError.forbidden('Your account is not assigned to a hostel');
  }

  if (requestedHostelId && requestedHostelId !== user.hostelId) {
    throw ApiError.forbidden("You cannot access another hostel's data");
  }

  return user.hostelId;
}