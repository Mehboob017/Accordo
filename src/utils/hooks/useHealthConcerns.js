import { fetchHealthConcernDetail } from '@/api/health-concern.api';
import { useInfiniteQuery } from '@tanstack/react-query';

export const useHealthConcernsDetail = (
  healthConcernSlug,
  {
    limit = 8,
    ...options
  } = {}
) => {
  return useInfiniteQuery({
    queryKey: ['health-concern-detail', { healthConcernSlug, limit }],

    enabled: !!healthConcernSlug,

    initialPageParam: 1,

    queryFn: ({ pageParam = 1 }) =>
      fetchHealthConcernDetail({
        healthConcernSlug,
        page: pageParam,
        limit,
      }),

    getNextPageParam: (lastPage) => {
      const pagination =
        lastPage?.data?.['Related Products']?.pagination ||
        lastPage?.pagination;

      if (!pagination?.hasNextPage) {
        return undefined;
      }

      return pagination.currentPage + 1;
    },

    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...options,
  });
};
