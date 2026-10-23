import { useEffect, useMemo, useRef, useState } from 'react';
import { Col } from 'reactstrap';
import Slider from 'react-slick';
import ProductBadge from '../ProductBagde';
import { useProductModal } from '@/utils/hooks/useProduct';
import { useImagePreload } from '@/utils/hooks/useImagePreload';
import { getOptimizedCdnImageUrl } from '@/utils/helpers';

// ------------------------------------------------------------------
// Single image slot with smooth preload via useImagePreload
// ------------------------------------------------------------------
const ModalSliderImage = ({
  src,
  alt,
  isThumb = false,
  width,
  height,
}) => {
  const imgWidth = width || (isThumb ? 200 : 600);
  const imgHeight = height || (isThumb ? 200 : 600);
  const optimizedSrc = getOptimizedCdnImageUrl(src, imgWidth, imgHeight, 80);

  const { resolvedSrc, isLoading } = useImagePreload(optimizedSrc, {
    fallbackSrc: null,
  });

  return (
    <div className="variation-modal__img-wrap" style={{ aspectRatio: 1 }}>
      {isLoading && (
        <div
          className={`variation-modal__img-skeleton${isThumb ? ' variation-modal__img-skeleton--thumb' : ''}`}
        />
      )}
      {!isLoading && (
        <img
          src={resolvedSrc || ''}
          className="img-fluid"
          alt={alt || ''}
          width={imgWidth}
          height={imgHeight}
          loading="lazy"
          decoding="async"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
    </div>
  );
};

// ------------------------------------------------------------------
// Loading skeleton shown while /productModal API is in-flight
// ------------------------------------------------------------------
const SliderSkeleton = () => (
  <div className="variation-modal__slider-skeleton">
    <div className="variation-modal__img-skeleton variation-modal__img-skeleton--main" />
    <div className="variation-modal__thumbs-skeleton">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="variation-modal__img-skeleton variation-modal__img-skeleton--thumb"
        />
      ))}
    </div>
  </div>
);

// ------------------------------------------------------------------
// Thumbnail slider settings — left-aligned, never centered
// ------------------------------------------------------------------
const THUMB_SLIDER_SETTINGS = {
  slidesToShow: 4,
  slidesToScroll: 1,
  focusOnSelect: true,
  dots: false,
  infinite: true,
  centerMode: false,
  variableWidth: false,
  swipeToSlide: true,
  arrows: false,
};

// ------------------------------------------------------------------
// Main component
// ------------------------------------------------------------------
const LeftSideModal = ({ cloneVariation, productObj }) => {
  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  const slider1 = useRef(null);
  const slider2 = useRef(null);

  const product = cloneVariation?.product ?? productObj;
  const productUid = product?.uid ?? product?.id;

  const { data: modalData, isLoading: isModalLoading } =
    useProductModal(productUid);

  // Prefer enriched data from API; fall back to whatever is in cloneVariation
  const enrichedProduct = modalData?.data?.product ?? product;

  // console.log({ enrichedProduct });

  // Build ordered images array + a map of variantUid → slide index
  const { images, variantImageIndexMap } = useMemo(() => {
    const p = enrichedProduct;
    const result = [];
    const map = {};

    // 1. Product-level coverImage (always first)
    const productCover = p?.coverImage;
    if (productCover) {
      result.push({ url: productCover, alt: p?.coverImageAlt ?? p?.name ?? '' });
    }

    // 2. Variant-specific coverImages (skip duplicates / nulls)
    const seenUrls = new Set(productCover ? [productCover] : []);
    const variants = Array.isArray(p?.productVariants) ? p.productVariants : [];
    variants.forEach((variant) => {
      const img = variant?.coverImage;
      if (img && !seenUrls.has(img)) {
        map[variant.uid] = result.length;
        result.push({ url: img, alt: variant.name ?? p?.name ?? '' });
        seenUrls.add(img);
      }
    });

    // 3. productFiles of type 'image'
    const files = Array.isArray(p?.productFiles) ? p.productFiles : [];
    files.forEach((file) => {
      if (file?.type === 'image' && file?.path && !seenUrls.has(file.path)) {
        result.push({ url: file.path, alt: p?.name ?? '' });
        seenUrls.add(file.path);
      }
    });

    // Fallback: show placeholder when no images exist
    // if (result.length === 0) {
    //   result.push({ url: placeHolderImage, alt: p?.name ?? '' });
    // }

    return { images: result, variantImageIndexMap: map };
  }, [enrichedProduct]);

  // Connect nav sliders once the API finishes (sliders are in the DOM by then)
  useEffect(() => {
    if (!isModalLoading) {
      setNav1(slider1.current);
      setNav2(slider2.current);
    }
  }, [isModalLoading]);

  // Navigate main slider to the selected variant's image
  const selectedVariationUid =
    cloneVariation?.selectedVariation?.uid ??
    cloneVariation?.selectedVariation?.id ??
    null;

  useEffect(() => {
    if (!selectedVariationUid || !slider1.current) return;
    const idx = variantImageIndexMap[selectedVariationUid];
    if (idx !== undefined) {
      slider1.current.slickGoTo(idx, false);
    }
  }, [selectedVariationUid, variantImageIndexMap]);

  const productName = product?.name;

  return (
    <Col lg="6" className="position-relative" style={{ marginTop: '12px' }}>
      <ProductBadge productDetail={productObj} />

      {isModalLoading ? (
        <SliderSkeleton />
      ) : (
        <>
          <div className="view-image-slider">
            <Slider
              infinite={images.length > 1}
              slidesToShow={1}
              asNavFor={nav2}
              ref={(slider) => {
                slider1.current = slider;
              }}
            >
              {images.map((item, i) => (
                <div
                  className="slider-image variation-modal__main-image"
                  key={i}
                >
                  <ModalSliderImage
                    src={item.url}
                    alt={item.alt || productName}
                    isThumb={false}
                    width={600}
                    height={600}
                  />
                </div>
              ))}
            </Slider>
          </div>

          {/* Removed the images.length > 1 condition so it always renders */}
          <div className="thumbnail-slider">
            <Slider
              {...THUMB_SLIDER_SETTINGS}
              // Override settings dynamically based on image count to prevent layout breakage
              infinite={images.length > 1}
              slidesToShow={4}
              asNavFor={nav1}
              ref={(slider) => {
                slider2.current = slider;
              }}
            >
              {images.map((item, i) => (
                <div
                  className="slider-image variation-modal__thumb-image"
                  key={i}
                >
                  <div className="thumbnail-image">
                    <ModalSliderImage
                      src={item.url}
                      alt={item.alt || productName}
                      isThumb
                      width={200}
                      height={200}
                    />
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </>
      )}
    </Col>
  );
};

export default LeftSideModal;