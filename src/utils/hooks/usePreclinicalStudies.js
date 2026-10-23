import { fetchPreclinicalStudies } from '@/api/preclinical-studies.api';
import { useQuery } from '@tanstack/react-query';

export const usePreclinicalStudies = (options = {}) => {
  return useQuery({
    queryKey: ['preclinical-studies'],
    queryFn: fetchPreclinicalStudies,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
};
