import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addToWishlist,
  fetchWishlist,
  removeFromWishlist,
  fetchWishlistArray,
  toggleWishlist,
} from '@/api/wishlist.api';
import { useUser } from './useUser';

const invalidateWishlistQueries = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ['wishlist'] });
  queryClient.invalidateQueries({ queryKey: ['wishlistArray'] });
};

/**
 * Hook to fetch wishlist data
 * @param {Object} params
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @param {Object} options - React Query options
 * @returns {Object} Query result
 */
export const useWishlist = (
  { page = 1, limit = 10 } = {},
  options = {}
) => {
  const { isAuthenticated } = useUser();

  return useQuery({
    queryKey: ['wishlist', page, limit],
    queryFn: () => fetchWishlist({ page, limit }),
    enabled: isAuthenticated, // Only run query if authenticated
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error?.message?.includes('Authentication')) {
        return false;
      }
      return failureCount < 3;
    },
    ...options,
  });
};

/**
 * Hook to add product to wishlist
 * @param {Object} options - React Query mutation options
 * @returns {Object} Mutation result
 */
export const useAddToWishlist = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['addToWishlist'],
    mutationFn: ({ productUid, add }) => addToWishlist({ productUid, add }),
    onSuccess: (data, variables) => {
      invalidateWishlistQueries(queryClient);

      // Call user's onSuccess if provided
      options.onSuccess?.(data, variables);
    },
    onError: (error) => {
      console.error('Error adding to wishlist:', error);
      options.onError?.(error);
    },
    ...options,
  });
};

/**
 * Hook to remove product from wishlist
 * @param {Object} options - React Query mutation options
 * @returns {Object} Mutation result
 */

export const useRemoveFromWishlist = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restOptions } = options;

  return useMutation({
    mutationKey: ['removeFromWishlist'],
    mutationFn: ({ productUid, add = false }) =>
      removeFromWishlist({ productUid, add }),

    onSuccess: (data, variables, context) => {
      invalidateWishlistQueries(queryClient);
      onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      console.error('Error removing from wishlist:', error);
      onError?.(error, variables, context);
    },

    ...restOptions,
  });
};

/**
 * Hook to toggle product in wishlist
 * @param {Object} options - React Query mutation options
 * @returns {Object} Mutation result
 */
export const useToggleWishlist = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['toggleWishlist'],
    mutationFn: ({ productUid, add }) => toggleWishlist({ productUid, add }),
    onSuccess: (data, variables) => {
      invalidateWishlistQueries(queryClient);

      // Call user's onSuccess if provided
      options.onSuccess?.(data, variables);
    },
    onError: (error) => {
      console.error('Error toggling wishlist:', error);
      options.onError?.(error);
    },
    ...options,
  });
};

export const useWishlistArray = (options = {}) => {
  const { isAuthenticated } = useUser();

  return useQuery({
    queryKey: ['wishlistArray'],
    queryFn: fetchWishlistArray,
    enabled: isAuthenticated,
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error?.message?.includes('Authentication')) {
        return false;
      }
      return failureCount < 3;
    },
    ...options,
  });
};

/**
 * Helper hook to check if product is in wishlist
 * @param {string} productUid - Product UID to check
 * @returns {boolean} Whether product is in wishlist
 */
export const useIsInWishlist = (productUid) => {
  const { data: wishlistArrayData } = useWishlistArray(); // Fetch all productUids in wishlist

  if (!productUid || !wishlistArrayData?.success) {
    return false;
  }

  return wishlistArrayData.data?.wishlist?.some(
    (item) => item === productUid
  ) ?? false;
};