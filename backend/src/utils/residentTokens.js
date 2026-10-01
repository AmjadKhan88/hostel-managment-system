import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signResidentAccessToken(payload) {
  return jwt.sign(payload, env.RESIDENT_ACCESS_SECRET, { expiresIn: env.RESIDENT_ACCESS_EXPIRY });
}

export function signResidentRefreshToken(payload) {
  return jwt.sign(payload, env.RESIDENT_REFRESH_SECRET, { expiresIn: env.RESIDENT_REFRESH_EXPIRY });
}

export function verifyResidentAccessToken(token) {
  return jwt.verify(token, env.RESIDENT_ACCESS_SECRET);
}

export function verifyResidentRefreshToken(token) {
  return jwt.verify(token, env.RESIDENT_REFRESH_SECRET);
}
