import { useQuery } from '@tanstack/react-query';
import { roomsApi } from '../api/roomsApi';

export function useRooms(params) {
  return useQuery({
    queryKey: ['rooms', params],
    queryFn: () => roomsApi.list(params),
    enabled: Boolean(params.hostelId),
    placeholderData: (prev) => prev,
  });
}