import { fetchStores } from '@/api/stores.api';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

export const useStores = (
  search = '',
  limit = 15,
  sortBy = 'asc',
  field = 'created_at',
  options = {}
) => {
  return useQuery({
    queryKey: ['stores', search, limit, sortBy, field],
    queryFn: () => fetchStores({ search, limit, sortBy, field }),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    enabled: true,
    ...options,
  });
};

export const useInfiniteStores = (
  {
    search = '',
    limit = 15,
    sortBy = 'asc',
    field = 'created_at',
  } = {},
  options = {}
) => {
  return useInfiniteQuery({
    queryKey: [
      'stores-infinite',
      {
        search,
        limit,
        sortBy,
        field,
      },
    ],

    queryFn: ({ pageParam = 1 }) =>
      fetchStores({
        search,
        limit,
        page: pageParam,
        sortBy,
        field,
      }),

    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;

      const currentPage = Number(pagination?.page);
      const totalPages = Number(pagination?.totalPages);

      return currentPage < totalPages
        ? currentPage + 1
        : undefined;
    },

    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,

    ...options,
  });
};
