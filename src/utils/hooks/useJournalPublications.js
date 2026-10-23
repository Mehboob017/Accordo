import { fetchJournalPublications } from '@/api/journal-publication.api';
import { useQuery } from '@tanstack/react-query';

export const useJournalPublications = (page = 1, limit = 8, options = {}) => {
  return useQuery({
    queryKey: ['journal-publication', page, limit],
    queryFn: () => fetchJournalPublications({ page, limit }),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
};
