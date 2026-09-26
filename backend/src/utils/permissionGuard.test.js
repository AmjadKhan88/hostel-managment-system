import { describe, it, expect } from 'vitest';
import { assertCanGrantPermissions } from './permissionGuard.js';
import { SUPER_ADMIN_WILDCARD } from '../constants/permissions.js';

describe('assertCanGrantPermissions', () => {
  it('allows a super admin to grant any permission, including the wildcard', () => {
    expect(() =>
      assertCanGrantPermissions(
        [SUPER_ADMIN_WILDCARD],
        ['student.read', 'payments.refund', SUPER_ADMIN_WILDCARD]
      )
    ).not.toThrow();
  });

  it('allows granting a permission the actor already holds', () => {
    expect(() =>
      assertCanGrantPermissions(['student.read', 'room.read'], ['student.read'])
    ).not.toThrow();
  });

  it("rejects granting a permission the actor doesn't hold", () => {
    expect(() => assertCanGrantPermissions(['student.read'], ['payments.refund'])).toThrow(
      /cannot grant permissions you don't have/i
    );
  });

  it('rejects a non-super-admin trying to grant the wildcard', () => {
    expect(() =>
      assertCanGrantPermissions(['student.read'], ['student.read', SUPER_ADMIN_WILDCARD])
    ).toThrow(/cannot grant permissions you don't have/i);
  });

  it('lists every disallowed permission in the error, not just the first', () => {
    try {
      assertCanGrantPermissions(['student.read'], ['payments.refund', 'staff.manage']);
      throw new Error('expected assertCanGrantPermissions to throw');
    } catch (err) {
      expect(err.message).toMatch(/payments\.refund/);
      expect(err.message).toMatch(/staff\.manage/);
    }
  });
});
