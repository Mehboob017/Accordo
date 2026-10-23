import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { RiCloseLine } from 'react-icons/ri';
import {
  createCollectionFilterValueLabelMap,
  getCollectionFilterResetState,
  getSelectedFilterEntries,
  updateSearchParamsWithFilters,
} from '../filterUtils';
import { useCollectionFilters } from '@/utils/hooks/useCollectionFilters';

const CollectionFilter = ({
  filter,
  setFilter,
  disabled = false,
  shouldSyncFilters = true,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { filters: collectionFilters } = useCollectionFilters(filter);
  const filterLabelMap = useMemo(
    () => createCollectionFilterValueLabelMap(collectionFilters.definitions),
    [collectionFilters.definitions]
  );
  const selectedFilters = useMemo(
    () =>
      getSelectedFilterEntries(
        filter,
        filterLabelMap,
        collectionFilters.definitions
      ),
    [collectionFilters.definitions, filter, filterLabelMap]
  );

  const syncFilters = useCallback(
    (nextFilter) => {
      setFilter(nextFilter);
      if (shouldSyncFilters) {
        const nextSearchParams = updateSearchParamsWithFilters(
          searchParams,
          nextFilter,
          collectionFilters.definitions
        );
        const queryString = nextSearchParams.toString();
        router.push(queryString ? `${pathname}?${queryString}` : pathname);
      }
    },
    [
      collectionFilters.definitions,
      pathname,
      router,
      searchParams,
      setFilter,
      shouldSyncFilters,
    ]
  );

  const removeParams = useCallback(
    ({ key, value }) => {
      syncFilters({
        ...filter,
        [key]: (Array.isArray(filter?.[key]) ? filter[key] : []).filter(
          (item) => item !== value
        ),
      });
    },
    [filter, syncFilters]
  );

  const clearParams = useCallback(() => {
    syncFilters(
      getCollectionFilterResetState(filter, collectionFilters.definitions)
    );
  }, [collectionFilters.definitions, filter, syncFilters]);

  if (selectedFilters.length <= 0) return null;
  return (
    <div className="filter-category">
      <div className="filter-title">
        <h2>Filters</h2>
        <a
          onClick={() => !disabled && clearParams()}
          aria-disabled={disabled}
          style={{
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
          }}
        >
          Clear All
        </a>
      </div>
      <ul className="hide-scrollbar">
        {selectedFilters?.map((elem, i) => (
          <li key={`${elem.key}-${elem.value}-${i}`}>
            <a>{elem.label}</a>
            <span
              onClick={() => !disabled && removeParams(elem)}
              aria-disabled={disabled}
              style={{
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
              }}
            >
              <RiCloseLine />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CollectionFilter;
