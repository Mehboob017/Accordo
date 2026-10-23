import { fetchPresses } from '@/api/press.api';
import { useQuery } from '@tanstack/react-query';

export const usePresses = (page = 1, limit = 12, options = {}) => {
  return useQuery({
    queryKey: ['presses', page, limit],
    queryFn: () => fetchPresses({ page, limit }),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
};
