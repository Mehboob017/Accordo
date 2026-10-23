import WrapperComponent from '@/components/common/WrapperComponent';
import OfferBanner from '@/components/parisTheme/OfferBanner';
import CollectionSidebar from '../collectionSidebar';
import MainCollection from '../mainCollection';

const CollectionLeftSidebar = ({ filter, setFilter, isFilterApplying = false }) => {
  return (
    <>
      {/* <WrapperComponent colProps={{ xs: 12 }}>
        <OfferBanner
          classes={{ customHoverClass: 'banner-contain hover-effect' }}
          imgUrl={themeOption?.collection?.collection_banner_image_url}
        />
      </WrapperComponent> */}
      <WrapperComponent
        classes={{ sectionClass: 'section-b-space shop-section' }}
        customCol={true}
      >
        <CollectionSidebar
          filter={filter}
          setFilter={setFilter}
          isFilterApplying={isFilterApplying}
        />
        <MainCollection
          filter={filter}
          setFilter={setFilter}
          isFilterApplying={isFilterApplying}
        />
      </WrapperComponent>
    </>
  );
};

export default CollectionLeftSidebar;
