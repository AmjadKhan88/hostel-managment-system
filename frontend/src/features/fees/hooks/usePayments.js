import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../api/feesApi';

export function usePaymentsForInvoice(invoiceId) {
  return useQuery({
    queryKey: ['payments', { invoiceId }],
    queryFn: () => paymentsApi.list({ invoiceId }),
    enabled: Boolean(invoiceId),
  });
}

export function useRecordPayment(invoiceId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: paymentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['payments', { invoiceId }] });
    },
  });
}

export function useRefundPayment(invoiceId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => paymentsApi.refund(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['payments', { invoiceId }] });
    },
  });
}