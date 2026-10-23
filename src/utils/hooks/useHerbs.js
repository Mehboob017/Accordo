import { fetchHealthConcernDetail } from '@/api/health-concern.api';
import { fetchHerbDetail, fetchHerbs } from '@/api/herbs.api';
import { useQuery } from '@tanstack/react-query';

export const useHerbs = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['herbs', params],
    queryFn: () => fetchHerbs(params),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
};

export const useHerbDetail = (herbSlug, options = {}) => {
  return useQuery({
    queryKey: ['herb-detail', { herbSlug }],
    queryFn: () => fetchHerbDetail({ herbSlug }),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
};
