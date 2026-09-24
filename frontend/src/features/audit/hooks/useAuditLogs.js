import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../api/auditApi';

export function useAuditLogs(params) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => auditApi.list(params),
    enabled: Boolean(params.hostelId),
    placeholderData: (prev) => prev,
  });
}