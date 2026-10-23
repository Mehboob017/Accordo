import { fetchBlogBySlug } from '@/api/blog.api';
import { useQuery } from '@tanstack/react-query';

export const useBlog = (slug, options = {}) => {
  return useQuery({
    queryKey: ['blog', slug],
    queryFn: () => fetchBlogBySlug(slug),
    enabled: !!slug,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
};
