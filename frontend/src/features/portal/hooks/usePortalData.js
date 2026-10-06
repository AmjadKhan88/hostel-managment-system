import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portalApi } from '../api/portalApi';

export function usePortalInvoices(params) {
  return useQuery({
    queryKey: ['portal', 'invoices', params],
    queryFn: () => portalApi.invoices(params),
  });
}

export function usePortalInvoice(id) {
  return useQuery({
    queryKey: ['portal', 'invoices', id],
    queryFn: () => portalApi.invoice(id),
    enabled: Boolean(id),
  });
}

export function usePortalPayments(params) {
  return useQuery({
    queryKey: ['portal', 'payments', params],
    queryFn: () => portalApi.payments(params),
  });
}

export function usePortalComplaints(params) {
  return useQuery({
    queryKey: ['portal', 'complaints', params],
    queryFn: () => portalApi.complaints(params),
  });
}

export function usePortalComplaint(id) {
  return useQuery({
    queryKey: ['portal', 'complaints', id],
    queryFn: () => portalApi.complaint(id),
    enabled: Boolean(id),
  });
}

export function useSubmitComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: portalApi.submitComplaint,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portal', 'complaints'] }),
  });
}

export function usePortalNotices(params) {
  return useQuery({
    queryKey: ['portal', 'notices', params],
    queryFn: () => portalApi.notices(params),
  });
}

export function usePortalProfile() {
  return useQuery({ queryKey: ['portal', 'profile'], queryFn: portalApi.profile });
}

export function useUpdatePortalProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: portalApi.updateProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portal', 'profile'] }),
  });
}

export function usePortalDocuments() {
  return useQuery({ queryKey: ['portal', 'documents'], queryFn: portalApi.documents });
}

export function useUploadPortalDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: portalApi.uploadDocument,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portal', 'documents'] }),
  });
}

export function useDeletePortalDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: portalApi.deleteDocument,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portal', 'documents'] }),
  });
}

export function usePortalMaintenanceTickets(params) {
  return useQuery({
    queryKey: ['portal', 'maintenance', params],
    queryFn: () => portalApi.maintenanceTickets(params),
  });
}

export function usePortalMaintenanceTicket(id) {
  return useQuery({
    queryKey: ['portal', 'maintenance', id],
    queryFn: () => portalApi.maintenanceTicket(id),
    enabled: Boolean(id),
  });
}

export function useSubmitMaintenanceRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: portalApi.submitMaintenanceRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portal', 'maintenance'] }),
  });
}

export function usePortalVisitors(params) {
  return useQuery({
    queryKey: ['portal', 'visitors', params],
    queryFn: () => portalApi.myVisitors(params),
  });
}

export function usePreRegisterVisitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: portalApi.preRegisterVisitor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portal', 'visitors'] }),
  });
}

export function useCancelPortalVisitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: portalApi.cancelVisitor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portal', 'visitors'] }),
  });
}

export function usePaymentMethods() {
  return useQuery({ queryKey: ['portal', 'payment-methods'], queryFn: portalApi.paymentMethods });
}

export function usePaymentSubmissions(invoiceId) {
  return useQuery({
    queryKey: ['portal', 'payment-submissions', invoiceId],
    queryFn: () => portalApi.paymentSubmissions({ invoiceId }),
    enabled: Boolean(invoiceId),
  });
}

export function useSubmitPaymentProof() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: portalApi.submitPaymentProof,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'payment-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['portal', 'invoices'] });
    },
  });
}
