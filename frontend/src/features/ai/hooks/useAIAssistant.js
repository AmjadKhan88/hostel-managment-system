import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '../api/aiApi';

export function useAssistantHistory(hostelId) {
  return useQuery({
    queryKey: ['ai-assistant', 'history', hostelId],
    queryFn: () => aiApi.history(hostelId),
    enabled: Boolean(hostelId),
  });
}

export function useAskAssistant(hostelId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (question) => aiApi.ask(hostelId, question),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['ai-assistant', 'history', hostelId] }),
  });
}
