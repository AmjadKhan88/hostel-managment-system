import { Hostel } from '../../models/Hostel.model.js';
import { FeeStructure } from '../../models/FeeStructure.model.js';
import { Resident } from '../../models/Resident.model.js';
import { Invoice } from '../../models/Invoice.model.js';
import { getNextSequence } from '../../models/Counter.model.js';
import { recordAuditLog } from '../../services/audit.service.js';
import { emitToHostel } from '../../events/socketEvents.js';
import { logger } from '../../config/logger.js';
import { isValidTimeZone, getLocalMonthKey } from '../../utils/timezone.js';

/**
 * Generates this month's rent invoice for every active resident of ONE
 * hostel. Scoped by hostelId because each hostel's scheduler now fires in
 * that hostel's own local time (jobs/queues.js), and "this month" must be
 * evaluated in that SAME local time — otherwise a hostel a few hours behind
 * UTC could get billed for next month a few hours early, or one ahead of
 * UTC could miss a day, right around midnight on the 1st.
 */
export async function generateMonthlyInvoices({ hostelId } = {}) {
  if (!hostelId) throw new Error('generateMonthlyInvoices requires a hostelId');

  const hostel = await Hostel.findById(hostelId);
  if (!hostel || !hostel.isActive) {
    logger.warn({ hostelId }, 'generateMonthlyInvoices: hostel not found or inactive, skipping');
    return { created: 0, skipped: 0 };
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

  const feeStructures = await FeeStructure.find({
    hostelId: hostel._id,
    billingCycle: 'monthly',
    isActive: true,
  });

  if (feeStructures.length > 0) {
    const residents = await Resident.find({ hostelId: hostel._id, status: 'active' });

    for (const resident of residents) {
      for (const fee of feeStructures) {
        // Room-category-specific fee structures are skipped for now — see
        // the Day 22-era note; unrelated to this timezone fix.
        if (fee.roomCategory) continue;

        const idempotencyKey = `monthly:${resident._id}:${fee._id}:${monthKey}`;
        const existing = await Invoice.findOne({ hostelId: hostel._id, idempotencyKey });
        if (existing) {
          skipped += 1;
          continue;
        }

        const seq = await getNextSequence(`invoice:${hostel._id}`);
        const prefix = hostel.invoicePrefix || 'INV';
        // Year comes from the hostel-local monthKey, not now.getFullYear()
        // (which reflects the server process's own timezone) — matters for
        // the same midnight-boundary reason as the month itself.
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
            },
          });

          emitToHostel(hostel._id.toString(), 'invoice:generated', {
            invoiceId: invoice._id,
            invoiceNumber,
            residentId: resident._id,
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

  logger.info(
    { hostelId, created, skipped, monthKey, timezone },
    'Monthly invoice generation run complete'
  );
  return { created, skipped };
}
