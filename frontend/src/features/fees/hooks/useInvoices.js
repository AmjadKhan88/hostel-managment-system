import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesApi } from '../api/feesApi';

export function useInvoices(params) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => invoicesApi.list(params),
    enabled: Boolean(params.hostelId),
    placeholderData: (prev) => prev,
  });
}

export function useInvoice(id) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => invoicesApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useOutstandingBalances(hostelId) {
  return useQuery({
    queryKey: ['invoices', 'outstanding-balances', hostelId],
    queryFn: () => invoicesApi.outstandingBalances(hostelId),
    enabled: Boolean(hostelId),
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invoicesApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function useVoidInvoice(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => invoicesApi.void(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', id] });
    },
  });
}