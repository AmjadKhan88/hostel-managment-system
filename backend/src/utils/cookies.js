import { env, isProd } from '../config/env.js';

const COOKIE_BASE = {
  httpOnly: true,
  secure: isProd, // requires HTTPS in production
  sameSite: 'lax',
  path: '/',
};

function parseDurationToMs(duration) {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) return 15 * 60 * 1000; // fallback: 15 minutes
  const value = Number(match[1]);
  const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return value * multipliers[match[2]];
}

export function setAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie('accessToken', accessToken, {
    ...COOKIE_BASE,
    maxAge: parseDurationToMs(env.JWT_ACCESS_EXPIRY),
  });
  res.cookie('refreshToken', refreshToken, {
    ...COOKIE_BASE,
    maxAge: parseDurationToMs(env.JWT_REFRESH_EXPIRY),
  });
}

export function clearAuthCookies(res) {
  res.clearCookie('accessToken', COOKIE_BASE);
  res.clearCookie('refreshToken', COOKIE_BASE);
}