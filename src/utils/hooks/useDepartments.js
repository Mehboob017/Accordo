import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDepartments } from '@/api/departments.api';

export const useDepartments = (options = {}) => {
  const query = useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

  const departments = useMemo(() => query.data?.data?.departments ?? [], [query.data]);

  return {
    ...query,
    departments,
    isError: query.isError || query.data?.success === false,
    errorMessage: query.error?.message || query.data?.message || '',
  };
};