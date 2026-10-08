import { User } from '../models/User.model.js';
import { Role } from '../models/Role.model.js';
import { ApiError } from '../utils/ApiError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens.js';
import { SUPER_ADMIN_WILDCARD } from '../constants/permissions.js';
import { recordAuditLog } from './audit.service.js';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { sendEmail } from './email.service.js';

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
    recordAuditLog({
      hostelId: user?.hostelId ?? null,
      actorId: user?._id ?? null,
      actorName: email,
      action: 'auth.login_failed',
      entityType: 'User',
      entityId: user?._id ?? null,
      metadata: { reason: 'invalid_credentials_or_inactive' },
    });
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isValid = await user.comparePassword(password);
  if (!isValid) {
    recordAuditLog({
      hostelId: user.hostelId,
      actorId: user._id,
      actorName: user.name,
      action: 'auth.login_failed',
      entityType: 'User',
      entityId: user._id,
      metadata: { reason: 'wrong_password' },
    });
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

  recordAuditLog({
    hostelId: user.hostelId,
    actorId: user._id,
    actorName: user.name,
    action: 'auth.login',
    entityType: 'User',
    entityId: user._id,
  });

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

// ---- Password reset ----

const RESET_TOKEN_TTL_MINUTES = 60;
const RESET_REQUEST_COOLDOWN_MS = 60 * 1000;

function hashResetToken(rawToken) {
  // SHA-256 (not bcrypt) is right here: the input is already a 256-bit
  // random value, not a guessable password, so a fast hash is safe and lets
  // us look the user up directly by hash.
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function sendInBackground(message, context) {
  // Deliberately not awaited by callers — see requestPasswordReset.
  sendEmail(message)
    .then((result) => {
      if (!result.sent) {
        logger.warn(
          { ...context, reason: result.error ?? result.reason },
          'Auth email was not sent'
        );
      }
    })
    .catch((err) => logger.error({ err, ...context }, 'Auth email failed'));
}

/**
 * Always returns { requested: true }, whether or not the email belongs to an
 * account (or the account is suspended, or it's in cooldown) — otherwise
 * this endpoint becomes a way to discover which emails are registered.
 */
export async function requestPasswordReset(email) {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const now = new Date();

  // One atomic step: only an ACTIVE account that hasn't had a reset
  // requested in the last minute gets a token. Doubling as the cooldown
  // check means two simultaneous requests can't both pass it.
  const user = await User.findOneAndUpdate(
    {
      email: email.toLowerCase(),
      status: 'active',
      $or: [
        { passwordResetRequestedAt: null },
        { passwordResetRequestedAt: { $lt: new Date(now.getTime() - RESET_REQUEST_COOLDOWN_MS) } },
      ],
    },
    {
      $set: {
        passwordResetTokenHash: hashResetToken(rawToken),
        passwordResetExpiresAt: new Date(now.getTime() + RESET_TOKEN_TTL_MINUTES * 60 * 1000),
        passwordResetRequestedAt: now,
      },
    },
    { projection: { name: 1, email: 1, hostelId: 1 } }
  );

  if (!user) return { requested: true };

  recordAuditLog({
    hostelId: user.hostelId,
    actorId: user._id,
    actorName: user.name,
    action: 'auth.password_reset_requested',
    entityType: 'User',
    entityId: user._id,
  });

  // NOT awaited: an existing account would otherwise respond measurably
  // slower than an unknown one (the SMTP round trip), which leaks the same
  // thing the identical response is meant to hide.
  sendInBackground(
    {
      to: user.email,
      subject: 'Reset your password',
      text: `Hi ${user.name},\n\nWe received a request to reset your password. Open the link below to choose a new one. It expires in ${RESET_TOKEN_TTL_MINUTES} minutes and can only be used once.\n\n${env.FRONTEND_URL}/reset-password?token=${rawToken}\n\nIf you didn't ask for this, you can ignore this email — your password won't change.`,
    },
    { userId: user._id, kind: 'password_reset' }
  );

  return { requested: true };
}

export async function resetPassword({ token, password }) {
  const tokenHash = hashResetToken(token);
  const invalid = () =>
    ApiError.badRequest('This reset link is invalid or has expired — request a new one');
  const validToken = {
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() },
    status: 'active',
  };

  // Cheap check first, so a garbage token never costs a bcrypt hash.
  if (!(await User.exists(validToken))) throw invalid();

  const passwordHash = await User.hashPassword(password);

  // Atomic single-use claim: matches AND clears the token in one operation,
  // so two concurrent submissions of the same link can't both succeed.
  // Bumping tokenVersion invalidates every outstanding refresh token — a
  // stolen session can't outlive the reset (an already-issued access token
  // still works until it expires, at most 15 minutes).
  const user = await User.findOneAndUpdate(
    validToken,
    {
      $set: { passwordHash, passwordResetTokenHash: null, passwordResetExpiresAt: null },
      $inc: { tokenVersion: 1 },
    },
    { projection: { name: 1, email: 1, hostelId: 1 } }
  );
  if (!user) throw invalid();

  recordAuditLog({
    hostelId: user.hostelId,
    actorId: user._id,
    actorName: user.name,
    action: 'auth.password_reset',
    entityType: 'User',
    entityId: user._id,
  });

  sendInBackground(
    {
      to: user.email,
      subject: 'Your password was changed',
      text: `Hi ${user.name},\n\nThe password on your account was just changed. If this was you, no action is needed.\n\nIf it wasn't you, contact your hostel administrator immediately.`,
    },
    { userId: user._id, kind: 'password_changed' }
  );

  return { reset: true };
}
