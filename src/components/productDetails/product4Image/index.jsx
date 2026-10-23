import { Col, Row } from 'reactstrap';
import WrapperComponent from '@/components/common/WrapperComponent';
import ProductDetailsTab from '../common/ProductDetailsTab';
import MainProductContent from '../common/MainProductContent';
import ProductThumbnailSlider from '../productThumbnail/ProductThumbnailSlider';
import ProductFaqSection from '../common/ProductFaqSection';
import ProductReviewShowcase from '../common/ProductReviewShowcase';

const Product4Image = ({ productState, setProductState }) => {
  return (
    <>
      <WrapperComponent
        classes={{ sectionClass: 'product-section ', row: 'g-5' }}
        customCol={true}
      >
        <Col xl={6}>
          <div className="product-left-box position-sticky top-0">
            <Row className="g-sm-4 g-2">
              <ProductThumbnailSlider
                productState={productState}
                setProductState={setProductState}
              />
            </Row>
          </div>
        </Col>
        <MainProductContent
          productState={productState}
          setProductState={setProductState}
        />
        <ProductDetailsTab productState={productState} />
      </WrapperComponent>
      <ProductReviewShowcase />
      <ProductFaqSection />
    </>
  );
};

export default Product4Image;
