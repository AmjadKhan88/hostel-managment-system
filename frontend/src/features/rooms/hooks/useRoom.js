import { useQuery } from '@tanstack/react-query';
import { roomsApi } from '../api/roomsApi';

export function useRoom(roomId) {
  return useQuery({
    queryKey: ['rooms', roomId],
    queryFn: () => roomsApi.getById(roomId),
    enabled: Boolean(roomId),
  });
}