import { useQuery } from '@tanstack/react-query';
import { fetchEventSuggestions } from '@/api/events.api';

export const useEventSuggestions = (searchTerm, options = {}) => {
  return useQuery({
    queryKey: ['event-suggestions', searchTerm],
    queryFn: () => fetchEventSuggestions(searchTerm),
    enabled: Boolean(searchTerm?.trim()),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
    ...options,
  });
};
