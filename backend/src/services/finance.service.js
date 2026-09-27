import mongoose from 'mongoose';
import { Payment } from '../models/Payment.model.js';
import { Expense } from '../models/Expense.model.js';
import { ApiError } from '../utils/ApiError.js';
import { resolveHostelScope } from '../utils/hostelScope.js';

function monthRange(monthKey) {
  const now = new Date();
  const [year, month] = monthKey
    ? monthKey.split('-').map(Number)
    : [now.getFullYear(), now.getMonth() + 1];
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { start, end };
}

/**
 * Income here means real cash collected (completed Payments), not billed
 * invoice totals — a resident owing money isn't income yet. Expenses are
 * whatever's been recorded via the Expense model. This is what feeds both
 * the Finance page and the AI Assistant's financial-analysis tool — same
 * numbers everywhere, one source of truth.
 */
export async function getFinancialOverview(user, hostelId, { month } = {}) {
  const resolvedHostelId = resolveHostelScope(user, hostelId);
  if (!resolvedHostelId) throw ApiError.badRequest('hostelId is required');

  const hostelObjectId = new mongoose.Types.ObjectId(resolvedHostelId);
  const { start, end } = monthRange(month);

  const [allTimeIncomeAgg, monthIncomeAgg, monthExpenseAgg, expensesByCategoryAgg, recentExpenses] =
    await Promise.all([
      Payment.aggregate([
        { $match: { hostelId: hostelObjectId, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amountMinorUnits' } } },
      ]),
      Payment.aggregate([
        {
          $match: {
            hostelId: hostelObjectId,
            status: 'completed',
            paidAt: { $gte: start, $lt: end },
          },
        },
        { $group: { _id: null, total: { $sum: '$amountMinorUnits' } } },
      ]),
      Expense.aggregate([
        { $match: { hostelId: hostelObjectId, incurredAt: { $gte: start, $lt: end } } },
        { $group: { _id: null, total: { $sum: '$amountMinorUnits' } } },
      ]),
      Expense.aggregate([
        { $match: { hostelId: hostelObjectId, incurredAt: { $gte: start, $lt: end } } },
        { $group: { _id: '$category', total: { $sum: '$amountMinorUnits' } } },
        { $sort: { total: -1 } },
      ]),
      Expense.find({ hostelId: resolvedHostelId }).sort({ incurredAt: -1 }).limit(10),
    ]);

  const totalIncomeMinorUnits = allTimeIncomeAgg[0]?.total ?? 0;
  const thisMonthIncomeMinorUnits = monthIncomeAgg[0]?.total ?? 0;
  const thisMonthExpensesMinorUnits = monthExpenseAgg[0]?.total ?? 0;

  return {
    month: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
    totalIncomeMinorUnits,
    thisMonthIncomeMinorUnits,
    thisMonthExpensesMinorUnits,
    netThisMonthMinorUnits: thisMonthIncomeMinorUnits - thisMonthExpensesMinorUnits,
    expensesByCategory: expensesByCategoryAgg.map((e) => ({
      category: e._id,
      totalMinorUnits: e.total,
    })),
    recentExpenses,
  };
}
