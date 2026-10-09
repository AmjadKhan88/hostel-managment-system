import { Hostel } from '../models/Hostel.model.js';
import { Resident } from '../models/Resident.model.js';
import { Invoice } from '../models/Invoice.model.js';
import { Payment } from '../models/Payment.model.js';
import { ApiError } from '../utils/ApiError.js';
import { resolveHostelScope } from '../utils/hostelScope.js';
import { getInvoiceById } from './invoice.service.js';
import { fetchLogoBuffer } from '../pdf/logo.js';
import { renderInvoicePdf, renderReceiptPdf } from '../pdf/documents.js';

const fileName = (prefix, number) => `${prefix}-${number}.pdf`.replace(/[^A-Za-z0-9._-]/g, '_');

async function loadHostel(hostelId) {
  const hostel = await Hostel.findById(hostelId);
  if (!hostel) throw ApiError.notFound('Hostel not found');
  return hostel;
}

async function buildInvoice({ invoice, resident, hostel }) {
  const [payments, logo] = await Promise.all([
    Payment.find({ invoiceId: invoice._id }).sort({ paidAt: 1 }),
    fetchLogoBuffer(hostel.logoUrl),
  ]);
  const buffer = await renderInvoicePdf({ hostel, resident, invoice, payments, logo });
  return { buffer, filename: fileName('Invoice', invoice.invoiceNumber) };
}

async function buildReceipt({ payment, resident, hostel }) {
  const [invoice, logo] = await Promise.all([
    Invoice.findById(payment.invoiceId),
    fetchLogoBuffer(hostel.logoUrl),
  ]);
  const buffer = await renderReceiptPdf({ hostel, resident, invoice, payment, logo });
  return { buffer, filename: fileName('Receipt', payment.receiptNumber) };
}

// ---- Staff: authorization is the route's PAYMENTS_READ plus hostel scope here ----

export async function invoicePdfForStaff(user, invoiceId) {
  const invoice = await getInvoiceById(user, invoiceId); // 404 + hostel-scope check; resident is populated
  const hostel = await loadHostel(invoice.hostelId);
  return buildInvoice({ invoice, resident: invoice.residentId, hostel });
}

export async function receiptPdfForStaff(user, paymentId) {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw ApiError.notFound('Payment not found');
  resolveHostelScope(user, payment.hostelId.toString());

  const [hostel, resident] = await Promise.all([
    loadHostel(payment.hostelId),
    Resident.findById(payment.residentId),
  ]);
  return buildReceipt({ payment, resident, hostel });
}

// ---- Resident: residentId AND hostelId are in the query itself, so another
// resident's document is never loaded, and a wrong ID is a plain 404. ----

export async function invoicePdfForResident(residentAuth, invoiceId) {
  const invoice = await Invoice.findOne({
    _id: invoiceId,
    hostelId: residentAuth.hostelId,
    residentId: residentAuth.id,
  });
  if (!invoice) throw ApiError.notFound('Invoice not found');

  const [hostel, resident] = await Promise.all([
    loadHostel(residentAuth.hostelId),
    Resident.findById(residentAuth.id),
  ]);
  return buildInvoice({ invoice, resident, hostel });
}

export async function receiptPdfForResident(residentAuth, paymentId) {
  const payment = await Payment.findOne({
    _id: paymentId,
    hostelId: residentAuth.hostelId,
    residentId: residentAuth.id,
  });
  if (!payment) throw ApiError.notFound('Receipt not found');

  const [hostel, resident] = await Promise.all([
    loadHostel(residentAuth.hostelId),
    Resident.findById(residentAuth.id),
  ]);
  return buildReceipt({ payment, resident, hostel });
}
