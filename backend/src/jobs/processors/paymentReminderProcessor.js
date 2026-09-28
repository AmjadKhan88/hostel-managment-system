import { Invoice } from '../../models/Invoice.model.js';
import { emitToHostel } from '../../events/socketEvents.js';
import { sendEmail } from '../../services/email.service.js';
import { sendWhatsApp } from '../../services/whatsapp.service.js';
import { logger } from '../../config/logger.js';

const MAX_REMINDERS = 3;
const REMINDER_INTERVAL_DAYS = 3;

function shouldSendReminder(invoice, now) {
  if ((invoice.reminderCount ?? 0) >= MAX_REMINDERS) return false;
  if (!invoice.lastReminderAt) return true;
  const daysSinceLastReminder = Math.floor((now - invoice.lastReminderAt) / (1000 * 60 * 60 * 24));
  return daysSinceLastReminder >= REMINDER_INTERVAL_DAYS;
}

/**
 * Sends real email + WhatsApp payment reminders for overdue invoices, on
 * top of the existing in-app socket notification to staff (unchanged from
 * Day 35). Capped at 3 reminders per invoice, spaced at least 3 days
 * apart — tracked via Invoice.reminderCount/lastReminderAt, so a retried
 * or re-run job can never double-send the same reminder. If email/WhatsApp
 * aren't configured, this still runs fine — sendEmail/sendWhatsApp log a
 * warning and return { sent: false } rather than throwing.
 */
export async function sendPaymentReminders() {
  const now = new Date();
  const overdueInvoices = await Invoice.find({
    status: { $in: ['issued', 'partially_paid'] },
    dueDate: { $lt: now },
  }).populate('residentId', 'name email phone');

  let notified = 0;
  let emailsSent = 0;
  let whatsappSent = 0;

  for (const invoice of overdueInvoices) {
    const hostelId = invoice.hostelId.toString();
    const daysOverdue = Math.floor((now - invoice.dueDate) / (1000 * 60 * 60 * 24));
    const resident = invoice.residentId;

    // Staff in-app notification — unchanged from Day 35.
    emitToHostel(hostelId, 'payment:overdue', {
      invoiceId: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      residentName: resident?.name ?? 'Unknown',
      daysOverdue,
      balanceMinorUnits: invoice.totalMinorUnits - invoice.paidMinorUnits,
    });
    notified += 1;

    if (!resident || !shouldSendReminder(invoice, now)) continue;

    const balance = (invoice.totalMinorUnits - invoice.paidMinorUnits) / 100;
    const messageText = `Hi ${resident.name}, invoice ${invoice.invoiceNumber} for ${balance.toFixed(
      2
    )} is ${daysOverdue} day(s) overdue. Please arrange payment at your earliest convenience.`;

    const [emailResult, whatsappResult] = await Promise.all([
      resident.email
        ? sendEmail({
            to: resident.email,
            subject: `Payment reminder — Invoice ${invoice.invoiceNumber}`,
            text: messageText,
          })
        : Promise.resolve({ sent: false, reason: 'no_email_on_file' }),
      sendWhatsApp({ to: resident.phone, body: messageText }),
    ]);

    if (emailResult.sent) emailsSent += 1;
    if (whatsappResult.sent) whatsappSent += 1;

    invoice.reminderCount = (invoice.reminderCount ?? 0) + 1;
    invoice.lastReminderAt = now;
    await invoice.save();

    logger.info(
      { invoiceId: invoice._id, emailSent: emailResult.sent, whatsappSent: whatsappResult.sent },
      'Payment reminder sent'
    );
  }

  logger.info({ notified, emailsSent, whatsappSent }, 'Payment reminder run complete');
  return { notified, emailsSent, whatsappSent };
}
