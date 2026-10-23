import { useQuery } from '@tanstack/react-query';
import { fetchFaqs } from '@/api/faqs.api';

export const useFaqs = (categoryUid, options = {}) => {
  return useQuery({
    queryKey: ['faqs', categoryUid || 'all'],
    queryFn: () => fetchFaqs({ categoryUid }),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
};

