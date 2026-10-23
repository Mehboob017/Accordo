import { fetchAnnualHerbRequirements } from '@/api/herbs.api';
import { useQuery } from '@tanstack/react-query';

export const useAnnualHerbRequirements = (params = {}, options = {}) => {
  const { page = 1, limit = 10 } = params;

  return useQuery({
    queryKey: ['annual-herb-requirements', page, limit],
    queryFn: () => fetchAnnualHerbRequirements({ page, limit }),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
    ...options,
  });
};
