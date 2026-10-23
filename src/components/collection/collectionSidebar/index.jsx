import { useCallback, useContext, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import CollectionFilter from './CollectionFilter';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import CollectionSidebarSkeleton from '@/components/common/skeletonLoader/collectionSidebarSkeleton';
import FilterRenderer from './FilterRenderer';
import { useCollectionFilters } from '@/utils/hooks/useCollectionFilters';
import {
  shouldUpdateFilterValues,
  updateSearchParamsWithFilters,
} from '../filterUtils';

const CollectionSidebar = ({
  filter,
  setFilter,
  isOffcanvas,
  basicStoreCard,
  rightSideClass,
  sellerClass,
  isAttributes = true,
  isFilterApplying = false,
  shouldSyncFilters = true,
}) => {
  const { collectionMobile, setCollectionMobile } =
    useContext(ThemeOptionContext);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState('1');
  const toggle = (id) => {
    if (open === id) {
      setOpen();
    } else {
      setOpen(id);
    }
  };
  const {
    filters: collectionFilters,
    isLoading,
    isError,
    errorMessage,
  } = useCollectionFilters(filter);

  const filterDefinitions = collectionFilters.definitions.filter(
    (definition) => definition?.key !== 'department'
  );

  const updateFilters = useCallback(
    (updater) => {
      const nextFilter = typeof updater === 'function' ? updater(filter) : updater;

      if (nextFilter === filter) {
        return;
      }

      // In draft mode (used by mobile offcanvas), we only update local state.
      // "Apply" will commit the draft to the real filter + URL.
      setFilter(nextFilter);

      if (shouldSyncFilters) {
        const nextSearchParams = updateSearchParamsWithFilters(
          searchParams,
          nextFilter,
          filterDefinitions
        );
        const queryString = nextSearchParams.toString();
        router.push(queryString ? `${pathname}?${queryString}` : pathname);
      }
    },
    [
      filter,
      filterDefinitions,
      pathname,
      router,
      searchParams,
      setFilter,
      shouldSyncFilters,
    ]
  );

  const handleFilterChange = useCallback(
    (filterKey, nextValues) => {
      const sanitizedValues = Array.isArray(nextValues)
        ? nextValues.filter(Boolean).map((value) => String(value))
        : [];

      updateFilters((prev) => {
        const currentValues = Array.isArray(prev?.[filterKey])
          ? prev[filterKey]
          : [];

        if (!shouldUpdateFilterValues(currentValues, sanitizedValues)) {
          return prev;
        }

        return {
          ...prev,
          [filterKey]: sanitizedValues,
        };
      });
    },
    [updateFilters]
  );

  return (
    <>
      {collectionMobile && (
        <div
          className="bg-overlay show"
          onClick={() => setCollectionMobile(false)}
        />
      )}
      <div
        className={`${sellerClass ? sellerClass : `col-custome-${isOffcanvas ? '12' : '3'}`} hide-scrollbar`}
      >
        <div
          className={`left-box ${rightSideClass ? rightSideClass : ''} ${collectionMobile ? 'show' : ''}`}
        >
          <div className="shop-left-sidebar">
            {/* <div
              className="back-button"
              onClick={() => setCollectionMobile((prev) => !prev)}
            >
              <h3>
                <a className="text-title">
                  <RiCloseFill />
                  <span>Back</span>
                </a>
              </h3>
            </div> */}
            {basicStoreCard && basicStoreCard}
            {isLoading && <CollectionSidebarSkeleton />}
            {isOffcanvas && (
              <CollectionFilter
                filter={filter}
                setFilter={setFilter}
                disabled={isFilterApplying}
                shouldSyncFilters={shouldSyncFilters}
              />
            )}
            {!isLoading && isError && !errorMessage && (
              <div className="filter-category">
                <div className="filter-title">
                  <h2>Filters</h2>
                </div>
                <p className="text-content mb-0">
                  {errorMessage || 'Unable to load filters right now.'}
                </p>
              </div>
            )}
            {!isLoading && filterDefinitions.length > 0 && (
              <FilterRenderer
                filters={filterDefinitions}
                filterState={filter}
                open={open}
                toggle={toggle}
                onFilterChange={handleFilterChange}
                disabled={isFilterApplying}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CollectionSidebar;
