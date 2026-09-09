import { User } from '../models/User.model.js';
import { Role } from '../models/Role.model.js';
import { ApiError } from '../utils/ApiError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens.js';
import { SUPER_ADMIN_WILDCARD } from '../constants/permissions.js';

function buildAuthPayload(user, role) {
  const permissions = role.permissions.includes(SUPER_ADMIN_WILDCARD)
    ? [SUPER_ADMIN_WILDCARD]
    : role.permissions;

  return {
    id: user._id.toString(),
    hostelId: user.hostelId ? user.hostelId.toString() : null,
    roleId: role._id.toString(),
    permissions,
    tokenVersion: user.tokenVersion,
  };
}

export async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || user.status !== 'active') {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isValid = await user.comparePassword(password);
  if (!isValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const role = await Role.findById(user.roleId);
  if (!role) {
    throw ApiError.internal('User has no valid role assigned');
  }

  const payload = buildAuthPayload(user, role);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ id: payload.id, tokenVersion: payload.tokenVersion });

  user.lastLoginAt = new Date();
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      hostelId: user.hostelId,
      role: { id: role._id, name: role.name, permissions: payload.permissions },
    },
  };
}

export async function refreshSession(refreshToken) {
  if (!refreshToken) throw ApiError.unauthorized('Missing refresh token');

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid or expired session, please log in again');
  }

  const user = await User.findById(decoded.id);
  if (!user || user.status !== 'active' || user.tokenVersion !== decoded.tokenVersion) {
    throw ApiError.unauthorized('Session is no longer valid, please log in again');
  }

  const role = await Role.findById(user.roleId);
  if (!role) throw ApiError.internal('User has no valid role assigned');

  const payload = buildAuthPayload(user, role);
  const accessToken = signAccessToken(payload);
  // Refresh token rotation: issue a new one on every refresh.
  const newRefreshToken = signRefreshToken({ id: payload.id, tokenVersion: payload.tokenVersion });

  return { accessToken, refreshToken: newRefreshToken };
}

export async function getProfile(userId) {
  const user = await User.findById(userId).populate('roleId', 'name permissions');
  if (!user) throw ApiError.notFound('User not found');

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    hostelId: user.hostelId,
    lastLoginAt: user.lastLoginAt,
    role: { id: user.roleId._id, name: user.roleId.name, permissions: user.roleId.permissions },
  };
}