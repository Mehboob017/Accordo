import { useContext } from 'react';
import { LeafSVG } from '@/components/common/CommonSVG';
import WrapperComponent from '@/components/common/WrapperComponent';
import ProductSection1 from '@/components/parisTheme/productSections/ProductSection1';
import ProductIdsContext from '@/helper/productIdsContext';
import { productPageRelatedSliderOptions } from '../../../data/SliderSettings';
import Btn from '@/elements/buttons/Btn';

const RelatedProduct = ({ productState, productData: productDataProp }) => {
  const { filteredProduct } = useContext(ProductIdsContext);

  // Use only dynamic sources: explicit prop first, then context products.
  const productData = productDataProp?.length
    ? productDataProp
    : filteredProduct?.length
      ? filteredProduct
      : [];

  if (!productData.length) {
    return null;
  }

  const dataAPI = {
    title: 'You May Also Like',
    description: 'Explore More Products',
    product_ids: productDataProp
      ? undefined
      : productState?.product?.related_products,
  };
  // Related products: show 4 items on desktop (and responsive), avoid cloning on API-provided lists
  const relatedProductSliderOption = {
    ...productPageRelatedSliderOptions,
    slidesToShow: 4,
    responsive: [
      { breakpoint: 1680, settings: { slidesToShow: 4 } },
      { breakpoint: 1200, settings: { slidesToShow: 3 } },
      { breakpoint: 992, settings: { slidesToShow: 2 } },
    ],
  };
  const sliderOption = productDataProp?.length
    ? { ...relatedProductSliderOption, infinite: false }
    : relatedProductSliderOption;
  return (
    <WrapperComponent
      classes={{
        sectionClass:
          'product-list-section related-product-section section-b-space',
      }}
      noRowCol={true}
      translate="no"
    >
      <ProductSection1
        dataAPI={dataAPI}
        ProductData={productData}
        svgUrl={<LeafSVG className="icon-width" />}
        noCustomClass={true}
        classObj={{
          productStyle: 'product-standard',
          productBoxClass: 'product-box-bg',
        }}
        customSliderOption={sliderOption}
        showNav={true}
        useHeroArrows={true}
        rightSlot={
          <div className="d-none d-lg-flex">
            <a href="/collections">
              <Btn color="primary" size="md" className="">
                View More
              </Btn>
            </a>
          </div>
        }
      />
      <div className="d-flex d-lg-none justify-content-center mt-4">
        <a href="/collections">
          <Btn color="primary" size="md" className="">
            View More
          </Btn>
        </a>
      </div>
    </WrapperComponent>
  );
};

export default RelatedProduct;
