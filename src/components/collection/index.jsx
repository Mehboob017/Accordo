'use client';
import { useContext, useMemo, useCallback, useState, useEffect } from 'react';
import { useIsFetching } from '@tanstack/react-query';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import MainCollectionSlider from './collectionSlider';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import Loader from '@/layout/loader';
import {
  COLLECTION_FILTER_DEFAULTS,
  parseCollectionFilters,
} from './filterUtils';

const CollectionContain = () => {
  const { themeOption, isLoading } = useContext(ThemeOptionContext);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  
  const isFetching = useIsFetching({ queryKey: ['products'] }) > 0;
  const isFilterApplying = isFetching || isNavigating;

  // Once the URL searchParams have successfully updated, the route transition is done.
  // We can turn off the optimistic loading state. The actual react-query fetch
  // will take over the loading state if it starts fetching.
  useEffect(() => {
    setIsNavigating(false);
  }, [searchParams]);

  const collectionLayout = themeOption?.collection?.collection_layout || 'collection_category_slider';

  // 1. DERIVE STATE DIRECTLY FROM URL (Fixes the double fetch)
  // useMemo ensures we only recalculate when the URL actually changes.
  const filter = useMemo(() => {
    const params = Object.fromEntries(searchParams.entries());
    if (!params.healthInterests && params.health_interest) {
      params.healthInterests = params.health_interest;
    }
    delete params.health_interest;

    return parseCollectionFilters(params);
  }, [searchParams]);

  // 2. PROXY SETFILTER TO UPDATE THE URL
  // If child components like CollectionSidebar still call setFilter({ ... }), 
  // this will intercept it and update the URL instead of duplicate local state.
  const setFilter = useCallback((newFilterData) => {
    setIsNavigating(true);
    const nextFilter = typeof newFilterData === 'function' ? newFilterData(filter) : newFilterData;
    const freshParams = new URLSearchParams(searchParams.entries());

    // Merge new filters into the URL params
    Object.keys(nextFilter).forEach(key => {
      if (nextFilter[key]) {
        freshParams.set(key, nextFilter[key]);
      } else {
        freshParams.delete(key);
      }
    });

    const queryString = freshParams.toString();
    // { scroll: false } prevents Next.js from aggressively scrolling to the top on every filter click
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [filter, pathname, router, searchParams]);

  const isCollectionMatch = {
    collection_category_slider: (
      <MainCollectionSlider
        filter={filter}
        setFilter={setFilter}
        isFilterApplying={isFilterApplying}
      />
    ),
    // collection_banner: (
    //   <CollectionBanner
    //     filter={filter}
    //     setFilter={setFilter}
    //     isFilterApplying={isFilterApplying}
    //   />
    // ),
    // collection_offcanvas_filter: (
    //   <CollectionOffCanvas
    //     filter={filter}
    //     setFilter={setFilter}
    //     isFilterApplying={isFilterApplying}
    //   />
    // ),
    // collection_no_sidebar: (
    //   <CollectionNoSidebar
    //     filter={filter}
    //     setFilter={setFilter}
    //     isFilterApplying={isFilterApplying}
    //   />
    // ),
    // collection_left_sidebar: (
    //   <CollectionLeftSidebar
    //     filter={filter}
    //     setFilter={setFilter}
    //     isFilterApplying={isFilterApplying}
    //   />
    // ),
    // collection_right_sidebar: (
    //   <CollectionRightSidebar
    //     filter={filter}
    //     setFilter={setFilter}
    //     isFilterApplying={isFilterApplying}
    //   />
    // ),
    // collection_3_grid: (
    //   <CollectionLeftSidebar
    //     filter={filter}
    //     setFilter={setFilter}
    //     isFilterApplying={isFilterApplying}
    //   />
    // ),
    // collection_4_grid: (
    //   <CollectionLeftSidebar
    //     filter={filter}
    //     setFilter={setFilter}
    //     isFilterApplying={isFilterApplying}
    //   />
    // ),
    // collection_5_grid: (
    //   <CollectionLeftSidebar
    //     filter={filter}
    //     setFilter={setFilter}
    //     isFilterApplying={isFilterApplying}
    //   />
    // ),
    // collection_list_view: (
    //   <CollectionLeftSidebar
    //     filter={filter}
    //     setFilter={setFilter}
    //     isFilterApplying={isFilterApplying}
    //   />
    // ),
  };
  const resolvedCollectionLayout = isCollectionMatch[collectionLayout]
    ? collectionLayout
    : 'collection_left_sidebar';

  if (isLoading) return <Loader />;
  return (
    <>
      {/* <Breadcrumb
        title={'Products'}
        subNavigation={[{ name: 'products' }]}
      /> */}
      {isCollectionMatch[resolvedCollectionLayout]}
    </>
  );
};

export default CollectionContain;
