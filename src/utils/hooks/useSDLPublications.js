import { fetchSDLPublications } from '@/api/sdl-publication.api';
import { useQuery } from '@tanstack/react-query';

/**
 * Custom hook to fetch SDL Publications
 * Requires valid user token in sessionStorage
 * 
 * @param {Object} options - React Query options
 * @returns {Object} Query result with publications data
 */
export const useSDLPublications = (options = {}) => {
  return useQuery({
    queryKey: ['sdl-publication'],
    queryFn: fetchSDLPublications,
    enabled: true,
    retry: false, // Don't retry on auth failures
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};
