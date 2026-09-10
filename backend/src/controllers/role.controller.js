import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as roleService from '../services/role.service.js';

export const createRole = asyncHandler(async (req, res) => {
  const role = await roleService.createRole(req.user, req.body);
  new ApiResponse(201, { role }, 'Role created successfully').send(res);
});

export const listRoles = asyncHandler(async (req, res) => {
  const roles = await roleService.listRoles(req.user, req.query.hostelId);
  new ApiResponse(200, { roles }, 'Roles fetched successfully').send(res);
});

export const getRole = asyncHandler(async (req, res) => {
  const role = await roleService.getRoleById(req.user, req.params.id);
  new ApiResponse(200, { role }, 'Role fetched successfully').send(res);
});

export const updateRole = asyncHandler(async (req, res) => {
  const role = await roleService.updateRole(req.user, req.params.id, req.body);
  new ApiResponse(200, { role }, 'Role updated successfully').send(res);
});