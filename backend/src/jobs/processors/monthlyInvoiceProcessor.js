import { Hostel } from '../../models/Hostel.model.js';
import { FeeStructure } from '../../models/FeeStructure.model.js';
import { Resident } from '../../models/Resident.model.js';
import { Bed } from '../../models/Bed.model.js';
import { Room } from '../../models/Room.model.js';
import { Invoice } from '../../models/Invoice.model.js';
import { getNextSequence } from '../../models/Counter.model.js';
import { recordAuditLog } from '../../services/audit.service.js';
import { emitToHostel, emitToResident } from '../../events/socketEvents.js';
import { logger } from '../../config/logger.js';
import { isValidTimeZone, getLocalMonthKey } from '../../utils/timezone.js';

/**
 * Resolves each active resident's current room category via their bed, in
 * two batched queries — not one query per resident per fee structure.
 * Residents with no currentBedId map to `null` and are handled explicitly
 * by the caller (see generateMonthlyInvoices): they still get every
 * hostel-wide fee, just not category-scoped ones.
 */
async function buildResidentCategoryMap(residents) {
  const bedIds = residents.map((r) => r.currentBedId).filter(Boolean);
  if (bedIds.length === 0) return new Map();

  const beds = await Bed.find({ _id: { $in: bedIds } }).select('roomId');
  const bedIdToRoomId = new Map(beds.map((b) => [b._id.toString(), b.roomId.toString()]));

  const roomIds = [...new Set(beds.map((b) => b.roomId.toString()))];
  const rooms = await Room.find({ _id: { $in: roomIds } }).select('category');
  const roomIdToCategory = new Map(rooms.map((r) => [r._id.toString(), r.category]));

  const residentIdToCategory = new Map();
  for (const resident of residents) {
    if (!resident.currentBedId) continue;
    const roomId = bedIdToRoomId.get(resident.currentBedId.toString());
    const category = roomId ? roomIdToCategory.get(roomId) : null;
    if (category) residentIdToCategory.set(resident._id.toString(), category);
  }
  return residentIdToCategory;
}

/**
 * Generates this month's rent invoice for every active resident of ONE
 * hostel, applying category-scoped fee structures only to residents whose
 * current room actually matches that category. A fee with no roomCategory
 * applies to everyone regardless of bed status. Scoped by hostelId because
 * each hostel's scheduler fires in that hostel's own local time
 * (jobs/queues.js), and "this month" is evaluated in that same local time.
 */
export async function generateMonthlyInvoices({ hostelId } = {}) {
  if (!hostelId) throw new Error('generateMonthlyInvoices requires a hostelId');

  const hostel = await Hostel.findById(hostelId);
  if (!hostel || !hostel.isActive) {
    logger.warn({ hostelId }, 'generateMonthlyInvoices: hostel not found or inactive, skipping');
    return { created: 0, skipped: 0, skippedNoBedForCategoryFee: 0 };
  }

  const timezone = isValidTimeZone(hostel.timezone) ? hostel.timezone : 'UTC';
  if (timezone !== hostel.timezone) {
    logger.warn(
      { hostelId, timezone: hostel.timezone },
      'Invalid hostel timezone, falling back to UTC'
    );
  }

  const now = new Date();
  const monthKey = getLocalMonthKey(timezone, now); // e.g. "2026-09" in the hostel's own time

  let created = 0;
  let skipped = 0;
  let skippedNoBedForCategoryFee = 0;

  const feeStructures = await FeeStructure.find({
    hostelId: hostel._id,
    billingCycle: 'monthly',
    isActive: true,
  });

  if (feeStructures.length > 0) {
    const residents = await Resident.find({ hostelId: hostel._id, status: 'active' });
    const residentCategories = await buildResidentCategoryMap(residents);

    for (const resident of residents) {
      const residentCategory = residentCategories.get(resident._id.toString()) ?? null;

      for (const fee of feeStructures) {
        if (fee.roomCategory) {
          // Category-scoped fee, but we don't know this resident's room —
          // explicitly skipped, not silently applied and not an error.
          if (!resident.currentBedId) {
            skippedNoBedForCategoryFee += 1;
            continue;
          }
          // Has a bed, but it's not in the matching category — not
          // applicable to this resident, nothing to log.
          if (residentCategory !== fee.roomCategory) continue;
        }

        const idempotencyKey = `monthly:${resident._id}:${fee._id}:${monthKey}`;
        const existing = await Invoice.findOne({ hostelId: hostel._id, idempotencyKey });
        if (existing) {
          skipped += 1;
          continue;
        }

        const seq = await getNextSequence(`invoice:${hostel._id}`);
        const prefix = hostel.invoicePrefix || 'INV';
        const invoiceNumber = `${prefix}-${monthKey.split('-')[0]}-${String(seq).padStart(6, '0')}`;

        const dueDate = new Date(now);
        dueDate.setDate(dueDate.getDate() + (hostel.defaultDueDays ?? 7));

        try {
          const invoice = await Invoice.create({
            hostelId: hostel._id,
            residentId: resident._id,
            invoiceNumber,
            idempotencyKey,
            items: [
              {
                description: `${fee.name} — ${monthKey}`,
                feeType: fee.feeType,
                amountMinorUnits: fee.amountMinorUnits,
              },
            ],
            totalMinorUnits: fee.amountMinorUnits,
            dueDate,
          });

          created += 1;

          recordAuditLog({
            hostelId: hostel._id.toString(),
            actorId: null,
            actorName: 'system:automation',
            action: 'invoice.generated',
            entityType: 'Invoice',
            entityId: invoice._id,
            metadata: {
              invoiceNumber,
              totalMinorUnits: invoice.totalMinorUnits,
              automated: true,
              monthKey,
              timezone,
              roomCategory: fee.roomCategory ?? null,
            },
          });

          emitToHostel(hostel._id.toString(), 'invoice:generated', {
            invoiceId: invoice._id,
            invoiceNumber,
            residentId: resident._id,
          });

          emitToResident(resident._id, 'invoice:generated', {
            invoiceId: invoice._id,
            invoiceNumber,
            totalMinorUnits: invoice.totalMinorUnits,
          });
        } catch (err) {
          if (err?.code === 11000) {
            skipped += 1;
            continue;
          }
          logger.error({ err, residentId: resident._id }, 'Failed to generate monthly invoice');
        }
      }
    }
  }

  if (skippedNoBedForCategoryFee > 0) {
    logger.warn(
      { hostelId, skippedNoBedForCategoryFee },
      'Some active residents have no current bed — category-scoped fees were not applied for them this run'
    );
  }

  logger.info(
    { hostelId, created, skipped, skippedNoBedForCategoryFee, monthKey, timezone },
    'Monthly invoice generation run complete'
  );
  return { created, skipped, skippedNoBedForCategoryFee };
}
