import { describe, it, expect } from 'vitest';
import { resolveHostelScope } from './hostelScope.js';
import { SUPER_ADMIN_WILDCARD } from '../constants/permissions.js';

describe('resolveHostelScope', () => {
  const superAdmin = { permissions: [SUPER_ADMIN_WILDCARD], hostelId: null };
  const staff = { permissions: ['student.read'], hostelId: 'hostel-a' };
  const unassignedStaff = { permissions: ['student.read'], hostelId: null };

  it('lets a super admin see everything when no hostelId is requested', () => {
    expect(resolveHostelScope(superAdmin, undefined)).toBeNull();
  });

  it('lets a super admin scope to any requested hostel', () => {
    expect(resolveHostelScope(superAdmin, 'hostel-x')).toBe('hostel-x');
  });

  it("returns the staff member's own hostel when none is requested", () => {
    expect(resolveHostelScope(staff, undefined)).toBe('hostel-a');
  });

  it('allows staff to explicitly request their own hostel', () => {
    expect(resolveHostelScope(staff, 'hostel-a')).toBe('hostel-a');
  });

  it("rejects staff requesting a DIFFERENT hostel's data", () => {
    expect(() => resolveHostelScope(staff, 'hostel-b')).toThrow(/cannot access another hostel/i);
  });

  it('rejects a staff member with no assigned hostel', () => {
    expect(() => resolveHostelScope(unassignedStaff, undefined)).toThrow(
      /not assigned to a hostel/i
    );
  });
});
