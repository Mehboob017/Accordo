import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/utils/translations';
import { RiCloseLine } from 'react-icons/ri';
import {
  createCollectionFilterValueLabelMap,
  getCollectionFilterResetState,
  getSelectedFilterEntries,
  updateSearchParamsWithFilters,
} from '../filterUtils';
import { useCollectionFilters } from '@/utils/hooks/useCollectionFilters';

const SelectedFilters = ({ filter, setFilter, disabled = false }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation('common');
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
      const nextSearchParams = updateSearchParamsWithFilters(
        searchParams,
        nextFilter,
        collectionFilters.definitions
      );
      const queryString = nextSearchParams.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [collectionFilters.definitions, pathname, router, searchParams, setFilter]
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

  const clearFilters = useCallback(() => {
    syncFilters(getCollectionFilterResetState(filter, collectionFilters.definitions));
  }, [collectionFilters.definitions, filter, syncFilters]);

  if (selectedFilters.length <= 0) return null;

  return (
    <div className="selected-filters-inline">
      <div className="selected-filters-header d-none d-lg-flex">
        <h5 className="text-content mb-0">{t('Filters')}</h5>
        <button className="clear-btn" onClick={clearFilters} disabled={disabled}>
          {t('ClearAll')}
        </button>
      </div>
      <div className="selected-filters-content">
        <ul>
          {selectedFilters?.map((elem, i) => (
            <li key={`${elem.key}-${elem.value}-${i}`}>
              <a>{elem.label}</a>
              <span
                onClick={() => !disabled && removeParams(elem)}
                aria-disabled={disabled}
                style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }}
              >
                <RiCloseLine />
              </span>
            </li>
          ))}
        </ul>
        <button className="clear-btn d-lg-none" onClick={clearFilters} disabled={disabled}>
          {t('ClearAll')}
        </button>
      </div>
    </div>
  );
};

export default SelectedFilters;

