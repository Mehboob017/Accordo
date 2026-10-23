// import CollectionSlider from './CollectionSlider';
import WrapperComponent from '@/components/common/WrapperComponent';
import CollectionSidebar from '../collectionSidebar';
import MainCollection from '../mainCollection';
import ProductCategory from './ProductCategory';
import { translate } from './../../../utils/translations/index';

const MainCollectionSlider = ({ filter, setFilter }) => {
  return (
    <>
      {/* <CollectionSlider filter={filter} setFilter={setFilter} /> */}
      <ProductCategory filter={filter} setFilter={setFilter} />
      <WrapperComponent
        classes={{ sectionClass: 'section-b-space shop-section' }}
        customCol={true}
        translate="no"
      >
        <CollectionSidebar filter={filter} setFilter={setFilter} />
        <MainCollection filter={filter} setFilter={setFilter} />
      </WrapperComponent>
    </>
  );
};

export default MainCollectionSlider;
