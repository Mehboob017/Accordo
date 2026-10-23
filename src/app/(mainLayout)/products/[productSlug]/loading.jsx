import ProductDetailSkeleton from '@/components/productsDetails/ProductDetailSkeleton';

/**
 * Route-segment loading UI for /products/[productSlug].
 *
 * Next.js wraps page.jsx in a Suspense boundary backed by this file.
 * By providing the product-specific skeleton here instead of the generic
 * site-wide spinner, we ensure:
 *
 *  1. First navigation: shows the product skeleton while the async page.jsx
 *     (getDynamicSeo, generateMetadata) resolves on the server.
 *
 *  2. Any client-side Suspense that escapes local boundaries (e.g. a child
 *     component calling useSearchParams() without a wrapping <Suspense>)
 *     falls back to this skeleton rather than the layout-level generic spinner.
 *
 * The net effect: the user sees ONE consistent skeleton from the moment they
 * navigate to a product page until the data is ready — never the generic
 * full-screen spinner.
 */
export default function ProductPageLoading() {
  return <ProductDetailSkeleton />;
}
