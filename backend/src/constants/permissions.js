export const PERMISSIONS = Object.freeze({
  STUDENT_READ: 'student.read',
  STUDENT_CREATE: 'student.create',
  STUDENT_UPDATE: 'student.update',
  STUDENT_DELETE: 'student.delete',

  ROOM_READ: 'room.read',
  ROOM_CREATE: 'room.create',
  ROOM_UPDATE: 'room.update',
  ROOM_ALLOCATE: 'room.allocate',

  PAYMENTS_READ: 'payments.read',
  PAYMENTS_CREATE: 'payments.create',
  PAYMENTS_REFUND: 'payments.refund',

  COMPLAINTS_READ: 'complaints.read',
  COMPLAINTS_MANAGE: 'complaints.manage',

  MAINTENANCE_READ: 'maintenance.read',
  MAINTENANCE_MANAGE: 'maintenance.manage',

  VISITORS_MANAGE: 'visitors.manage',

  NOTICES_MANAGE: 'notices.manage',

  REPORTS_READ: 'reports.read',

  STAFF_MANAGE: 'staff.manage',

  SETTINGS_MANAGE: 'settings.manage',

  ROLES_MANAGE: 'roles.manage',
});

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

// Granted only to the system Super Admin role — bypasses all permission checks.
export const SUPER_ADMIN_WILDCARD = '*';