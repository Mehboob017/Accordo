import React, { useContext } from 'react';
import WrapperComponent from '@/components/common/WrapperComponent';
import OfferBanner from '@/components/parisTheme/OfferBanner';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import CollectionSidebar from '../collectionSidebar';
import MainCollection from '../mainCollection';

const CollectionRightSidebar = ({ filter, setFilter, isFilterApplying = false }) => {
  const { themeOption } = useContext(ThemeOptionContext);
  return (
    <>
      <WrapperComponent colProps={{ xs: 12 }}>
        <OfferBanner
          classes={{ customHoverClass: 'banner-contain hover-effect' }}
          imgUrl={themeOption?.collection?.collection_banner_image_url}
        />
      </WrapperComponent>
      <WrapperComponent
        classes={{ sectionClass: 'section-b-space shop-section' }}
        customCol={true}
      >
        <MainCollection
          filter={filter}
          setFilter={setFilter}
          isFilterApplying={isFilterApplying}
        />
        <CollectionSidebar
          filter={filter}
          setFilter={setFilter}
          rightSideClass="right-box"
          isFilterApplying={isFilterApplying}
        />
      </WrapperComponent>
    </>
  );
};

export default CollectionRightSidebar;
