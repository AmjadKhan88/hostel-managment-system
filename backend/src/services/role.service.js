import { Role } from '../models/Role.model.js';
import { ApiError } from '../utils/ApiError.js';
import { resolveHostelScope } from '../utils/hostelScope.js';
import { assertCanGrantPermissions } from '../utils/permissionGuard.js';

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function createRole(user, data) {
  const hostelId = resolveHostelScope(user, data.hostelId);
  if (!hostelId) throw ApiError.badRequest('hostelId is required');

  assertCanGrantPermissions(user.permissions, data.permissions);

  const slug = slugify(data.name);
  const existing = await Role.findOne({ hostelId, slug });
  if (existing) throw ApiError.conflict('A role with this name already exists in this hostel');

  return Role.create({ hostelId, name: data.name, slug, permissions: data.permissions });
}

export async function listRoles(user, requestedHostelId) {
  const hostelId = resolveHostelScope(user, requestedHostelId);
  if (!hostelId) throw ApiError.badRequest('hostelId is required');
  return Role.find({ hostelId }).sort({ name: 1 });
}

export async function getRoleById(user, id) {
  const role = await Role.findById(id);
  if (!role) throw ApiError.notFound('Role not found');
  if (role.hostelId) resolveHostelScope(user, role.hostelId.toString());
  return role;
}

export async function updateRole(user, id, data) {
  const role = await getRoleById(user, id);
  if (role.isSystem) throw ApiError.forbidden('System roles cannot be modified');

  if (data.permissions) {
    assertCanGrantPermissions(user.permissions, data.permissions);
    role.permissions = data.permissions;
  }
  if (data.name) {
    role.name = data.name;
    role.slug = slugify(data.name);
  }

  await role.save();
  return role;
}