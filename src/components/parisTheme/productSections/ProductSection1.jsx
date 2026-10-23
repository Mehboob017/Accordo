import { useMemo, useRef } from 'react';
import { Col, Row } from 'reactstrap';
import Slider from 'react-slick';
import CustomHeading from '@/components/common/CustomHeading';
import { productSliderOption } from '../../../data/SliderSettings';
import ProductBox1 from '@/components/common/productBox/productBox1/ProductBox1';
import { RiArrowLeftLine, RiArrowRightLine } from 'react-icons/ri';

const ProductSection1 = ({
  dataAPI,
  ProductData,
  svgUrl,
  noCustomClass = false,
  customClass,
  classObj,
  customSliderOption = productSliderOption,
  isHeadingVisible = true,
  showNav = false,
  useHeroArrows = false,
  rightSlot,
}) => {
  const filterProduct = useMemo(() => {
    return ProductData?.filter((el) =>
      dataAPI?.product_ids ? dataAPI?.product_ids?.includes(el.id) : el
    );
  }, [ProductData, dataAPI]);

  const sliderRef = useRef(null);
  const sliderOption = useMemo(
    () => ({
      ...customSliderOption,
      arrows: useHeroArrows ? true : false,
    }),
    [customSliderOption, useHeroArrows]
  );

  const desktopNavButtons = showNav && !useHeroArrows ? (
    <div className="d-none d-md-flex align-items-center gap-2">
      <button
        type="button"
        className="slider-nav-btn"
        onClick={() => sliderRef.current?.slickPrev()}
        aria-label="Previous"
      >
        <RiArrowLeftLine />
      </button>
      <button
        type="button"
        className="slider-nav-btn"
        onClick={() => sliderRef.current?.slickNext()}
        aria-label="Next"
      >
        <RiArrowRightLine />
      </button>
    </div>
  ) : null;

  const mobileNavButtons = showNav && !useHeroArrows ? (
    <>
      <button
        type="button"
        className="d-flex d-md-none slider-nav-btn position-absolute top-50 start-0 translate-middle-y"
        onClick={() => sliderRef.current?.slickPrev()}
        aria-label="Previous"
      >
        <RiArrowLeftLine />
      </button>
      <button
        type="button"
        className="d-flex d-md-none slider-nav-btn position-absolute top-50 end-0 translate-middle-y"
        onClick={() => sliderRef.current?.slickNext()}
        aria-label="Next"
      >
        <RiArrowRightLine />
      </button>
    </>
  ) : null;
  return (
    <>
      {isHeadingVisible ? (
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 title">
          <CustomHeading
            title={dataAPI?.title}
            svgUrl={svgUrl}
            subTitle={dataAPI?.description}
            customClass={customClass || (noCustomClass ? '' : 'mb-0')}
          />
          {(rightSlot || desktopNavButtons) && (
            <div className="d-flex align-items-center gap-2">
              {rightSlot}
              {desktopNavButtons}
            </div>
          )}
        </div>
      ) : null}
      <div className={`${classObj?.productStyle} mt-4 position-relative ${useHeroArrows ? 'hero-carousel-section' : ''}`}>
        <div className={useHeroArrows ? '' : 'no-arrow'}>
          <Slider ref={sliderRef} {...sliderOption}>
            {filterProduct?.map((elem) => (
              <div key={elem?.id}>
                <Row className="m-0 h-100">
                  <Col xs={12} className="px-0 h-100">
                    <ProductBox1
                      imgUrl={elem?.product_thumbnail}
                      productDetail={{ ...elem }}
                      classObj={classObj}
                    />
                  </Col>
                </Row>
              </div>
            ))}
          </Slider>
        </div>
        {mobileNavButtons}
      </div>
    </>
  );
};

export default ProductSection1;
