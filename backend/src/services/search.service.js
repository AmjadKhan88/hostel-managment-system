import { Resident } from '../models/Resident.model.js';
import { Room } from '../models/Room.model.js';
import { Bed } from '../models/Bed.model.js';
import { Invoice } from '../models/Invoice.model.js';
import { Payment } from '../models/Payment.model.js';
import { Complaint } from '../models/Complaint.model.js';
import { Visitor } from '../models/Visitor.model.js';
import { User } from '../models/User.model.js';
import { ApiError } from '../utils/ApiError.js';
import { resolveHostelScope } from '../utils/hostelScope.js';
import { PERMISSIONS, SUPER_ADMIN_WILDCARD } from '../constants/permissions.js';

const RESULT_LIMIT = 5;

function hasPermission(user, permission) {
  return user.permissions.includes(SUPER_ADMIN_WILDCARD) || user.permissions.includes(permission);
}

export async function globalSearch(user, hostelId, query) {
  const resolvedHostelId = resolveHostelScope(user, hostelId);
  if (!resolvedHostelId) throw ApiError.badRequest('hostelId is required');
  if (!query || query.trim().length < 2) {
    return { results: [] };
  }

  const regex = { $regex: query.trim(), $options: 'i' };
  const categoryQueries = [];

  if (hasPermission(user, PERMISSIONS.STUDENT_READ)) {
    categoryQueries.push(
      Resident.find({
        hostelId: resolvedHostelId,
        $or: [{ name: regex }, { phone: regex }, { email: regex }, { registrationNumber: regex }],
      })
        .select('name registrationNumber phone')
        .limit(RESULT_LIMIT)
        .then((rows) =>
          rows.map((r) => ({
            category: 'Residents',
            id: r._id,
            title: r.name,
            subtitle: `${r.registrationNumber} · ${r.phone}`,
            path: `/residents/${r._id}`,
          }))
        )
    );
  }

  if (hasPermission(user, PERMISSIONS.ROOM_READ)) {
    categoryQueries.push(
      Room.find({ hostelId: resolvedHostelId, roomNumber: regex })
        .select('roomNumber category status')
        .limit(RESULT_LIMIT)
        .then((rows) =>
          rows.map((r) => ({
            category: 'Rooms',
            id: r._id,
            title: `Room ${r.roomNumber}`,
            subtitle: `${r.category} · ${r.status}`,
            path: `/rooms/${r._id}`,
          }))
        )
    );

    categoryQueries.push(
      Bed.find({ hostelId: resolvedHostelId, bedNumber: regex })
        .select('bedNumber roomId')
        .limit(RESULT_LIMIT)
        .then((rows) =>
          rows.map((b) => ({
            category: 'Beds',
            id: b._id,
            title: `Bed ${b.bedNumber}`,
            subtitle: 'View room',
            path: `/rooms/${b.roomId}`,
          }))
        )
    );
  }

  if (hasPermission(user, PERMISSIONS.PAYMENTS_READ)) {
    categoryQueries.push(
      Invoice.find({ hostelId: resolvedHostelId, invoiceNumber: regex })
        .populate('residentId', 'name')
        .select('invoiceNumber status residentId')
        .limit(RESULT_LIMIT)
        .then((rows) =>
          rows.map((inv) => ({
            category: 'Invoices',
            id: inv._id,
            title: inv.invoiceNumber,
            subtitle: `${inv.residentId?.name ?? ''} · ${inv.status.replace('_', ' ')}`,
            path: `/fees/invoices/${inv._id}`,
          }))
        )
    );

    categoryQueries.push(
      Payment.find({ hostelId: resolvedHostelId, receiptNumber: regex })
        .populate('residentId', 'name')
        .select('receiptNumber invoiceId residentId')
        .limit(RESULT_LIMIT)
        .then((rows) =>
          rows.map((p) => ({
            category: 'Payments',
            id: p._id,
            title: p.receiptNumber,
            subtitle: p.residentId?.name ?? '',
            path: `/fees/invoices/${p.invoiceId}`,
          }))
        )
    );
  }

  if (hasPermission(user, PERMISSIONS.COMPLAINTS_READ)) {
    categoryQueries.push(
      Complaint.find({ hostelId: resolvedHostelId, subject: regex })
        .select('subject status')
        .limit(RESULT_LIMIT)
        .then((rows) =>
          rows.map((c) => ({
            category: 'Complaints',
            id: c._id,
            title: c.subject,
            subtitle: c.status.replace('_', ' '),
            path: `/complaints/${c._id}`,
          }))
        )
    );
  }

  if (hasPermission(user, PERMISSIONS.VISITORS_MANAGE)) {
    categoryQueries.push(
      Visitor.find({ hostelId: resolvedHostelId, $or: [{ visitorName: regex }, { phone: regex }] })
        .select('visitorName phone checkOutAt')
        .limit(RESULT_LIMIT)
        .then((rows) =>
          rows.map((v) => ({
            category: 'Visitors',
            id: v._id,
            title: v.visitorName,
            subtitle: v.checkOutAt ? 'Checked out' : 'Inside',
            path: '/visitors',
          }))
        )
    );
  }

  if (hasPermission(user, PERMISSIONS.STAFF_MANAGE)) {
    categoryQueries.push(
      User.find({ hostelId: resolvedHostelId, $or: [{ name: regex }, { email: regex }] })
        .select('name email')
        .limit(RESULT_LIMIT)
        .then((rows) =>
          rows.map((u) => ({
            category: 'Staff',
            id: u._id,
            title: u.name,
            subtitle: u.email,
            path: '/staff',
          }))
        )
    );
  }

  const grouped = await Promise.all(categoryQueries);
  return { results: grouped.flat() };
}