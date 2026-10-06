import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentApprovalsApi } from '../api/paymentApprovalsApi';

export function usePaymentSubmissions(params) {
  return useQuery({
    queryKey: ['payment-submissions', params],
    queryFn: () => paymentApprovalsApi.list(params),
    refetchInterval: 20000, // this is a queue — keep it fresh without a manual reload
  });
}

export function useApproveSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: paymentApprovalsApi.approve,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payment-submissions'] }),
  });
}

export function useRejectSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => paymentApprovalsApi.reject(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payment-submissions'] }),
  });
}
