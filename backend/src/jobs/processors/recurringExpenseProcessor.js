import mongoose from 'mongoose';
import { Hostel } from '../../models/Hostel.model.js';
import { Expense } from '../../models/Expense.model.js';
import { recordAuditLog } from '../../services/audit.service.js';
import { emitToHostel } from '../../events/socketEvents.js';
import { logger } from '../../config/logger.js';
import { isValidTimeZone, getLocalMonthKey } from '../../utils/timezone.js';

/**
 * For every series of expenses (grouped by seriesId) whose MOST RECENT
 * instance is still marked recurrence: 'monthly', generates this month's
 * instance — copying title/category/amount from that most recent
 * instance. Editing the latest instance's amount changes what future
 * months copy; setting its recurrence back to 'one_time' stops generation
 * entirely. Scoped by hostelId for the same timezone reason as
 * monthlyInvoiceProcessor.js: "this month" is evaluated in the hostel's
 * own local time.
 */
export async function generateRecurringExpenses({ hostelId } = {}) {
  if (!hostelId) throw new Error('generateRecurringExpenses requires a hostelId');

  const hostel = await Hostel.findById(hostelId);
  if (!hostel || !hostel.isActive) {
    logger.warn({ hostelId }, 'generateRecurringExpenses: hostel not found or inactive, skipping');
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
  const monthKey = getLocalMonthKey(timezone, now);
  const hostelObjectId = new mongoose.Types.ObjectId(hostelId);

  const latestPerSeries = await Expense.aggregate([
    { $match: { hostelId: hostelObjectId, seriesId: { $ne: null } } },
    { $sort: { incurredAt: -1 } },
    { $group: { _id: '$seriesId', latest: { $first: '$$ROOT' } } },
  ]);
  const recurringTemplates = latestPerSeries
    .map((r) => r.latest)
    .filter((e) => e.recurrence === 'monthly');

  let created = 0;
  let skipped = 0;

  for (const template of recurringTemplates) {
    const seriesId = template.seriesId.toString();

    // Don't regenerate the same month the template itself already covers —
    // e.g. a user creating "September salaries" today shouldn't immediately
    // spawn a duplicate "September salaries" instance on this run.
    const templateMonthKey = getLocalMonthKey(timezone, template.incurredAt);
    if (templateMonthKey === monthKey) {
      skipped += 1;
      continue;
    }

    const idempotencyKey = `monthly-expense:${seriesId}:${monthKey}`;
    const existing = await Expense.findOne({ hostelId, idempotencyKey });
    if (existing) {
      skipped += 1;
      continue;
    }

    try {
      const expense = await Expense.create({
        hostelId,
        title: template.title,
        category: template.category,
        amountMinorUnits: template.amountMinorUnits,
        recurrence: 'monthly',
        seriesId: template.seriesId,
        idempotencyKey,
        incurredAt: now,
        notes: template.notes,
        recordedBy: null,
      });

      created += 1;

      recordAuditLog({
        hostelId,
        actorId: null,
        actorName: 'system:automation',
        action: 'expense.recorded',
        entityType: 'Expense',
        entityId: expense._id,
        metadata: {
          title: expense.title,
          amountMinorUnits: expense.amountMinorUnits,
          automated: true,
          monthKey,
        },
      });

      emitToHostel(hostelId, 'expense:generated', {
        expenseId: expense._id,
        title: expense.title,
        amountMinorUnits: expense.amountMinorUnits,
      });
    } catch (err) {
      if (err?.code === 11000) {
        skipped += 1;
        continue;
      }
      logger.error({ err, seriesId }, 'Failed to generate recurring expense');
    }
  }

  logger.info(
    { hostelId, created, skipped, monthKey, timezone },
    'Recurring expense generation run complete'
  );
  return { created, skipped };
}
