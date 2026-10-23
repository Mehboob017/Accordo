import { useSuspenseQuery } from '@tanstack/react-query';
import { fetchProductDetailSection, fetchProductImages } from '@/api/product.api';

const useProductSection = (slug, section, productVariant, options = {}) =>
  useSuspenseQuery({
    queryKey: ['product', slug, section, productVariant],
    queryFn: () => fetchProductDetailSection({ slug, section, productVariant }),
    staleTime: 5 * 60 * 1000,
    retry: false,
    ...options,
  });

export const useProductCore = (slug, productVariant, options) =>
  useProductSection(slug, 1, productVariant, options);

export const useRelatedProducts = (slug, productVariant, options) =>
  useProductSection(slug, 2, productVariant, options);

export const useProductReviews = (slug, productVariant, options) =>
  useProductSection(slug, 3, productVariant, options);

export const useProductImages = (slug, options = {}) =>
  useSuspenseQuery({
    queryKey: ['product-images', slug],
    queryFn: () => fetchProductImages({ slug }),
    staleTime: 5 * 60 * 1000,
    retry: false,
    ...options,
  });
