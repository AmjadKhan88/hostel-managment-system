import { Invoice } from '../../models/Invoice.model.js';
import { emitToHostel } from '../../events/socketEvents.js';
import { logger } from '../../config/logger.js';

/**
 * No email/SMS provider is configured yet, so "sending a reminder" today
 * means a real-time in-app notification to hostel staff (via Day 29/30's
 * Socket.IO layer) — genuinely functional, just not an external message
 * to the resident. Wiring an actual provider (Twilio/SendGrid) is a
 * future integration day, not represented here as done.
 */
export async function sendPaymentReminders() {
  const now = new Date();
  const overdueInvoices = await Invoice.find({
    status: { $in: ['issued', 'partially_paid'] },
    dueDate: { $lt: now },
  }).populate('residentId', 'name');

  let notified = 0;

  for (const invoice of overdueInvoices) {
    const daysOverdue = Math.floor((now - invoice.dueDate) / (1000 * 60 * 60 * 24));

    emitToHostel(invoice.hostelId.toString(), 'payment:overdue', {
      invoiceId: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      residentName: invoice.residentId?.name ?? 'Unknown',
      daysOverdue,
      balanceMinorUnits: invoice.totalMinorUnits - invoice.paidMinorUnits,
    });

    notified += 1;
  }

  if (notified > 0) {
    logger.info({ notified }, 'Payment reminder run complete');
  }

  return { notified };
}