import crypto from 'crypto';
import { Resident } from '../models/Resident.model.js';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import {
  signResidentAccessToken,
  signResidentRefreshToken,
  verifyResidentRefreshToken,
} from '../utils/residentTokens.js';
import { sendEmail } from './email.service.js';
import { recordAuditLog } from './audit.service.js';
import { Hostel } from '../models/Hostel.model.js';

function hashToken(rawToken) {
  // A one-time setup/reset token is bearer-equivalent to a password reset,
  // so only its hash is ever stored — same practice as a password. SHA-256
  // (not bcrypt) is appropriate here: the input is already a
  // high-entropy random value, not a human-guessable password, so a fast
  // hash is fine and avoids unnecessary bcrypt cost on every verification.
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function generateRawToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function sendPortalLink({ resident, rawToken, kind }) {
  const path = kind === 'invite' ? 'portal/set-password' : 'portal/reset-password';
  const link = `${env.FRONTEND_URL}/${path}?token=${rawToken}&residentId=${resident._id}`;
  const subject =
    kind === 'invite'
      ? 'Set up your Resident Portal account'
      : 'Reset your Resident Portal password';
  const action = kind === 'invite' ? 'set up your account' : 'reset your password';

  await sendEmail({
    to: resident.email,
    subject,
    text: `Hi ${resident.name},\n\nClick the link below to ${action}. This link expires in ${env.PORTAL_SETUP_TOKEN_EXPIRY_HOURS} hours.\n\n${link}\n\nIf you didn't request this, you can safely ignore this email.`,
  });
}

/**
 * Staff-triggered: generates a one-time setup link and emails it to the
 * resident. Nobody but the resident ever sees their password — staff never
 * sets one on their behalf.
 */
export async function inviteResidentToPortal(actorUser, residentId) {
  const resident = await Resident.findById(residentId);
  if (!resident) throw ApiError.notFound('Resident not found');
  if (!resident.email) {
    throw ApiError.badRequest(
      'This resident has no email on file — add one before inviting them to the portal'
    );
  }

  const rawToken = generateRawToken();
  resident.portalAccount.setupTokenHash = hashToken(rawToken);
  resident.portalAccount.setupTokenExpiresAt = new Date(
    Date.now() + env.PORTAL_SETUP_TOKEN_EXPIRY_HOURS * 3600 * 1000
  );
  resident.portalAccount.status = 'invited';
  resident.portalAccount.invitedAt = new Date();
  await resident.save();

  await sendPortalLink({ resident, rawToken, kind: 'invite' });

  recordAuditLog({
    hostelId: resident.hostelId.toString(),
    actorId: actorUser.id,
    action: 'portal.invited',
    entityType: 'Resident',
    entityId: resident._id,
    metadata: { email: resident.email },
  });

  return { invited: true };
}

async function assertValidSetupToken(resident, rawToken) {
  if (!resident.portalAccount?.setupTokenHash || !resident.portalAccount?.setupTokenExpiresAt) {
    throw ApiError.badRequest('This link is invalid or has already been used');
  }
  if (resident.portalAccount.setupTokenExpiresAt < new Date()) {
    throw ApiError.badRequest('This link has expired — ask staff to send a new one');
  }
  if (resident.portalAccount.setupTokenHash !== hashToken(rawToken)) {
    throw ApiError.badRequest('This link is invalid or has already been used');
  }
}

/** Resident clicks the emailed link and sets their own password. */
export async function setupPortalAccount({ residentId, token, password }) {
  const resident = await Resident.findById(residentId).select('+portalAccount.setupTokenHash');
  if (!resident) throw ApiError.badRequest('This link is invalid or has already been used');

  await assertValidSetupToken(resident, token);

  resident.portalAccount.passwordHash = await Resident.hashPortalPassword(password);
  resident.portalAccount.status = 'active';
  resident.portalAccount.setupTokenHash = null;
  resident.portalAccount.setupTokenExpiresAt = null;
  resident.portalAccount.tokenVersion = (resident.portalAccount.tokenVersion ?? 0) + 1; // invalidate anything issued before setup
  await resident.save();

  recordAuditLog({
    hostelId: resident.hostelId.toString(),
    actorId: null,
    actorName: resident.name,
    action: 'portal.account_activated',
    entityType: 'Resident',
    entityId: resident._id,
  });

  return { activated: true };
}

export async function requestPortalPasswordReset(email) {
  const resident = await Resident.findOne({ email: email.toLowerCase() });
  // Deliberately the SAME response whether or not the email exists / has
  // an active account — otherwise this endpoint becomes a way to discover
  // which emails belong to residents.
  if (!resident || resident.portalAccount?.status !== 'active') {
    return { requested: true };
  }

  const rawToken = generateRawToken();
  resident.portalAccount.setupTokenHash = hashToken(rawToken);
  resident.portalAccount.setupTokenExpiresAt = new Date(
    Date.now() + env.PORTAL_SETUP_TOKEN_EXPIRY_HOURS * 3600 * 1000
  );
  await resident.save();

  await sendPortalLink({ resident, rawToken, kind: 'reset' });

  return { requested: true };
}

export async function resetPortalPassword({ residentId, token, password }) {
  const resident = await Resident.findById(residentId).select('+portalAccount.setupTokenHash');
  if (!resident) throw ApiError.badRequest('This link is invalid or has already been used');

  await assertValidSetupToken(resident, token);

  resident.portalAccount.passwordHash = await Resident.hashPortalPassword(password);
  resident.portalAccount.setupTokenHash = null;
  resident.portalAccount.setupTokenExpiresAt = null;
  resident.portalAccount.tokenVersion = (resident.portalAccount.tokenVersion ?? 0) + 1; // logs out every existing session
  await resident.save();

  recordAuditLog({
    hostelId: resident.hostelId.toString(),
    actorId: null,
    actorName: resident.name,
    action: 'portal.password_reset',
    entityType: 'Resident',
    entityId: resident._id,
  });

  return { reset: true };
}

function buildResidentAuthPayload(resident) {
  return {
    id: resident._id.toString(),
    hostelId: resident.hostelId.toString(),
    tokenVersion: resident.portalAccount.tokenVersion,
  };
}

async function getHostelCurrency(hostelId) {
  const hostel = await Hostel.findById(hostelId).select('currency');
  return hostel?.currency ?? 'PKR';
}

export async function loginResident({ email, password }) {
  const resident = await Resident.findOne({ email: email?.toLowerCase() }).select(
    '+portalAccount.passwordHash'
  );

  if (
    !resident ||
    resident.portalAccount?.status !== 'active' ||
    !resident.portalAccount.passwordHash
  ) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isValid = await resident.comparePortalPassword(password);
  if (!isValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const payload = buildResidentAuthPayload(resident);
  const accessToken = signResidentAccessToken(payload);
  const refreshToken = signResidentRefreshToken({
    id: payload.id,
    tokenVersion: payload.tokenVersion,
  });

  resident.portalAccount.lastLoginAt = new Date();
  await resident.save();

  recordAuditLog({
    hostelId: resident.hostelId.toString(),
    actorId: null,
    actorName: resident.name,
    action: 'portal.login',
    entityType: 'Resident',
    entityId: resident._id,
  });

  return {
    accessToken,
    refreshToken,
    resident: {
      id: resident._id,
      name: resident.name,
      email: resident.email,
      hostelId: resident.hostelId,
      currency: await getHostelCurrency(resident.hostelId),
    },
  };
}

export async function refreshResidentSession(refreshToken) {
  if (!refreshToken) throw ApiError.unauthorized('Missing refresh token');

  let decoded;
  try {
    decoded = verifyResidentRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid or expired session, please log in again');
  }

  const resident = await Resident.findById(decoded.id);
  if (
    !resident ||
    resident.portalAccount?.status !== 'active' ||
    resident.portalAccount.tokenVersion !== decoded.tokenVersion
  ) {
    throw ApiError.unauthorized('Session is no longer valid, please log in again');
  }

  const payload = buildResidentAuthPayload(resident);
  const accessToken = signResidentAccessToken(payload);
  const newRefreshToken = signResidentRefreshToken({
    id: payload.id,
    tokenVersion: payload.tokenVersion,
  });

  return { accessToken, refreshToken: newRefreshToken };
}

export async function getResidentPortalProfile(residentAuth) {
  const resident = await Resident.findById(residentAuth.id);
  if (!resident) throw ApiError.notFound('Resident not found');

  return {
    id: resident._id,
    name: resident.name,
    email: resident.email,
    phone: resident.phone,
    registrationNumber: resident.registrationNumber,
    status: resident.status,
    hostelId: resident.hostelId,
    currency: await getHostelCurrency(resident.hostelId),
  };
}
