import { Hostel } from '../../models/Hostel.model.js';
import { FeeStructure } from '../../models/FeeStructure.model.js';
import { Resident } from '../../models/Resident.model.js';
import { Invoice } from '../../models/Invoice.model.js';
import { getNextSequence } from '../../models/Counter.model.js';
import { recordAuditLog } from '../../services/audit.service.js';
import { emitToHostel } from '../../events/socketEvents.js';
import { logger } from '../../config/logger.js';

/**
 * Generates this month's rent invoice for every active resident, one per
 * (resident, monthly fee structure, month). The idempotencyKey is what
 * guarantees a retried or re-run job never creates a duplicate charge —
 * the Invoice model's unique index rejects the second attempt outright.
 */
export async function generateMonthlyInvoices() {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const hostels = await Hostel.find({ isActive: true });
  let created = 0;
  let skipped = 0;

  for (const hostel of hostels) {
    const feeStructures = await FeeStructure.find({
      hostelId: hostel._id,
      billingCycle: 'monthly',
      isActive: true,
    });
    if (feeStructures.length === 0) continue;

    const residents = await Resident.find({ hostelId: hostel._id, status: 'active' });

    for (const resident of residents) {
      for (const fee of feeStructures) {
        // Room-category-specific fee structures are skipped for now —
        // Resident doesn't denormalize its current room's category, so
        // only hostel-wide ("applies to all") fee structures are safely
        // matchable here. Category-aware matching is a natural follow-up.
        if (fee.roomCategory) continue;

        const idempotencyKey = `monthly:${resident._id}:${fee._id}:${monthKey}`;
        const existing = await Invoice.findOne({ hostelId: hostel._id, idempotencyKey });
        if (existing) {
          skipped += 1;
          continue;
        }

        const seq = await getNextSequence(`invoice:${hostel._id}`);
        const prefix = hostel.invoicePrefix || 'INV';
        const invoiceNumber = `${prefix}-${now.getFullYear()}-${String(seq).padStart(6, '0')}`;

        const dueDate = new Date(now);
        dueDate.setDate(dueDate.getDate() + (hostel.defaultDueDays ?? 7));

        try {
          const invoice = await Invoice.create({
            hostelId: hostel._id,
            residentId: resident._id,
            invoiceNumber,
            idempotencyKey,
            items: [
              { description: `${fee.name} — ${monthKey}`, feeType: fee.feeType, amountMinorUnits: fee.amountMinorUnits },
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
            metadata: { invoiceNumber, totalMinorUnits: invoice.totalMinorUnits, automated: true },
          });

          emitToHostel(hostel._id.toString(), 'invoice:generated', {
            invoiceId: invoice._id,
            invoiceNumber,
            residentId: resident._id,
          });
        } catch (err) {
          if (err?.code === 11000) {
            // Race with another run hitting the same idempotency key —
            // exactly the duplicate-charge scenario the key prevents.
            skipped += 1;
            continue;
          }
          logger.error({ err, residentId: resident._id }, 'Failed to generate monthly invoice');
        }
      }
    }
  }

  logger.info({ created, skipped, monthKey }, 'Monthly invoice generation run complete');
  return { created, skipped };
}