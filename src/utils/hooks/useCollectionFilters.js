import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCollectionFilters } from '@/api/collection-filters.api';

export const useCollectionFilters = (params = {}, options = {}) => {
  const query = useQuery({
    queryKey: ['collection-filters', params],
    queryFn: () => fetchCollectionFilters(params),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    ...options,
  });

  const formattedData = useMemo(() => {
    const data = query.data?.data;
    const definitions = Array.isArray(data?.filters) ? data.filters : [];

    return {
      definitions,
      filterKeys: definitions.map((definition) => definition?.key).filter(Boolean),
      sections: data?.sections ?? [],
      priceRangeLabel: data?.priceRangeLabel || 'Price Range',
      priceRangeMax: Number(data?.priceRangeMax ?? 0),
    };
  }, [query.data]);

  return {
    ...query,
    filters: formattedData,
    isError: query.isError || query.data?.success === false,
    errorMessage: query.error?.message || query.data?.message || '',
  };
};