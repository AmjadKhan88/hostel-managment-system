import { Expense } from '../models/Expense.model.js';
import { ApiError } from '../utils/ApiError.js';
import { resolveHostelScope } from '../utils/hostelScope.js';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination.js';
import { recordAuditLog } from './audit.service.js';

export async function createExpense(user, data) {
  const hostelId = resolveHostelScope(user, data.hostelId);
  if (!hostelId) throw ApiError.badRequest('hostelId is required');

  const expense = await Expense.create({ ...data, hostelId, recordedBy: user.id });

  recordAuditLog({
    hostelId,
    actorId: user.id,
    action: 'expense.recorded',
    entityType: 'Expense',
    entityId: expense._id,
    metadata: {
      title: expense.title,
      category: expense.category,
      amountMinorUnits: expense.amountMinorUnits,
    },
  });

  return expense;
}

export async function listExpenses(user, query) {
  const hostelId = resolveHostelScope(user, query.hostelId);
  const { page, limit, skip } = parsePagination(query);

  const filter = {};
  if (hostelId) filter.hostelId = hostelId;
  if (query.category) filter.category = query.category;
  if (query.from || query.to) {
    filter.incurredAt = {};
    if (query.from) filter.incurredAt.$gte = new Date(query.from);
    if (query.to) filter.incurredAt.$lte = new Date(query.to);
  }

  const [items, total] = await Promise.all([
    Expense.find(filter).sort({ incurredAt: -1 }).skip(skip).limit(limit),
    Expense.countDocuments(filter),
  ]);

  return buildPaginatedResponse({ items, total, page, limit });
}

export async function getExpenseById(user, id) {
  const expense = await Expense.findById(id);
  if (!expense) throw ApiError.notFound('Expense not found');
  resolveHostelScope(user, expense.hostelId.toString());
  return expense;
}

export async function updateExpense(user, id, data) {
  const expense = await getExpenseById(user, id);
  Object.assign(expense, data);
  await expense.save();

  recordAuditLog({
    hostelId: expense.hostelId.toString(),
    actorId: user.id,
    action: 'expense.updated',
    entityType: 'Expense',
    entityId: expense._id,
    metadata: { fields: Object.keys(data) },
  });

  return expense;
}

export async function deleteExpense(user, id) {
  const expense = await getExpenseById(user, id);
  await expense.deleteOne();

  recordAuditLog({
    hostelId: expense.hostelId.toString(),
    actorId: user.id,
    action: 'expense.deleted',
    entityType: 'Expense',
    entityId: expense._id,
    metadata: { title: expense.title },
  });
}
