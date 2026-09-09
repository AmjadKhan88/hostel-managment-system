import { verifyAccessToken } from '../utils/tokens.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Verifies the accessToken cookie and attaches the decoded payload to
 * req.user: { id, hostelId, roleId, permissions, tokenVersion }.
 */
export function authenticate(req, res, next) {
  const token = req.cookies?.accessToken;
  if (!token) return next(ApiError.unauthorized('Authentication required'));

  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch {
    return next(ApiError.unauthorized('Invalid or expired session'));
  }
}