'use client';
import { useMemo, useRef, useCallback, useEffect, memo } from 'react';
import { Col, Row } from 'reactstrap';
import NoDataFound from '@/components/common/NoDataFound';
import ProductBox1 from '@/components/common/productBox/productBox1/ProductBox1';
import noProduct from '../../../../public/assets/svg/no-product.svg';
import ProductSkeletonComponent from '@/components/common/skeletonLoader/productSkeleton/ProductSkeletonComponent';
import { useInfiniteProducts } from '@/utils/hooks/useProduct';
import { mapCollectionSortToApiSort } from '../filterUtils';
import Loader from '@/layout/loader';

const parsePriceValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

// Memoized product card — prevents re-rendering previously loaded cards
// when a new page is appended, eliminating flicker on scroll.
const ProductCard = memo(({ product }) => (
  <Col xxl={4} lg={4} md={6} xs={6} className="collection-product-col">
    <ProductBox1
      imgUrl={product?.product_thumbnail}
      productDetail={{ ...product }}
      classObj={{ productBoxClass: 'product-box-3' }}
    />
  </Col>
));
ProductCard.displayName = 'ProductCard';

const CollectionProducts = ({ filter, grid }) => {
  const perPage = 20;

  // Sentinel element observed by IntersectionObserver to trigger next-page loads.
  const sentinelRef = useRef(null);

  // Derive price bounds from the filter's price range string (e.g. "100-500").
  const selectedPriceRange = Array.isArray(filter?.price) ? filter.price[0] : '';
  const [rawMinPrice, rawMaxPrice] = String(selectedPriceRange || '')
    .split('-')
    .map(parsePriceValue);
  const minPrice = rawMinPrice ?? undefined;
  const maxPrice = rawMaxPrice ?? undefined;

  // Build query params. Exclude `page` (managed by useInfiniteQuery),
  // `price` (expanded to minPrice/maxPrice), and `sortBy` (mapped to `sort`).
  const productQueryParams = useMemo(() => {
    const nextParams = {
      ...filter,
      limit: perPage,
      minPrice,
      maxPrice,
      sort: mapCollectionSortToApiSort(filter?.sortBy),
    };
    delete nextParams.page;
    delete nextParams.price;
    delete nextParams.sortBy;
    return nextParams;
  }, [filter, minPrice, maxPrice]);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
    error,
  } = useInfiniteProducts(productQueryParams);

  // Flatten all loaded pages into a single deduplicated product list.
  // Deduplication guards against rare API overlaps between pages.
  const allProducts = useMemo(() => {
    const pages = data?.pages ?? [];
    const seen = new Set();
    const flat = [];
    for (const page of pages) {
      const products = Array.isArray(page?.data?.product) ? page.data.product : [];
      const theme = page?.data?.theme || null;
      for (const product of products) {
        const key = product.id ?? product.uid;
        if (key && seen.has(key)) continue;
        if (key) seen.add(key);
        flat.push({ ...product, theme });
      }
    }
    return flat;
  }, [data]);

  // Apply client-side filters and sorting as a fallback to the flattened product list.
  const filteredAndSortedProducts = useMemo(() => {
    let products = [...allProducts];

    // Category filter fallback when API values do not fully match UI slugs.
    if (filter?.category?.length > 0) {
      products = products.filter((product) =>
        product.categories?.some(
          (cat) =>
            filter.category.includes(cat.slug) ||
            filter.category.includes(cat.uid) ||
            filter.category.includes(cat.name)
        )
      );
    }

    // Price range filter fallback alongside server-side min/max filtering.
    if (filter?.price?.length > 0) {
      products = products.filter((product) => {
        const productPrice = product.sale_price || product.price;
        return filter.price.some((priceRange) => {
          const [min, max] = priceRange.split('-').map(Number);
          return productPrice >= min && productPrice <= max;
        });
      });
    }

    // Rating filter fallback.
    if (filter?.rating?.length > 0) {
      products = products.filter((product) =>
        filter.rating.some((rating) => product.rating_count >= Number(rating))
      );
    }

    // Client-side sort fallback for modes not handled server-side.
    if (filter?.sortBy) {
      switch (filter.sortBy) {
        case 'asc':
          products.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price));
          break;
        case 'desc':
          products.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price));
          break;
        case 'a-z':
          products.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'z-a':
          products.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'high-rated':
          products.sort((a, b) => (b.rating_count || 0) - (a.rating_count || 0));
          break;
        case 'low-rated':
          products.sort((a, b) => (a.rating_count || 0) - (b.rating_count || 0));
          break;
        default:
          break;
      }
    }

    return products;
  }, [allProducts, filter]);

  // IntersectionObserver callback — fires only when sentinel enters the viewport.
  // Guard against fetching if already in-flight or no pages remain.
  const handleIntersection = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  // Attach / detach observer whenever the callback identity changes
  // (i.e. when hasNextPage or isFetchingNextPage flips).
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      // Pre-load the next page 400 px before the sentinel reaches the viewport,
      // giving the API time to respond before the user hits the bottom.
      rootMargin: '400px',
      threshold: 0,
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleIntersection]);

  // ── Render ──────────────────────────────────────────────────────────────

  // Full-page skeleton on initial load only.
  if (isLoading) {
    return (
      // <Row className={`g-sm-4 g-3 product-list-section ${grid === 'list' ? 'list-style' : ''}`}>
      //   <ProductSkeletonComponent item={20} />
      // </Row>
      <div className=''>
        <Loader />
      </div>
    );
  }

  // Surface API/network errors without crashing.
  if (isError) {
    return (
      <NoDataFound
        data={{
          imageUrl: noProduct,
          customClass: 'no-data-added collection-no-data',
          title: 'Something went wrong.',
          description: error?.message || 'Failed to load products. Please try again.',
          height: 345,
          width: 345,
        }}
      />
    );
  }

  // Empty state after filters have been applied.
  if (filteredAndSortedProducts.length === 0) {
    return (
      <NoDataFound
        data={{
          imageUrl: noProduct,
          customClass: 'no-data-added collection-no-data',
          title: 'Sorry! No products found.',
          description: 'Try a different keyword or check your spelling.',
          height: 345,
          width: 345,
        }}
      />
    );
  }

  return (
    <>
      <Row className={`g-sm-4 g-3 product-list-section ${grid === 'list' ? 'list-style' : ''}`}>
        {filteredAndSortedProducts.map((product, i) => (
          <ProductCard key={product.id || product.uid || i} product={product} />
        ))}

        {isFetchingNextPage && <ProductSkeletonComponent item={4} />}
      </Row>

      <div ref={sentinelRef} style={{ height: 1, visibility: 'hidden' }} aria-hidden="true" />

      {/* End-of-list indicator once all pages are exhausted. */}
      {!hasNextPage && filteredAndSortedProducts.length > 0 && (
        <p
          className="text-center text-muted mt-4 mb-2"
          style={{ fontSize: '0.875rem', letterSpacing: '0.02em' }}
        >
          You&apos;ve seen all {filteredAndSortedProducts.length} products
        </p>
      )}
    </>
  );
};

export default CollectionProducts;

