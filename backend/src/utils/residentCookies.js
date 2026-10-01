import { env, isProd } from '../config/env.js';

const COOKIE_BASE = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax',
  path: '/',
};

function parseDurationToMs(duration) {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) return 15 * 60 * 1000;
  const value = Number(match[1]);
  const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return value * multipliers[match[2]];
}

// Distinct cookie names from staff's accessToken/refreshToken — a resident
// and a staff member can even be logged in simultaneously in the same
// browser without collision, and there's no ambiguity for either
// middleware about which cookie belongs to which auth system.
export function setResidentAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie('residentAccessToken', accessToken, {
    ...COOKIE_BASE,
    maxAge: parseDurationToMs(env.RESIDENT_ACCESS_EXPIRY),
  });
  res.cookie('residentRefreshToken', refreshToken, {
    ...COOKIE_BASE,
    maxAge: parseDurationToMs(env.RESIDENT_REFRESH_EXPIRY),
  });
}

export function clearResidentAuthCookies(res) {
  res.clearCookie('residentAccessToken', COOKIE_BASE);
  res.clearCookie('residentRefreshToken', COOKIE_BASE);
}
