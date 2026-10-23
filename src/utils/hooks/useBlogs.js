import { fetchBlogs } from '@/api/blog.api';
import { useQuery } from '@tanstack/react-query';

export const useBlogs = (
  {
    page = 1,
    limit = 10,
    category = '',
    tag = '',
    search = '',
    sortBy = '',
  } = {},
  options = {}
) => {
  return useQuery({
    queryKey: ['blogs', page, limit, category, tag, search, sortBy],
    queryFn: () =>
      fetchBlogs({ page, limit, category, tag, search: search || '', sortBy }),
    enabled: true,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
};

