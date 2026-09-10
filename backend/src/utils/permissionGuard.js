import { ApiError } from './ApiError.js';
import { SUPER_ADMIN_WILDCARD } from '../constants/permissions.js';

/**
 * Prevents privilege escalation: an actor can never grant a permission they
 * don't themselves hold. Only a Super Admin (wildcard) can grant anything.
 * Used both when creating/editing a Role and when assigning a Role to staff.
 */
export function assertCanGrantPermissions(actorPermissions, permissionsToGrant) {
  if (actorPermissions.includes(SUPER_ADMIN_WILDCARD)) return;

  const disallowed = permissionsToGrant.filter(
    (p) => p === SUPER_ADMIN_WILDCARD || !actorPermissions.includes(p)
  );

  if (disallowed.length > 0) {
    throw ApiError.forbidden(`You cannot grant permissions you don't have: ${disallowed.join(', ')}`);
  }
}