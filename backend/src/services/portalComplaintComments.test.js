import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { startTestDb, stopTestDb, clearTestDb } from '../test/setupTestDb.js';
import { Hostel } from '../models/Hostel.model.js';
import { Resident } from '../models/Resident.model.js';
import { Complaint } from '../models/Complaint.model.js';
import { addMyComplaintComment } from './portal.service.js';

beforeAll(startTestDb);
afterAll(stopTestDb);
afterEach(clearTestDb);

async function setup(status = 'open') {
  const hostel = await Hostel.create({ name: 'Hostel A', slug: 'hostel-a' });
  const makeResident = (n) =>
    Resident.create({
      hostelId: hostel._id,
      name: `Resident ${n}`,
      phone: `+92000000${n}`,
      registrationNumber: `REG-${n}`,
      guardian: { name: 'Guardian', phone: '+920000099' },
    });
  const owner = await makeResident(1);
  const other = await makeResident(2);
  const complaint = await Complaint.create({
    hostelId: hostel._id,
    residentId: owner._id,
    subject: 'Leak',
    description: 'The tap is leaking badly',
    category: 'plumbing',
    status,
  });
  const auth = (resident) => ({ id: resident._id.toString(), hostelId: hostel._id.toString() });
  return { owner, other, complaint, auth };
}

describe('resident complaint comments', () => {
  it('lets a resident comment on their own complaint, recorded as theirs and not staff', async () => {
    const { owner, complaint, auth } = await setup();

    const updated = await addMyComplaintComment(
      auth(owner),
      complaint._id,
      'Still leaking this morning'
    );

    expect(updated.comments).toHaveLength(1);
    expect(updated.comments[0].text).toBe('Still leaking this morning');
    expect(String(updated.comments[0].residentId)).toBe(owner._id.toString());
    expect(updated.comments[0].authorId).toBeNull();
  });

  it("refuses commenting on another resident's complaint, as a plain not-found", async () => {
    const { other, complaint, auth } = await setup();
    await expect(addMyComplaintComment(auth(other), complaint._id, 'hello')).rejects.toThrow(
      /not found/i
    );
  });

  it('refuses comments on a closed complaint', async () => {
    const { owner, complaint, auth } = await setup('closed');
    await expect(addMyComplaintComment(auth(owner), complaint._id, 'hello')).rejects.toThrow(
      /closed/i
    );
  });

  it('still allows a reply on a resolved complaint', async () => {
    const { owner, complaint, auth } = await setup('resolved');
    await expect(
      addMyComplaintComment(auth(owner), complaint._id, 'Not actually fixed')
    ).resolves.toBeDefined();
  });

  it('rejects a comment that has no author at all', async () => {
    const { owner } = await setup();
    await expect(
      Complaint.create({
        hostelId: owner.hostelId,
        subject: 'Orphan',
        description: 'A complaint with an anonymous comment',
        category: 'other',
        comments: [{ text: 'who wrote this?' }],
      })
    ).rejects.toThrow(/needs an author/i);
  });
});
