import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { setAuthCookies, clearAuthCookies } from '../utils/cookies.js';
import * as authService from '../services/auth.service.js';

export const login = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, user } = await authService.login(req.body);
  setAuthCookies(res, { accessToken, refreshToken });
  new ApiResponse(200, { user }, 'Logged in successfully').send(res);
});

export const refresh = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken } = await authService.refreshSession(req.cookies.refreshToken);
  setAuthCookies(res, { accessToken, refreshToken });
  new ApiResponse(200, null, 'Session refreshed').send(res);
});

export const logout = asyncHandler(async (req, res) => {
  clearAuthCookies(res);
  new ApiResponse(200, null, 'Logged out successfully').send(res);
});

export const me = asyncHandler(async (req, res) => {
  const profile = await authService.getProfile(req.user.id);
  new ApiResponse(200, { user: profile }, 'Profile fetched').send(res);
});