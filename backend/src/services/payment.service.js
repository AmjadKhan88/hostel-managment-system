import { Payment } from '../models/Payment.model.js';
import { Invoice } from '../models/Invoice.model.js';
import { getNextSequence } from '../models/Counter.model.js';
import { ApiError } from '../utils/ApiError.js';
import { resolveHostelScope } from '../utils/hostelScope.js';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination.js';

function computeInvoiceStatus(totalMinorUnits, paidMinorUnits) {
  if (paidMinorUnits <= 0) return 'issued';
  if (paidMinorUnits >= totalMinorUnits) return 'paid';
  return 'partially_paid';
}

async function loadInvoiceForHostel(user, invoiceId) {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) throw ApiError.notFound('Invoice not found');
  const hostelId = resolveHostelScope(user, invoice.hostelId.toString());
  return { invoice, hostelId };
}

/**
 * NOTE: no multi-document transactions in this environment (standalone
 * MongoDB — see docs/ARCHITECTURE.md). The payment is written first, then
 * the invoice is updated; if the invoice update fails, the payment is
 * rolled back (best-effort). This mirrors allocation.service.js's pattern.
 */
export async function recordPayment(user, data) {
  const { invoice, hostelId } = await loadInvoiceForHostel(user, data.invoiceId);

  if (invoice.status === 'void') {
    throw ApiError.badRequest('Cannot record a payment against a voided invoice');
  }

  const balance = invoice.totalMinorUnits - invoice.paidMinorUnits;
  if (data.amountMinorUnits > balance) {
    throw ApiError.badRequest(`Payment amount exceeds the outstanding balance (${balance} minor units remaining)`);
  }

  const seq = await getNextSequence(`payment:${hostelId}`);
  const receiptNumber = `RCPT-${new Date().getFullYear()}-${String(seq).padStart(6, '0')}`;

  const payment = await Payment.create({
    hostelId,
    invoiceId: invoice._id,
    residentId: invoice.residentId,
    receiptNumber,
    amountMinorUnits: data.amountMinorUnits,
    method: data.method,
    notes: data.notes,
    recordedBy: user.id,
  });

  try {
    invoice.paidMinorUnits += data.amountMinorUnits;
    invoice.status = computeInvoiceStatus(invoice.totalMinorUnits, invoice.paidMinorUnits);
    await invoice.save();
  } catch (err) {
    await Payment.findByIdAndDelete(payment._id).catch(() => {});
    throw err;
  }

  return payment;
}

export async function refundPayment(user, id, { reason }) {
  const payment = await Payment.findById(id);
  if (!payment) throw ApiError.notFound('Payment not found');
  resolveHostelScope(user, payment.hostelId.toString());

  if (payment.status === 'refunded') {
    throw ApiError.conflict('This payment has already been refunded');
  }

  const invoice = await Invoice.findById(payment.invoiceId);
  if (!invoice) throw ApiError.internal('Payment references an invoice that no longer exists');

  const previousInvoiceState = { paidMinorUnits: invoice.paidMinorUnits, status: invoice.status };

  invoice.paidMinorUnits = Math.max(0, invoice.paidMinorUnits - payment.amountMinorUnits);
  invoice.status = computeInvoiceStatus(invoice.totalMinorUnits, invoice.paidMinorUnits);
  await invoice.save();

  try {
    payment.status = 'refunded';
    payment.refundedAt = new Date();
    payment.refundedBy = user.id;
    payment.refundReason = reason ?? '';
    await payment.save();
  } catch (err) {
    // Roll back the invoice change since the payment update failed.
    invoice.paidMinorUnits = previousInvoiceState.paidMinorUnits;
    invoice.status = previousInvoiceState.status;
    await invoice.save().catch(() => {});
    throw err;
  }

  return payment;
}

export async function listPayments(user, query) {
  const hostelId = resolveHostelScope(user, query.hostelId);
  const { page, limit, skip } = parsePagination(query);

  const filter = {};
  if (hostelId) filter.hostelId = hostelId;
  if (query.invoiceId) filter.invoiceId = query.invoiceId;
  if (query.residentId) filter.residentId = query.residentId;
  if (query.status) filter.status = query.status;

  const [items, total] = await Promise.all([
    Payment.find(filter)
      .populate('residentId', 'name registrationNumber')
      .sort({ paidAt: -1 })
      .skip(skip)
      .limit(limit),
    Payment.countDocuments(filter),
  ]);

  return buildPaginatedResponse({ items, total, page, limit });
}

export async function getPaymentById(user, id) {
  const payment = await Payment.findById(id).populate('residentId', 'name registrationNumber');
  if (!payment) throw ApiError.notFound('Payment not found');
  resolveHostelScope(user, payment.hostelId.toString());
  return payment;
}