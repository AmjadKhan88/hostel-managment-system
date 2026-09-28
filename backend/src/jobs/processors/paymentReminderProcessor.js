import { Invoice } from '../../models/Invoice.model.js';
import { ReminderDelivery } from '../../models/ReminderDelivery.model.js';
import { emitToHostel } from '../../events/socketEvents.js';
import { sendEmail, isEmailConfigured } from '../../services/email.service.js';
import { sendWhatsApp, isWhatsAppConfigured } from '../../services/whatsapp.service.js';
import { logger } from '../../config/logger.js';

const MAX_REMINDER_ROUNDS = 3;
const REMINDER_INTERVAL_DAYS = 3;
const MAX_ATTEMPTS_PER_CHANNEL = 3;
const STALE_PENDING_MS = 15 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function startOfUtcDay(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

// Calendar-day comparison, NOT elapsed milliseconds: comparing elapsed time
// let a 3-day interval slip to 4 days whenever a run started a few ms
// earlier than the previous one.
function calendarDaysBetween(earlier, later) {
  return Math.round((startOfUtcDay(later) - startOfUtcDay(earlier)) / DAY_MS);
}

/**
 * A round is "consumed" when at least one channel was confirmed sent, or is
 * `unknown` (the message may have left our system — counted conservatively
 * so we never risk a duplicate). Failed/skipped/pending never consume a
 * round, so an unconfigured or failing channel can't burn the reminder cap.
 */
export function summarizeRounds(deliveries) {
  let highestConsumedRound = 0;
  let lastConsumedAt = null;

  for (const d of deliveries) {
    if (d.status !== 'sent' && d.status !== 'unknown') continue;
    highestConsumedRound = Math.max(highestConsumedRound, d.round);
    const at = d.sentAt ?? d.lastAttemptAt;
    if (at && (!lastConsumedAt || at > lastConsumedAt)) lastConsumedAt = at;
  }

  return { highestConsumedRound, nextRound: highestConsumedRound + 1, lastConsumedAt };
}

function checkResidentReminderDue(rounds, now) {
  if (rounds.nextRound > MAX_REMINDER_ROUNDS)
    return { due: false, reason: 'max_reminders_reached' };
  if (
    rounds.lastConsumedAt &&
    calendarDaysBetween(rounds.lastConsumedAt, now) < REMINDER_INTERVAL_DAYS
  ) {
    return { due: false, reason: 'waiting_interval' };
  }
  return { due: true };
}

function newRunSummary() {
  const channel = () => ({ sent: 0, failed: 0, skipped: 0, alreadyHandled: 0 });
  return {
    overdueInvoices: 0,
    invoicesAttempted: 0,
    invoicesWithNoDelivery: 0,
    staleMarkedUnknown: 0,
    staffNotified: 0,
    staffThrottled: 0,
    invoiceErrors: 0,
    channels: { email: channel(), whatsapp: channel() },
  };
}

/**
 * A claim left `pending` by a worker that died mid-send can't tell us
 * whether the provider accepted the message. Retrying risks a duplicate, so
 * it becomes `unknown` and is never retried automatically.
 */
async function markStalePendingAsUnknown(now) {
  const result = await ReminderDelivery.updateMany(
    { status: 'pending', lastAttemptAt: { $lt: new Date(now.getTime() - STALE_PENDING_MS) } },
    {
      $set: {
        status: 'unknown',
        detail:
          'Worker stopped before the send result was recorded; delivery could not be confirmed. Not retried automatically to avoid a duplicate message.',
      },
    }
  );
  return result.modifiedCount;
}

/**
 * Claim BEFORE sending. Returns the claimed record, or null when this
 * (invoice, round, channel) must not be sent now — already sent, in flight,
 * unknown, or out of attempts. The unique index makes two concurrent runs
 * (or a BullMQ retry) unable to both claim the same slot.
 */
async function claimDelivery({ invoice, resident, round, channel, now }) {
  const retried = await ReminderDelivery.findOneAndUpdate(
    {
      invoiceId: invoice._id,
      round,
      channel,
      status: 'failed',
      attempts: { $lt: MAX_ATTEMPTS_PER_CHANNEL },
    },
    { $set: { status: 'pending', lastAttemptAt: now }, $inc: { attempts: 1 } },
    { new: true }
  );
  if (retried) return retried;

  try {
    return await ReminderDelivery.create({
      hostelId: invoice.hostelId,
      invoiceId: invoice._id,
      residentId: resident._id,
      round,
      channel,
      status: 'pending',
      attempts: 1,
      lastAttemptAt: now,
    });
  } catch (err) {
    if (err?.code === 11000) return null;
    throw err;
  }
}

async function deliverOnChannel({ invoice, resident, round, now, plan }) {
  // Not attempts, so they are never recorded as one and never consume a round.
  if (!plan.configured) return { status: 'skipped', detail: 'not_configured' };
  if (!plan.recipient) return { status: 'skipped', detail: 'no_recipient' };

  const claim = await claimDelivery({ invoice, resident, round, channel: plan.channel, now });
  if (!claim) {
    return {
      status: 'already_handled',
      detail: 'delivery record already exists for this round — not resent',
    };
  }

  let outcome;
  try {
    outcome = await plan.send();
  } catch (err) {
    outcome = { sent: false, reason: 'send_failed', error: err.message };
  }

  if (outcome.sent) {
    // If THIS write fails, the record stays `pending` — a retry can't
    // re-claim it, which is exactly what prevents the duplicate.
    await ReminderDelivery.updateOne(
      { _id: claim._id },
      { $set: { status: 'sent', sentAt: new Date(), detail: '' } }
    );
    return { status: 'sent' };
  }

  const detail = String(outcome.error ?? outcome.reason ?? 'unknown_error').slice(0, 300);
  await ReminderDelivery.updateOne({ _id: claim._id }, { $set: { status: 'failed', detail } });
  return { status: 'failed', detail };
}

function tally(summary, channel, status) {
  const key = status === 'already_handled' ? 'alreadyHandled' : status;
  summary.channels[channel][key] += 1;
}

async function attemptResidentReminder({ invoice, resident, round, daysOverdue, now, summary }) {
  const balance = ((invoice.totalMinorUnits - invoice.paidMinorUnits) / 100).toFixed(2);
  const messageText = `Hi ${resident.name}, invoice ${invoice.invoiceNumber} for ${balance} is ${daysOverdue} day(s) overdue. Please arrange payment at your earliest convenience.`;

  const plans = [
    {
      channel: 'email',
      configured: isEmailConfigured(),
      recipient: resident.email,
      send: () =>
        sendEmail({
          to: resident.email,
          subject: `Payment reminder — Invoice ${invoice.invoiceNumber}`,
          text: messageText,
        }),
    },
    {
      channel: 'whatsapp',
      configured: isWhatsAppConfigured(),
      recipient: resident.phone,
      send: () => sendWhatsApp({ to: resident.phone, body: messageText }),
    },
  ];

  const entries = await Promise.all(
    plans.map(async (plan) => {
      const result = await deliverOnChannel({ invoice, resident, round, now, plan });
      tally(summary, plan.channel, result.status);
      return [plan.channel, result];
    })
  );
  return Object.fromEntries(entries);
}

// Idempotent: writes computed values (never $inc), so a lost update heals
// itself on the next run. Deliberately not invoice.save() — that could
// overwrite the throttle field below with a stale copy.
async function syncReminderSummary(invoice, rounds, sentNow) {
  const highest = sentNow ? sentNow.round : rounds.highestConsumedRound;
  const lastAt = sentNow ? sentNow.at : rounds.lastConsumedAt;

  const sameCount = (invoice.reminderCount ?? 0) === highest;
  const sameAt = (invoice.lastReminderAt?.getTime() ?? null) === (lastAt?.getTime() ?? null);
  if (sameCount && sameAt) return;

  await Invoice.updateOne(
    { _id: invoice._id },
    { $set: { reminderCount: highest, lastReminderAt: lastAt ?? null } }
  );
}

/**
 * Staff are notified at most once per reminder interval per invoice. The
 * claim is one atomic conditional update, so a retried job can't emit twice.
 */
async function notifyStaffIfDue({ invoice, resident, daysOverdue, now, reminder, summary }) {
  // Due when >= INTERVAL calendar days since the last notification.
  const threshold = new Date(startOfUtcDay(now).getTime() - (REMINDER_INTERVAL_DAYS - 1) * DAY_MS);

  const claimed = await Invoice.findOneAndUpdate(
    {
      _id: invoice._id,
      $or: [
        { lastStaffOverdueNotifiedAt: null },
        { lastStaffOverdueNotifiedAt: { $lt: threshold } },
      ],
    },
    { $set: { lastStaffOverdueNotifiedAt: now } },
    { new: false, projection: { _id: 1 } }
  );

  if (!claimed) {
    summary.staffThrottled += 1;
    return;
  }

  emitToHostel(invoice.hostelId.toString(), 'payment:overdue', {
    invoiceId: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    residentName: resident?.name ?? 'Unknown',
    daysOverdue,
    balanceMinorUnits: invoice.totalMinorUnits - invoice.paidMinorUnits,
    reminder,
  });
  summary.staffNotified += 1;
}

async function processInvoice({ invoice, deliveries, now, summary }) {
  const resident = invoice.residentId;
  const daysOverdue = Math.floor((now - invoice.dueDate) / DAY_MS);
  const rounds = summarizeRounds(deliveries);

  let state;
  let attemptedRound = null;
  let channelResults = null;
  let sentThisRun = false;

  if (!resident) {
    state = 'no_resident';
  } else {
    const dueCheck = checkResidentReminderDue(rounds, now);
    if (!dueCheck.due) {
      state = dueCheck.reason;
    } else {
      attemptedRound = rounds.nextRound;
      summary.invoicesAttempted += 1;
      channelResults = await attemptResidentReminder({
        invoice,
        resident,
        round: attemptedRound,
        daysOverdue,
        now,
        summary,
      });
      sentThisRun = Object.values(channelResults).some((r) => r.status === 'sent');
      state = sentThisRun ? 'sent' : 'not_delivered';
      if (!sentThisRun) summary.invoicesWithNoDelivery += 1;
    }
  }

  await syncReminderSummary(
    invoice,
    rounds,
    sentThisRun ? { round: attemptedRound, at: now } : null
  );

  await notifyStaffIfDue({
    invoice,
    resident,
    daysOverdue,
    now,
    summary,
    reminder: {
      state, // sent | not_delivered | waiting_interval | max_reminders_reached | no_resident
      round: attemptedRound,
      roundsCompleted: sentThisRun ? attemptedRound : rounds.highestConsumedRound,
      maxRounds: MAX_REMINDER_ROUNDS,
      channels: channelResults,
    },
  });
}

/**
 * Email reminders for overdue invoices. WhatsApp is deliberately manual;
 * staff can open a prepared wa.me message from the invoice page.
 *
 * Safe to retry or run twice: every send is claimed first through a unique
 * (invoice, round, channel) record, so at most one message is ever sent per
 * channel per round. If any invoice errors, the run still processes the
 * rest, then throws so BullMQ records the failure and retries.
 */
export async function sendPaymentReminders() {
  const now = new Date();
  const summary = newRunSummary();

  summary.staleMarkedUnknown = await markStalePendingAsUnknown(now);

  const overdueInvoices = await Invoice.find({
    status: { $in: ['issued', 'partially_paid'] },
    dueDate: { $lt: now },
  }).populate('residentId', 'name email phone');
  summary.overdueInvoices = overdueInvoices.length;

  const allDeliveries = await ReminderDelivery.find({
    invoiceId: { $in: overdueInvoices.map((i) => i._id) },
  });
  const deliveriesByInvoice = new Map();
  for (const d of allDeliveries) {
    const key = d.invoiceId.toString();
    if (!deliveriesByInvoice.has(key)) deliveriesByInvoice.set(key, []);
    deliveriesByInvoice.get(key).push(d);
  }

  const errors = [];
  for (const invoice of overdueInvoices) {
    try {
      await processInvoice({
        invoice,
        deliveries: deliveriesByInvoice.get(invoice._id.toString()) ?? [],
        now,
        summary,
      });
    } catch (err) {
      summary.invoiceErrors += 1;
      errors.push({ invoiceId: invoice._id.toString(), message: err.message });
      logger.error({ err, invoiceId: invoice._id }, 'Payment reminder failed for invoice');
    }
  }

  logger.info(summary, 'Payment reminder run complete');

  if (errors.length > 0) {
    throw new Error(
      `Payment reminder run finished with ${errors.length} invoice error(s); first: ${errors[0].message}`
    );
  }

  return summary; // stored as the BullMQ job's return value → visible in job monitoring
}
