import React from 'react';
import { Offcanvas, OffcanvasBody, OffcanvasHeader } from 'reactstrap';
import { filterSort } from '../../../data/Custom';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { mapCollectionSortToApiSort } from '../filterUtils';

const SortDrawer = ({ isOpen, toggle, filter, setFilter, disabled = false }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

    const params = new URLSearchParams(searchParams.toString());
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
    toggle(); // Close drawer after selection
  };

  return (
    <Offcanvas
      isOpen={isOpen}
      toggle={toggle}
      direction="bottom"
      className="sort-drawer bottom-offcanvas"
      style={{ height: 'auto', maxHeight: '70vh' }}
    >
      <OffcanvasHeader toggle={toggle} className="sort-drawer-header">
        <h5>Sort</h5>
      </OffcanvasHeader>
      <OffcanvasBody className="sort-drawer-body">
        <div className="sort-options">
          {filterSort.map((elem, i) => {
            const IconComponent = elem.icon;
            return (
              <button
                key={i}
                className={`sort-option-item ${
                  filter.sortBy === elem.value ? 'active' : ''
                }`}
                onClick={() => handleSort(elem)}
                disabled={disabled}
              >
                <div className="sort-option-left">
                  {IconComponent && (
                    <span className="sort-option-icon">
                      <IconComponent />
                    </span>
                  )}
                  <span className="sort-option-label">{elem.label}</span>
                </div>

                {filter.sortBy === elem.value && (
                  <span className="sort-option-check">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </OffcanvasBody>
    </Offcanvas>
  );
};

export default SortDrawer;

