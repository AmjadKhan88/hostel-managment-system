import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi, expensesApi } from '../api/financeApi';

export function useFinancialOverview(hostelId, month) {
  return useQuery({
    queryKey: ['finance', 'overview', hostelId, month],
    queryFn: () => financeApi.overview(hostelId, month),
    enabled: Boolean(hostelId),
  });
}

export function useExpenses(params) {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: () => expensesApi.list(params),
    enabled: Boolean(params.hostelId),
    placeholderData: (prev) => prev,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: expensesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: expensesApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => expensesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['finance'] });
    },
  });
}
