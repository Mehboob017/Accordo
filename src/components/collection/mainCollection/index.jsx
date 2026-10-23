import { useContext, useEffect, useState, useRef } from 'react';
import FilterSort from './FilterSort';
import GridBox from './GridBox';
import CollectionProducts from './CollectionProducts';
import OfferBanner from '@/components/parisTheme/OfferBanner';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import FilterBtn from './FilterBtn';
import { useTranslation } from '@/utils/translations';
import { useCustomSearchParams } from '@/utils/hooks/useCustomSearchParams';
import { RiArrowLeftLine, RiFilterFill, RiSortAsc } from 'react-icons/ri';
import CollectionFilter from '../collectionSidebar/CollectionFilter';
import SelectedFilters from './SelectedFilters';
import SortDrawer from './SortDrawer';
import { Offcanvas, OffcanvasBody, OffcanvasHeader } from 'reactstrap';
import CollectionSidebar from '../collectionSidebar';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCollectionFilters } from '@/utils/hooks/useCollectionFilters';
import {
  getCollectionFilterResetState,
} from '../filterUtils';
import Loader from '@/layout/loader';

const MainCollection = ({
  filter,
  setFilter,
  isBanner,
  isOffcanvas,
  classicStoreCard,
  initialGrid = 3,
  noSidebar,
  sellerClass,
  isFilterApplying = false,
}) => {
  const [grid, setGrid] = useState(initialGrid);
  const { themeOption, setCollectionMobile, openOffCanvas, setOpenOffCanvas } = useContext(ThemeOptionContext);
  const { t } = useTranslation('common');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [draftFilter, setDraftFilter] = useState(filter);
  const { filters: collectionFilters } = useCollectionFilters(filter);
  const [layout] = useCustomSearchParams(['layout']);
  const sortDropdownRef = useRef(null);
  const [sortDrawerOpen, setSortDrawerOpen] = useState(false);

  const toggleFilterOffcanvas = () => {
    setOpenOffCanvas(!openOffCanvas);
  };

  const handleApply = () => {
    // Commit draft filter to the real filter + URL.
    // This will now instantly trigger the loading screen via the parent's setFilter.
    setFilter(draftFilter);
    setOpenOffCanvas(false);
  };

  const handleReset = () => {
    const nextFilter = getCollectionFilterResetState(
      filter,
      collectionFilters.definitions
    );

    setDraftFilter(nextFilter);
    setFilter(nextFilter);

    setOpenOffCanvas(false);
  };
  useEffect(() => {
    if (layout?.layout == 'collection_3_grid') {
      setGrid(3);
    } else if (layout?.layout == 'collection_4_grid') {
      setGrid(4);
    } else if (layout?.layout == 'collection_5_grid') {
      setGrid(5);
    } else if (layout?.layout == 'collection_list_view') {
      setGrid('list');
    }
  }, [layout]);

  useEffect(() => {
    if (openOffCanvas) {
      // Start editing from the currently applied filters.
      setDraftFilter(filter);
    }
  }, [openOffCanvas, filter]);

  // useEffect(() => {
  //   if (isFilterApplying) {
  //     console.log('[Performance] isFilterApplying changed to TRUE');
  //     try {
  //       console.timeLog('filterApply', '[Performance] isFilterApplying became true (loading screen shown)');
  //     } catch (e) {}
  //   } else {
  //     console.log('[Performance] isFilterApplying changed to FALSE');
  //     try {
  //       console.timeEnd('filterApply');
  //     } catch (e) {}
  //   }
  // }, [isFilterApplying]);
  return (
    <div
      className={`${sellerClass ? sellerClass : `col-custome-${isOffcanvas || noSidebar ? '12' : '9'}`} mobile-collection-wrapper`}
    >
      {isFilterApplying && (
        <div className="collection-fullpage-loader">
          <Loader />
        </div>
      )}
      {classicStoreCard && classicStoreCard}
      {isBanner && themeOption?.collection?.collection_banner_image_url && (
        <OfferBanner
          classes={{ customHoverClass: 'banner-contain hover-effect mb-4' }}
          imgUrl={themeOption?.collection?.collection_banner_image_url}
        />
      )}
      <div className="show-button">
        {/* <div className="filter-button-group mt-0">
          <div
            className="filter-button d-inline-block d-lg-none"
            onClick={() => setCollectionMobile((prev) => !prev)}
          >
            <a>
              <RiFilterFill /> {t('FilterMenu')}
            </a>
          </div>
        </div> */}
        <div className={`top-filter-menu${isOffcanvas ? '-2' : ''}`}>
          <div className="left-filter-content">
            <FilterBtn isOffcanvas={isOffcanvas} disabled={isFilterApplying} />
            <SelectedFilters
              filter={filter}
              setFilter={setFilter}
              disabled={isFilterApplying}
            />
          </div>
          {/* <GridBox grid={grid} setGrid={setGrid} /> */}
          {/* <CollectionFilter filter={filter} setFilter={setFilter} /> */}
          <FilterSort
            ref={sortDropdownRef}
            filter={filter}
            setFilter={setFilter}
            disabled={isFilterApplying}
          />
        </div>
      </div>
      <div className="collection-products-wrapper" style={{ position: 'relative' }}>
        {isFilterApplying && (
          <div className="collection-loader-overlay">
            <Loader />
          </div>
        )}
        <CollectionProducts filter={filter} grid={grid} />
      </div>
      {/* Mobile Filter and Sort Buttons - Fixed at Bottom */}
      <div className="mobile-filter-sort-buttons d-lg-none">
        <button
          className="mobile-sort-btn"
          onClick={() => setSortDrawerOpen(true)}
          disabled={isFilterApplying}
        >
          <RiSortAsc className="btn-icon" />
          <span>{t('Sort')}</span>
        </button>
        <button
          className="mobile-filter-btn"
          onClick={toggleFilterOffcanvas}
          disabled={isFilterApplying}
        >
          <RiFilterFill className="btn-icon" />
          <span>{t('FilterMenu')}</span>
        </button>
      </div>
      {/* Sort Drawer */}
      <SortDrawer
        isOpen={sortDrawerOpen}
        toggle={() => setSortDrawerOpen(false)}
        filter={filter}
        setFilter={setFilter}
        disabled={isFilterApplying}
      />
      {/* Filter Offcanvas - Fullscreen on Mobile */}
      <Offcanvas
        toggle={toggleFilterOffcanvas}
        isOpen={openOffCanvas}
        className="shop-offcanvas-filter shop-offcanvas-filter-fullscreen"
        direction="start"
      >
        <OffcanvasHeader
          toggle={toggleFilterOffcanvas}
          close={
            <button
              type="button"
              className="btn-close"
              aria-label={t('FilterMenu')}
              onClick={toggleFilterOffcanvas}
            >
              <RiArrowLeftLine />
            </button>
          }
        >
          {t('FilterMenu')}
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
            Apply
          </button>
        </div>
      </Offcanvas>
    </div>
  );
};

export default MainCollection;
