import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../api/documentsApi';

export function useDocuments(residentId) {
  return useQuery({
    queryKey: ['documents', residentId],
    queryFn: () => documentsApi.list(residentId),
    enabled: Boolean(residentId),
  });
}

export function useUploadDocument(residentId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => documentsApi.upload(residentId, formData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents', residentId] }),
  });
}

export function useDeleteDocument(residentId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => documentsApi.remove(residentId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents', residentId] }),
  });
}