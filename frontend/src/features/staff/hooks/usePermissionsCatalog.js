import { useQuery } from '@tanstack/react-query';
import { metaApi } from '../api/staffApi';

export function usePermissionsCatalog() {
  return useQuery({
    queryKey: ['meta', 'permissions'],
    queryFn: metaApi.permissions,
    staleTime: 5 * 60 * 1000, // this catalog rarely changes within a session
  });
}