import mongoose from 'mongoose';
import { Invoice } from '../models/Invoice.model.js';
import { Resident } from '../models/Resident.model.js';
import { getNextSequence } from '../models/Counter.model.js';
import { ApiError } from '../utils/ApiError.js';
import { resolveHostelScope } from '../utils/hostelScope.js';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination.js';

function computeTotal(items) {
  return items.reduce((sum, item) => sum + item.amountMinorUnits, 0);
}

export async function createInvoice(user, data) {
  const hostelId = resolveHostelScope(user, data.hostelId);
  if (!hostelId) throw ApiError.badRequest('hostelId is required');

  const resident = await Resident.findById(data.residentId);
  if (!resident) throw ApiError.notFound('Resident not found');
  if (resident.hostelId.toString() !== hostelId) {
    throw ApiError.badRequest('Resident does not belong to this hostel');
  }

  const seq = await getNextSequence(`invoice:${hostelId}`);
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(seq).padStart(6, '0')}`;

  return Invoice.create({
    hostelId,
    residentId: resident._id,
    invoiceNumber,
    items: data.items,
    totalMinorUnits: computeTotal(data.items),
    dueDate: data.dueDate,
    notes: data.notes,
    createdBy: user.id,
  });
}

export async function listInvoices(user, query) {
  const hostelId = resolveHostelScope(user, query.hostelId);
  const { page, limit, skip } = parsePagination(query);

  const filter = {};
  if (hostelId) filter.hostelId = hostelId;
  if (query.status) filter.status = query.status;
  if (query.residentId) filter.residentId = query.residentId;

  const [items, total] = await Promise.all([
    Invoice.find(filter)
      .populate('residentId', 'name registrationNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Invoice.countDocuments(filter),
  ]);

  return buildPaginatedResponse({ items, total, page, limit });
}

export async function getInvoiceById(user, id) {
  const invoice = await Invoice.findById(id).populate('residentId', 'name registrationNumber phone email');
  if (!invoice) throw ApiError.notFound('Invoice not found');
  resolveHostelScope(user, invoice.hostelId.toString());
  return invoice;
}

export async function voidInvoice(user, id) {
  const invoice = await getInvoiceById(user, id);
  if (invoice.paidMinorUnits > 0) {
    throw ApiError.conflict('Cannot void an invoice that already has payments recorded against it');
  }
  invoice.status = 'void';
  await invoice.save();
  return invoice;
}

export async function getOutstandingBalances(user, hostelId) {
  const resolvedHostelId = resolveHostelScope(user, hostelId);
  if (!resolvedHostelId) throw ApiError.badRequest('hostelId is required');

  const results = await Invoice.aggregate([
    {
      $match: {
        hostelId: new mongoose.Types.ObjectId(resolvedHostelId),
        status: { $in: ['issued', 'partially_paid'] },
      },
    },
    {
      $group: {
        _id: '$residentId',
        outstandingMinorUnits: { $sum: { $subtract: ['$totalMinorUnits', '$paidMinorUnits'] } },
        invoiceCount: { $sum: 1 },
      },
    },
    { $sort: { outstandingMinorUnits: -1 } },
  ]);

  const residentIds = results.map((r) => r._id);
  const residents = await Resident.find({ _id: { $in: residentIds } }, 'name registrationNumber');
  const residentMap = new Map(residents.map((r) => [r._id.toString(), r]));

  return results.map((r) => ({
    residentId: r._id,
    residentName: residentMap.get(r._id.toString())?.name ?? 'Unknown',
    registrationNumber: residentMap.get(r._id.toString())?.registrationNumber ?? '',
    outstandingMinorUnits: r.outstandingMinorUnits,
    invoiceCount: r.invoiceCount,
  }));
}