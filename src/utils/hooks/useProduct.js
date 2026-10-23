import {
  fetchProductRedirectByVariant,
  fetchProductDetail,
  fetchProductDetailRaw,
  fetchProducts,
  fetchProductModal,
  submitProductReview,
} from '@/api/product.api';
import { useMutation, useQuery, useInfiniteQuery } from '@tanstack/react-query';

export const useProducts = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...options,
  });
};

/**
 * Infinite-scroll variant of useProducts.
 * Manages page param internally; the caller should omit `page` from params.
 * TanStack Query v5 — requires initialPageParam.
 */
export const useInfiniteProducts = (params = {}, options = {}) => {
  return useInfiniteQuery({
    queryKey: ['products-infinite', params],
    queryFn: ({ pageParam }) => fetchProducts({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      const currentPage = Number(pagination?.page);
      const totalPages = Number(pagination?.totalPages);
      if (Number.isFinite(currentPage) && Number.isFinite(totalPages) && currentPage < totalPages) {
        return currentPage + 1;
      }
      return undefined;
    },
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
};

export const useProductDetail = (slug, options = {}) => {
  return useQuery({
    queryKey: ['product-detail', { slug }],
    queryFn: () => fetchProductDetail(slug),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000, // 1 minute
    enabled: !!slug,
    ...options,
  });
};

export const useProductDetailRaw = ({ slug, productVariant }, options = {}) => {
  return useQuery({
    queryKey: ['product-detail-raw', { slug, productVariant }],
    queryFn: () => fetchProductDetailRaw({ slug, productVariant }),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000, // 1 minute
    enabled: !!slug,
    ...options,
  });
};

export const useProductRedirectByVariant = (options = {}) => {
  return useMutation({
    mutationKey: ['product-redirect-by-variant'],
    mutationFn: (variantId) => fetchProductRedirectByVariant(variantId),
    ...options,
  });
};

export const useProductModal = (productUid, options = {}) => {
  return useQuery({
    queryKey: ['product-modal', productUid],
    queryFn: () => fetchProductModal(productUid),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    enabled: !!productUid,
    ...options,
  });
};

export const useSubmitReview = (options = {}) => {
  return useMutation({
    mutationKey: ['submit-review'],
    mutationFn: ({payload, trxUid}) => submitProductReview({ payload, trxUid }),
    ...options
  });
};