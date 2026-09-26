import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as expenseService from '../services/expense.service.js';

export const createExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.createExpense(req.user, req.body);
  new ApiResponse(201, { expense }, 'Expense recorded successfully').send(res);
});

export const listExpenses = asyncHandler(async (req, res) => {
  const result = await expenseService.listExpenses(req.user, req.query);
  new ApiResponse(200, result, 'Expenses fetched successfully').send(res);
});

export const getExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.getExpenseById(req.user, req.params.id);
  new ApiResponse(200, { expense }, 'Expense fetched successfully').send(res);
});

export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.updateExpense(req.user, req.params.id, req.body);
  new ApiResponse(200, { expense }, 'Expense updated successfully').send(res);
});

export const deleteExpense = asyncHandler(async (req, res) => {
  await expenseService.deleteExpense(req.user, req.params.id);
  new ApiResponse(200, null, 'Expense deleted successfully').send(res);
});
