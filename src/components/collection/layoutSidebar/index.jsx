import WrapperComponent from '@/components/common/WrapperComponent';
import MainCollection from '../mainCollection';
import LeftCategory from './LeftCategory';
import ProductCategory from '../collectionSlider/ProductCategory';

const LayoutSidebar = ({ filter, setFilter, isFilterApplying = false }) => {
  return (
    <>
      <WrapperComponent
        classes={{ sectionClass: 'section-b-space shop-section' }}
        customCol={true}
      >
        <ProductCategory filter={filter} setFilter={setFilter} />
        <LeftCategory filter={filter} setFilter={setFilter} />
        <MainCollection
          filter={filter}
          setFilter={setFilter}
          isFilterApplying={isFilterApplying}
        />
      </WrapperComponent>
    </>
  );
};

export default LayoutSidebar;
