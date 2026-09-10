import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { PERMISSIONS } from '../constants/permissions.js';

const CATEGORY_LABELS = {
  student: 'Residents',
  room: 'Rooms & Beds',
  payments: 'Payments',
  complaints: 'Complaints',
  maintenance: 'Maintenance',
  visitors: 'Visitors',
  notices: 'Notices',
  reports: 'Reports',
  staff: 'Staff',
  settings: 'Settings',
  roles: 'Roles',
  hostel: 'Hostels',
  building: 'Buildings',
};

export const listPermissions = asyncHandler(async (req, res) => {
  const groups = new Map();

  for (const key of Object.values(PERMISSIONS)) {
    const [category] = key.split('.');
    const label = CATEGORY_LABELS[category] ?? category;
    if (!groups.has(category)) groups.set(category, { category, label, permissions: [] });
    groups.get(category).permissions.push({ key, label: key.split('.')[1] });
  }

  new ApiResponse(200, { groups: Array.from(groups.values()) }, 'Permissions fetched successfully').send(res);
});