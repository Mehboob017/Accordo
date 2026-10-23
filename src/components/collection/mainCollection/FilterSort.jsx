import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { filterSort } from '../../../data/Custom';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import CustomDropdown from '../../common/CustomDropdown';
import { mapCollectionSortToApiSort } from '../filterUtils';

const FilterSort = forwardRef(({ filter, setFilter, disabled = false }, ref) => {
  const dropdownRef = useRef(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Expose click method to parent via ref
  useImperativeHandle(ref, () => ({
    click: () => {
      dropdownRef.current?.click?.();
    },
  }));

  // Set default to "relevance" on initial load if no sort exists
  useEffect(() => {
    const currentSort = searchParams.get('sort');

    if (!currentSort && !filter?.sortBy && !disabled) {
      // Update local state
      setFilter((prev) => ({
        ...prev,
        sortBy: 'relevance',
        field: '',
      }));

      // Update URL parameters without pushing a new history entry
      const params = new URLSearchParams(searchParams.toString());
      const apiSort = mapCollectionSortToApiSort('relevance');

      if (apiSort) {
        params.set('sort', apiSort);
      }

      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    }
  }, []);

  const handleSort = (data) => {
    if (disabled) {
      return;
    }

    setFilter((prev) => {
      return {
        ...prev,
        sortBy: data.value,
        field: '',
      };
    });

    // Preserve all existing query parameters
    const params = new URLSearchParams(searchParams.toString());
    
    // Update or set sort parameters
    const apiSort = mapCollectionSortToApiSort(data.value);
    if (apiSort) {
      params.set('sort', apiSort);
    } else {
      params.delete('sort');
    }
    params.delete('sortBy');
    params.delete('field');
    
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const sortOptions = filterSort.map((elem) => ({
    label: elem.label,
    value: elem.value,
  }));

  return (
    <div className="category-dropdown">
      <h5 className="text-content mb-0">Sort By</h5>
      <div style={{ width: 250 }}>
        <CustomDropdown
          ref={dropdownRef}
          label=""
          triggerId="sort-by-dropdown"
          value={filter?.sortBy || 'relevance'}
          options={sortOptions}
          // placeholder={"Recommended"}
          disabled={disabled}
          onChange={(value) => {
            const selected = filterSort.find((elem) => elem.value == value);
            if (selected) handleSort(selected);
          }}
        />
      </div>
    </div>
  );
});

FilterSort.displayName = 'FilterSort';

export default FilterSort;
