import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { setResidentAuthCookies, clearResidentAuthCookies } from '../utils/residentCookies.js';
import * as residentAuthService from '../services/residentAuth.service.js';

export const login = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, resident } = await residentAuthService.loginResident(req.body);
  setResidentAuthCookies(res, { accessToken, refreshToken });
  new ApiResponse(200, { resident }, 'Logged in successfully').send(res);
});

export const refresh = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken } = await residentAuthService.refreshResidentSession(
    req.cookies.residentRefreshToken
  );
  setResidentAuthCookies(res, { accessToken, refreshToken });
  new ApiResponse(200, null, 'Session refreshed').send(res);
});

export const logout = asyncHandler(async (req, res) => {
  clearResidentAuthCookies(res);
  new ApiResponse(200, null, 'Logged out successfully').send(res);
});

export const me = asyncHandler(async (req, res) => {
  const profile = await residentAuthService.getResidentPortalProfile(req.resident);
  new ApiResponse(200, { resident: profile }, 'Profile fetched').send(res);
});

export const setupAccount = asyncHandler(async (req, res) => {
  const result = await residentAuthService.setupPortalAccount(req.body);
  new ApiResponse(200, result, 'Account activated — you can now log in').send(res);
});

export const requestPasswordReset = asyncHandler(async (req, res) => {
  const result = await residentAuthService.requestPortalPasswordReset(req.body.email);
  new ApiResponse(
    200,
    result,
    'If an account exists for that email, a reset link has been sent'
  ).send(res);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await residentAuthService.resetPortalPassword(req.body);
  new ApiResponse(200, result, 'Password reset — you can now log in').send(res);
});
