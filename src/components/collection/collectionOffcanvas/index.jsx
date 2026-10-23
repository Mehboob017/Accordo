import { useContext, useEffect, useState } from 'react';
import { Offcanvas, OffcanvasBody, OffcanvasHeader } from 'reactstrap';
import WrapperComponent from '@/components/common/WrapperComponent';
import MainCollection from '../mainCollection';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import CollectionSidebar from '../collectionSidebar';
import { useTranslation } from '@/utils/translations';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { RiArrowLeftLine } from 'react-icons/ri';
import {
  COLLECTION_FILTER_DEFAULTS,
  updateSearchParamsWithFilters,
} from '../filterUtils';

const CollectionOffCanvas = ({ filter, setFilter, isFilterApplying = false }) => {
  const { t } = useTranslation('common');
  const { openOffCanvas, setOpenOffCanvas } = useContext(ThemeOptionContext);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [draftFilter, setDraftFilter] = useState(filter);
  const toggle = () => {
    setOpenOffCanvas(!openOffCanvas);
  };

  const handleApply = () => {
    setFilter(draftFilter);

    const nextSearchParams = updateSearchParamsWithFilters(
      searchParams,
      draftFilter
    );
    const queryString = nextSearchParams.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);

    setOpenOffCanvas(false);
  };

  const handleReset = () => {
    const nextFilter = {
      ...COLLECTION_FILTER_DEFAULTS,
      sortBy: filter?.sortBy || '',
      field: filter?.field || '',
    };

    setDraftFilter(nextFilter);
    setFilter(nextFilter);

    const nextSearchParams = updateSearchParamsWithFilters(searchParams, nextFilter);
    const queryString = nextSearchParams.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);

    setOpenOffCanvas(false);
  };

  useEffect(() => {
    if (openOffCanvas) {
      setDraftFilter(filter);
    }
  }, [openOffCanvas, filter]);
  return (
    <>
      <WrapperComponent
        classes={{ sectionClass: 'section-b-space shop-section' }}
        customCol={true}
      >
        <MainCollection
          filter={filter}
          setFilter={setFilter}
          isOffcanvas={true}
          isFilterApplying={isFilterApplying}
        />
      </WrapperComponent>
      <Offcanvas
        toggle={toggle}
        isOpen={openOffCanvas}
        className="shop-offcanvas-filter"
      >
        <OffcanvasHeader
          toggle={toggle}
          close={
            <button
              type="button"
              className="btn-close"
              aria-label={t('Back')}
              onClick={toggle}
            >
              <RiArrowLeftLine />
            </button>
          }
        >
          {t('Back')}
        </OffcanvasHeader>
        <OffcanvasBody>
          <CollectionSidebar
            filter={draftFilter}
            setFilter={setDraftFilter}
            isOffcanvas={true}
            isFilterApplying={isFilterApplying}
            shouldSyncFilters={false}
          />
        </OffcanvasBody>
        <div className="shop-offcanvas-filter-footer" aria-hidden={false}>
          <button
            type="button"
            className="shop-offcanvas-filter-btn shop-offcanvas-filter-reset"
            onClick={handleReset}
            disabled={isFilterApplying}
          >
            Reset
          </button>
          <button
            type="button"
            className="shop-offcanvas-filter-btn shop-offcanvas-filter-apply"
            onClick={handleApply}
            disabled={isFilterApplying}
          >
            {t('Apply')}
          </button>
        </div>
      </Offcanvas>
    </>
  );
};

export default CollectionOffCanvas;
