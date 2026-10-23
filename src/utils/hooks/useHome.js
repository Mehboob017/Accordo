import { fetchHome, fetchHomeSection } from '@/api/home.api';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

export const useHome = (options = {}) => {
  return useSuspenseQuery({
    queryKey: ['home'],
    queryFn: fetchHome,
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: false, // Don't retry on auth failures
    // refetchOnWindowFocus: false,
    ...options,
  });
};

export const useHomeSectionQuery = (section, options = {}) => {
  return useSuspenseQuery({
    queryKey: ['home', section],
    queryFn: () => fetchHomeSection(section),
    staleTime: 60 * 60 * 1000,
    retry: false,
    ...options,
  });
};

// Section 1
export const useHeroBanner = (options) => useHomeSectionQuery(1, options);
export const useBestSellers = (options) => useHomeSectionQuery(1, options);

// Section 2
export const useSeasonProducts = (options) => useHomeSectionQuery(2, options);
export const useHealthInterest = (options) => useHomeSectionQuery(2, options);

// Section 3
export const useReviews = (options) => useHomeSectionQuery(3, options);
export const useTestimonials = (options) => useHomeSectionQuery(3, options);
export const useLatestBlogs = (options) => useHomeSectionQuery(3, options);
export const useKeywords = (options = {}) => {
  return useQuery({
    queryKey: ['home', 3],
    queryFn: () => fetchHomeSection(3),
    staleTime: 60 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

// TODO: confirm section for these two
export const useDepartments = (options) => useHomeSectionQuery(3, options);
export const useUpcomingEvents = (options) => useHomeSectionQuery(3, options);