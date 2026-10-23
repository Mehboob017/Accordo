import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchBlogBookmarkArray,
  fetchBlogBookmarkListing,
  toggleBlogBookmark,
} from '@/api/blog.api';
import { useUser } from './useUser';

export const BLOG_BOOKMARK_ARRAY_QUERY_KEY = ['blogBookmarksArray'];
export const BLOG_BOOKMARK_LISTING_QUERY_KEY = ['blogBookmarksListing'];

const toUid = (item) => {
  if (!item) return null;
  return String(item);
};

const getBlogBookmarkIds = (bookmarkPayload) => {
  const candidates = bookmarkPayload?.data?.blogUids || [];

  if (!Array.isArray(candidates)) {
    return [];
  }

  return candidates.map(toUid).filter(Boolean);
};

const applyBookmarkToBlogEntity = (entity, blogUid, add) => {
  if (!entity || typeof entity !== 'object') {
    return entity;
  }

  const entityUid = toUid(entity);

  if (entityUid !== String(blogUid)) {
    return entity;
  }

  return {
    ...entity,
    is_bookmarked: add,
    isBookmarked: add,
    bookmarked: add,
    bookmark: add,
  };
};

const applyBookmarkToBlogQueryData = (oldData, blogUid, add) => {
  if (!oldData || typeof oldData !== 'object') {
    return oldData;
  }

  const nextData = { ...oldData };

  if (Array.isArray(oldData.data)) {
    nextData.data = oldData.data.map((item) =>
      applyBookmarkToBlogEntity(item, blogUid, add)
    );
  }

  if (Array.isArray(oldData.recentPosts)) {
    nextData.recentPosts = oldData.recentPosts.map((item) =>
      applyBookmarkToBlogEntity(item, blogUid, add)
    );
  }

  if (Array.isArray(oldData.relatedBlogs)) {
    nextData.relatedBlogs = oldData.relatedBlogs.map((item) =>
      applyBookmarkToBlogEntity(item, blogUid, add)
    );
  }

  if (oldData.blog && typeof oldData.blog === 'object') {
    nextData.blog = applyBookmarkToBlogEntity(oldData.blog, blogUid, add);
  }

  return nextData;
};

const invalidateBlogBookmarkQueries = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ['blogs'] });
  queryClient.invalidateQueries({ queryKey: ['blog'] });
  queryClient.invalidateQueries({ queryKey: BLOG_BOOKMARK_ARRAY_QUERY_KEY });
  queryClient.invalidateQueries({ queryKey: BLOG_BOOKMARK_LISTING_QUERY_KEY });
};

export const useBlogBookmarksArray = (options = {}) => {
  const { isAuthenticated } = useUser();
  const { enabled = true, ...restOptions } = options;

  return useQuery({
    queryKey: BLOG_BOOKMARK_ARRAY_QUERY_KEY,
    queryFn: fetchBlogBookmarkArray,
    enabled: isAuthenticated && enabled,
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      if (error?.message?.includes('Authentication')) {
        return false;
      }

      return failureCount < 2;
    },
    ...restOptions,
  });
};

export const useBlogBookmarksListing = (
  { page = 1, limit = 10 } = {},
  options = {}
) => {
  const { isAuthenticated } = useUser();

  return useQuery({
    queryKey: [...BLOG_BOOKMARK_LISTING_QUERY_KEY, page, limit],
    queryFn: () => fetchBlogBookmarkListing({ page, limit }),
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    retry: (failureCount, error) => {
      if (error?.message?.includes('Authentication')) {
        return false;
      }

      return failureCount < 2;
    },
    ...options,
  });
};

export const useToggleBlogBookmark = (options = {}) => {
  const queryClient = useQueryClient();
  const {
    onError: onErrorCallback,
    onSuccess: onSuccessCallback,
    onSettled: onSettledCallback,
    ...restOptions
  } = options;

  return useMutation({
    mutationKey: ['toggleBlogBookmark'],
    mutationFn: ({ blogUid, add }) => toggleBlogBookmark({ blogUid, add }),
    onMutate: async ({ blogUid, add }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: BLOG_BOOKMARK_ARRAY_QUERY_KEY }),
        queryClient.cancelQueries({ queryKey: ['blogs'] }),
        queryClient.cancelQueries({ queryKey: ['blog'] }),
      ]);

      const previousBookmarkArray = queryClient.getQueryData(
        BLOG_BOOKMARK_ARRAY_QUERY_KEY
      );
      const previousBlogsQueries = queryClient.getQueriesData({
        queryKey: ['blogs'],
      });
      const previousBlogQueries = queryClient.getQueriesData({
        queryKey: ['blog'],
      });

      queryClient.setQueryData(BLOG_BOOKMARK_ARRAY_QUERY_KEY, (oldData) => {
        const previousIds = getBlogBookmarkIds(oldData);
        const blogUidAsString = String(blogUid);
        const nextIds = add
          ? Array.from(new Set([...previousIds, blogUidAsString]))
          : previousIds.filter((uid) => uid !== blogUidAsString);

        return {
          ...(oldData && typeof oldData === 'object' ? oldData : {}),
          success: true,
          message: oldData?.message || 'Bookmark fetched successfully',
          data: {
            ...(oldData?.data && typeof oldData.data === 'object'
              ? oldData.data
              : {}),
            blogUids: nextIds,
          },
        };
      });

      queryClient.setQueriesData({ queryKey: ['blogs'] }, (oldData) =>
        applyBookmarkToBlogQueryData(oldData, blogUid, add)
      );
      queryClient.setQueriesData({ queryKey: ['blog'] }, (oldData) =>
        applyBookmarkToBlogQueryData(oldData, blogUid, add)
      );

      return {
        previousBookmarkArray,
        previousBlogsQueries,
        previousBlogQueries,
      };
    },
    onError: (error, _variables, context) => {
      if (context?.previousBookmarkArray !== undefined) {
        queryClient.setQueryData(
          BLOG_BOOKMARK_ARRAY_QUERY_KEY,
          context.previousBookmarkArray
        );
      }

      context?.previousBlogsQueries?.forEach(([queryKey, queryData]) => {
        queryClient.setQueryData(queryKey, queryData);
      });

      context?.previousBlogQueries?.forEach(([queryKey, queryData]) => {
        queryClient.setQueryData(queryKey, queryData);
      });

      onErrorCallback?.(error);
    },
    onSuccess: (data, variables) => {
      onSuccessCallback?.(data, variables);
    },
    onSettled: () => {
      invalidateBlogBookmarkQueries(queryClient);
      onSettledCallback?.();
    },
    ...restOptions,
  });
};

export const useIsBlogBookmarked = (
  blogUid,
  options = {},
) => {
  const { isAuthenticated } = useUser();
  const { data } = useBlogBookmarksArray({
    staleTime: 2 * 60 * 1000,
    ...options,
  });

  if (!blogUid) {
    return false;
  }

  if (!isAuthenticated) {
    return false;
  }

  const bookmarkIds = getBlogBookmarkIds(data);

  if (!data) {
    return false;
  }

  return bookmarkIds.includes(String(blogUid));
};
