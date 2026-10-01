import { verifyResidentAccessToken } from '../utils/residentTokens.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Verifies the residentAccessToken cookie (NEVER the staff accessToken
 * cookie — different name, different secret) and attaches the decoded
 * payload to req.resident: { id, hostelId, tokenVersion }. Residents have
 * no RBAC permissions — every portal route is implicitly scoped to "your
 * own data only," enforced in the service layer by matching residentId.
 */
export function authenticateResident(req, res, next) {
  const token = req.cookies?.residentAccessToken;
  if (!token) return next(ApiError.unauthorized('Authentication required'));

  try {
    req.resident = verifyResidentAccessToken(token);
    return next();
  } catch {
    return next(ApiError.unauthorized('Invalid or expired session'));
  }
}
