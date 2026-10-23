import { useQuery } from '@tanstack/react-query';
import { fetchGlobalSearch } from '@/api/search.api';

/**
 * React Query hook for global site search.
 * Skips the API call when query is fewer than 2 characters.
 *
 * @param {string} query - The search term (debounced by the caller)
 * @returns {{ data: import('@/api/search.api').SearchResult[], isLoading: boolean, isError: boolean, refetch: function }}
 */
export const useSearch = (query = '') => {
  const enabled = typeof query === 'string' && query.trim().length >= 2;

  const result = useQuery({
    queryKey: ['search', query],
    queryFn: () => fetchGlobalSearch(query),
    enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  return {
    data: result.data?.data ?? [],
    isLoading: result.isFetching,
    isError: result.isError || result.data?.success === false,
    refetch: result.refetch,
  };
};
