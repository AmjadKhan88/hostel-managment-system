import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';

vi.mock('./email.service.js', () => ({
  sendEmail: vi.fn().mockResolvedValue({ sent: true }),
  isEmailConfigured: vi.fn(() => true),
}));

import { startTestDb, stopTestDb, clearTestDb } from '../test/setupTestDb.js';
import { User } from '../models/User.model.js';
import { sendEmail } from './email.service.js';
import { requestPasswordReset, resetPassword } from './auth.service.js';

beforeAll(startTestDb);
afterAll(stopTestDb);
afterEach(clearTestDb);
beforeEach(() => vi.clearAllMocks());

const EMAIL = 'staff@example.com';
const tick = () => new Promise((resolve) => setTimeout(resolve, 30));

async function makeUser(overrides = {}) {
  return User.create({
    name: 'Staff Member',
    email: EMAIL,
    passwordHash: await User.hashPassword('OldPassword123'),
    roleId: new mongoose.Types.ObjectId(),
    ...overrides,
  });
}

// The email is sent in the background, so wait for it to be called.
async function requestAndGetToken() {
  await requestPasswordReset(EMAIL);
  await vi.waitFor(() => expect(sendEmail).toHaveBeenCalled());
  return sendEmail.mock.calls.at(-1)[0].text.match(/token=([a-f0-9]{64})/)[1];
}

describe('staff password reset', () => {
  it('emails a reset link and stores only a hash of the token', async () => {
    await makeUser();
    const token = await requestAndGetToken();

    const doc = await User.findOne({ email: EMAIL }).select('+passwordResetTokenHash');
    expect(doc.passwordResetTokenHash).toHaveLength(64);
    expect(doc.passwordResetTokenHash).not.toBe(token);
  });

  it('resets the password, ends existing sessions, and the old password stops working', async () => {
    const user = await makeUser();
    const token = await requestAndGetToken();

    await resetPassword({ token, password: 'BrandNewPass456' });

    const after = await User.findById(user._id).select('+passwordHash');
    expect(await after.comparePassword('BrandNewPass456')).toBe(true);
    expect(await after.comparePassword('OldPassword123')).toBe(false);
    expect(after.tokenVersion).toBe(user.tokenVersion + 1);
  });

  it('makes a reset link single-use', async () => {
    await makeUser();
    const token = await requestAndGetToken();

    await resetPassword({ token, password: 'BrandNewPass456' });
    await expect(resetPassword({ token, password: 'AnotherPass789' })).rejects.toThrow(
      /invalid or has expired/i
    );
  });

  it('rejects an expired token', async () => {
    await makeUser();
    const token = await requestAndGetToken();
    await User.updateOne({ email: EMAIL }, { passwordResetExpiresAt: new Date(Date.now() - 1000) });

    await expect(resetPassword({ token, password: 'BrandNewPass456' })).rejects.toThrow(
      /invalid or has expired/i
    );
  });

  it('rejects a token that was never issued', async () => {
    await makeUser();
    await expect(
      resetPassword({ token: 'a'.repeat(64), password: 'BrandNewPass456' })
    ).rejects.toThrow(/invalid or has expired/i);
  });

  it('answers identically for an unknown email and sends nothing', async () => {
    await expect(requestPasswordReset('nobody@example.com')).resolves.toEqual({ requested: true });
    await tick();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('sends nothing to a suspended account, and refuses a reset for one', async () => {
    await makeUser({ status: 'suspended' });
    await expect(requestPasswordReset(EMAIL)).resolves.toEqual({ requested: true });
    await tick();
    expect(sendEmail).not.toHaveBeenCalled();

    // Even a link issued while the account was active stops working once suspended.
    await User.updateOne({ email: EMAIL }, { status: 'active' });
    const token = await requestAndGetToken();
    await User.updateOne({ email: EMAIL }, { status: 'suspended' });
    await expect(resetPassword({ token, password: 'BrandNewPass456' })).rejects.toThrow(
      /invalid or has expired/i
    );
  });

  it('sends at most one reset email per account per cooldown window', async () => {
    await makeUser();
    await requestPasswordReset(EMAIL);
    await requestPasswordReset(EMAIL);
    await vi.waitFor(() => expect(sendEmail).toHaveBeenCalled());
    await tick();

    expect(sendEmail).toHaveBeenCalledTimes(1);
  });
});
