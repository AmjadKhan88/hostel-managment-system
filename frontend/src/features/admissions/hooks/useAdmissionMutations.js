import { useMutation, useQueryClient } from '@tanstack/react-query';
import { admissionsApi } from '../api/admissionsApi';

export function useCreateAdmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: admissionsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admissions'] }),
  });
}

function useAdmissionAction(id, fn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissions'] });
      queryClient.invalidateQueries({ queryKey: ['admissions', id] });
      // Check-in touches residents/beds/rooms too — refresh those views.
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useApproveAdmission(id) {
  return useAdmissionAction(id, (data) => admissionsApi.approve(id, data));
}

export function useRejectAdmission(id) {
  return useAdmissionAction(id, (data) => admissionsApi.reject(id, data));
}

export function useWaitlistAdmission(id) {
  return useAdmissionAction(id, (data) => admissionsApi.waitlist(id, data));
}

export function useVerifyDocuments(id) {
  return useAdmissionAction(id, () => admissionsApi.verifyDocuments(id));
}

export function useCheckInAdmission(id) {
  return useAdmissionAction(id, (data) => admissionsApi.checkIn(id, data));
}

export function useCancelAdmission(id) {
  return useAdmissionAction(id, () => admissionsApi.cancel(id));
}