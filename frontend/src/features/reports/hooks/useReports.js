import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/reportsApi';

export function useOccupancyReport(hostelId) {
  return useQuery({
    queryKey: ['reports', 'occupancy', hostelId],
    queryFn: () => reportsApi.occupancy({ hostelId }),
    enabled: Boolean(hostelId),
  });
}

export function useFeeCollectionReport(hostelId, range) {
  return useQuery({
    queryKey: ['reports', 'fee-collection', hostelId, range],
    queryFn: () => reportsApi.feeCollection({ hostelId, ...range }),
    enabled: Boolean(hostelId),
  });
}

export function useOutstandingDuesReport(hostelId) {
  return useQuery({
    queryKey: ['reports', 'outstanding-dues', hostelId],
    queryFn: () => reportsApi.outstandingDues({ hostelId }),
    enabled: Boolean(hostelId),
  });
}

export function useAdmissionsReport(hostelId, range) {
  return useQuery({
    queryKey: ['reports', 'admissions', hostelId, range],
    queryFn: () => reportsApi.admissions({ hostelId, ...range }),
    enabled: Boolean(hostelId),
  });
}

export function useComplaintsReport(hostelId, range) {
  return useQuery({
    queryKey: ['reports', 'complaints', hostelId, range],
    queryFn: () => reportsApi.complaints({ hostelId, ...range }),
    enabled: Boolean(hostelId),
  });
}

export function useMaintenanceReport(hostelId, range) {
  return useQuery({
    queryKey: ['reports', 'maintenance', hostelId, range],
    queryFn: () => reportsApi.maintenance({ hostelId, ...range }),
    enabled: Boolean(hostelId),
  });
}

export function useVisitorsReport(hostelId, range) {
  return useQuery({
    queryKey: ['reports', 'visitors', hostelId, range],
    queryFn: () => reportsApi.visitors({ hostelId, ...range }),
    enabled: Boolean(hostelId),
  });
}