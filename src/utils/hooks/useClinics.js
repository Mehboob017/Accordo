import { fetchClinics } from '@/api/clinics.api';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

export const useClinics = (params = {}, options = {}) => {
  const { limit = 12, page = 1, search = '', specialization = '', sortBy = 'asc', field = 'created_at' } = params;

  return useQuery({
    queryKey: ['clinics', { limit, page, search, specialization, sortBy, field }],
    queryFn: () => fetchClinics({ limit, page, search, specialization, sortBy, field }),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
};

export const useInfiniteClinics = (params = {}, options = {}) => {
  const {
    limit = 12,
    search = '',
    specialization = '',
    sortBy = 'asc',
    field = 'created_at',
  } = params;

  return useInfiniteQuery({
    queryKey: [
      'clinics-infinite',
      { limit, search, specialization, sortBy, field },
    ],
    queryFn: ({ pageParam = 1 }) =>
      fetchClinics({
        limit,
        page: pageParam,
        search,
        specialization,
        sortBy,
        field,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;

      const currentPage = Number(pagination?.page);
      const totalPages = Number(pagination?.totalPages);

      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...options,
  });
};