import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { automationApi } from '../api/automationApi';

export function useAutomationStatus(hostelId) {
  return useQuery({
    queryKey: ['automation', 'status', hostelId],
    queryFn: () => automationApi.status(hostelId),
    enabled: Boolean(hostelId),
    refetchInterval: 15000, // auto-refresh so a dead worker doesn't look alive from a stale page
  });
}

export function useRetryJob(hostelId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ queue, jobId }) => automationApi.retryJob(queue, jobId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['automation', 'status', hostelId] }),
  });
}

export function useTriggerJob(hostelId) {
  const queryClient = useQueryClient();
  const triggerByType = {
    'monthly-invoices': automationApi.triggerMonthlyInvoices,
    'recurring-expenses': automationApi.triggerRecurringExpenses,
    'payment-reminders': automationApi.triggerPaymentReminders,
  };
  return useMutation({
    mutationFn: ({ type }) => triggerByType[type](hostelId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['automation', 'status', hostelId] }),
  });
}
