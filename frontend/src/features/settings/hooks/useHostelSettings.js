import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../api/settingsApi';

export function useHostelSettings(hostelId) {
  return useQuery({
    queryKey: ['hostel-settings', hostelId],
    queryFn: () => settingsApi.getHostel(hostelId),
    enabled: Boolean(hostelId),
  });
}

export function useUpdateHostelSettings(hostelId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => settingsApi.updateHostel(hostelId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hostel-settings', hostelId] }),
  });
}

export function useUploadHostelLogo(hostelId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => settingsApi.uploadLogo(hostelId, formData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hostel-settings', hostelId] }),
  });
}