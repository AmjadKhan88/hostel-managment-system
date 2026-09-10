import { User } from '../models/User.model.js';
import { Role } from '../models/Role.model.js';
import { ApiError } from '../utils/ApiError.js';
import { resolveHostelScope } from '../utils/hostelScope.js';
import { assertCanGrantPermissions } from '../utils/permissionGuard.js';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination.js';

async function assertRoleIsAssignable(user, hostelId, roleId) {
  const role = await Role.findById(roleId);
  if (!role) throw ApiError.badRequest('Role not found');
  if (role.isSystem) throw ApiError.forbidden('The Super Admin role cannot be assigned to staff');
  if (role.hostelId?.toString() !== hostelId) {
    throw ApiError.badRequest('Role does not belong to this hostel');
  }
  assertCanGrantPermissions(user.permissions, role.permissions);
  return role;
}

export async function createStaff(user, data) {
  const hostelId = resolveHostelScope(user, data.hostelId);
  if (!hostelId) throw ApiError.badRequest('hostelId is required');

  await assertRoleIsAssignable(user, hostelId, data.roleId);

  const existing = await User.findOne({ email: data.email });
  if (existing) throw ApiError.conflict('A user with this email already exists');

  const passwordHash = await User.hashPassword(data.password);

  return User.create({
    name: data.name,
    email: data.email,
    passwordHash,
    roleId: data.roleId,
    hostelId,
    status: 'active',
  });
}

export async function listStaff(user, query) {
  const hostelId = resolveHostelScope(user, query.hostelId);
  if (!hostelId) throw ApiError.badRequest('hostelId is required');

  const { page, limit, skip } = parsePagination(query);
  const filter = { hostelId };
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    User.find(filter).populate('roleId', 'name permissions').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return buildPaginatedResponse({ items, total, page, limit });
}

export async function getStaffById(user, id) {
  const staff = await User.findById(id).populate('roleId', 'name permissions');
  if (!staff) throw ApiError.notFound('Staff member not found');
  resolveHostelScope(user, staff.hostelId?.toString());
  return staff;
}

export async function updateStaff(user, id, data) {
  const staff = await getStaffById(user, id);

  if (data.roleId) {
    await assertRoleIsAssignable(user, staff.hostelId.toString(), data.roleId);
    staff.roleId = data.roleId;
  }
  if (data.name) staff.name = data.name;
  if (data.status) staff.status = data.status;

  await staff.save();
  return staff;
}