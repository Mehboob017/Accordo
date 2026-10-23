'use client';

import { memo, useMemo, useRef, useState } from 'react';
import { Col, Row } from 'reactstrap';
import Slider from 'react-slick';
import { RiCalendarLine } from 'react-icons/ri';
import WrapperComponent from '@/components/common/WrapperComponent';
import CustomHeading from '@/components/common/CustomHeading';
import { LeafSVG } from '@/components/common/CommonSVG';
import HerbCard from '@/components/herbs/HerbCard';
import Btn from '@/elements/buttons/Btn';
import Loader from '@/layout/loader';
import { useHerbDetail } from '@/utils/hooks/useHerbs';
import { formatDate, getOptimizedCdnImageUrl } from '@/utils/helpers';
import ProductBox1 from '@/components/common/productBox/productBox1/ProductBox1';
import useImagePreload from '@/utils/hooks/useImagePreload';
import { placeHolderImage } from '@/data/CommonPath';
import { normalizeProductForCard } from '@/utils/fallbackProducts';

const PreloadedHerbThumbImage = memo(({ src, alt }) => {
  const thumbSrc = getOptimizedCdnImageUrl(src, 150, 150, 80);
  const { resolvedSrc, isLoaded, isError } = useImagePreload(thumbSrc, {
    fallbackSrc: placeHolderImage,
  });

  return (
    <div className={`preload-media-frame preload-media-frame--thumb ${isLoaded ? 'is-loaded' : 'is-loading'}`}>
      {!isLoaded && !isError ? (
        <span className="preload-media-skeleton" aria-hidden="true" />
      ) : null}

      {isLoaded ? (
        <img
          src={resolvedSrc}
          alt={alt}
          width={150}
          height={150}
          className="img-fluid preload-media-image"
          loading="lazy"
          decoding="async"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : null}

      {isError ? (
        <span className="preload-media-error">Image unavailable</span>
      ) : null}
    </div>
  );
});

PreloadedHerbThumbImage.displayName = 'PreloadedHerbThumbImage';

const PreloadedHerbMainImage = memo(({ src, alt }) => {
  const mainSrc = getOptimizedCdnImageUrl(src, 800, 800, 80);
  const { resolvedSrc, isLoaded, isError } = useImagePreload(mainSrc, {
    fallbackSrc: placeHolderImage,
  });

  return (
    <div className={`preload-media-frame preload-media-frame--main ${isLoaded ? 'is-loaded' : 'is-loading'}`}>
      {!isLoaded && !isError ? (
        <span className="preload-media-skeleton" aria-hidden="true" />
      ) : null}

      {isLoaded ? (
        <div className="preload-media-reveal">
          <img
            src={resolvedSrc}
            alt={alt}
            height={800}
            width={800}
            className="img-fluid"
            loading="lazy"
            decoding="async"
            draggable={false}
            style={{
              width: '100%',
              maxHeight: '580px',
              // height: '100%',
              // objectFit: 'contain',
              marginInline: 'auto',
            }}
          />
        </div>
      ) : null}

      {isError ? (
        <span className="preload-media-error">Image unavailable</span>
      ) : null}
    </div>
  );
});

PreloadedHerbMainImage.displayName = 'PreloadedHerbMainImage';

const HerbDetailContent = ({ herbSlug }) => {
  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  const slider1 = useRef();
  const slider2 = useRef();

  // Use React Query hook to fetch herb data
  const { data: herbResponse, isLoading, error } = useHerbDetail(herbSlug);

  // Slider settings for main image
  const mainSliderSettings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoHeight: false,
    arrows: true,
    infinite: false,
    asNavFor: nav2,
  };

  // Slider settings for thumbnail navigation
  const thumbSliderSettings = {
    slidesToShow: 5,
    slidesToScroll: 1,
    asNavFor: nav1,
    dots: false,
    focusOnSelect: true,
    infinite: true,
    arrows: false,
    vertical: true,
    verticalSwiping: false,
    centerMode: false,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 5,
        },
      },
      {
        breakpoint: 576,
        settings: {
          vertical: false,
          slidesToShow: 4,
        },
      },
    ],
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error || !herbResponse?.success || !herbResponse?.data?.herb) {
    return (
      <WrapperComponent classes={{ sectionClass: 'section-b-space' }}>
        <div className="text-center py-5">
          <h2>Herb Not Found</h2>
          <p className="mt-3">
            {error?.message || 'The herb you are looking for does not exist.'}
          </p>
          <a href="/herbs">
            <Btn type="button" color="primary" className="btn btn-md mt-3 mx-auto">
              Browse All Herbs
            </Btn>
          </a>
        </div>
      </WrapperComponent>
    );
  }

  const { herb, otherHerbs, relatedProducts } = herbResponse.data;

  // Prepare images array (coverImage + herbImages)
  const allImages = useMemo(() => {
    const items = [
      {
        uid: 'cover',
        image: herb?.coverImage,
        imageAlt: herb?.coverImageAlt || herb?.name,
      },
      ...(Array.isArray(herb?.herbImages) ? herb.herbImages : []),
    ];

    const seen = new Set();

    const uniqueImages = items
      .filter((item) => String(item?.image || '').trim())
      .filter((item) => {
        const key = String(item.image).trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((item, index) => ({
        ...item,
        uid: item?.uid || `herb-image-${index + 1}`,
      }));

    if (!uniqueImages.length) {
      return [
        {
          uid: 'herb-placeholder',
          image: placeHolderImage,
          imageAlt: herb?.name || 'Herb image',
        },
      ];
    }

    return uniqueImages;
  }, [herb?.coverImage, herb?.coverImageAlt, herb?.name, herb?.herbImages]);

  // Transform other herbs for HerbCard component
  const transformedOtherHerbs = (otherHerbs || []).map((h) => ({
    id: h.uid,
    slug: h.slug,
    name: h.name,
    subtitle: h.subtitle,
    coverImage: h.coverImage,
    coverImageAlt: h.coverImageAlt || h.name,
    shortDescription:
      h.subtitle || h.herbInfos?.[0]?.description?.split('\n')[0] || '',
    herbInfos: h.herbInfos || [],
    verifiedFlag: h.verifiedFlag,
    status: h.status,
    created_at: h.created_at,
  }));

  const normalizedRelatedProducts = useMemo(
    () =>
      (Array.isArray(relatedProducts) ? relatedProducts : [])
        .map((product) => normalizeProductForCard(product))
        .filter(Boolean),
    [relatedProducts]
  );

  return (
    <>
      {/* Main Content Section - Image Slider Left, Description Right */}
      <WrapperComponent
        classes={{
          sectionClass: 'product-section section-b-space',
          row: 'g-5',
        }}
        customCol={true}
      >
        {/* Left Side - Image Slider */}
        <Col lg={5}>
          <div
            className="product-left-box position-sticky top-0"
            style={{ maxHeight: '600px' }}
          >
            <Row className="g-3 flex-sm-row flex-column-reverse">
              {allImages.length > 1 ? (
                <Col xs={12} sm={2}>
                  <div className="bottom-slider-image left-slider slick-top product-thumb-vertical">
                    <Slider
                      {...thumbSliderSettings}
                      asNavFor={nav1}
                      ref={(slider) => {
                        slider2.current = slider;
                        if (slider && nav2 !== slider) {
                          setNav2(slider);
                        }
                      }}
                    >
                      {allImages.map((image, index) => (
                        <div key={image.uid}>
                          <div className="sidebar-image">
                            <PreloadedHerbThumbImage
                              src={image.image}
                              alt={
                                image.imageAlt ||
                                `${herb.name} - Thumbnail ${index + 1}`
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </Slider>
                  </div>
                </Col>
              ) : null}

              <Col xs={12} sm={allImages.length > 1 ? 10 : 12}>
                <div className="product-main-1 position-relative">
                  {allImages.length > 0 && (
                    <Slider
                      {...mainSliderSettings}
                      infinite={false}
                      asNavFor={nav2}
                      ref={(slider) => {
                        slider1.current = slider;
                        if (slider && nav1 !== slider) {
                          setNav1(slider);
                        }
                      }}
                    >
                      {allImages.map((image, index) => (
                        <div key={image.uid}>
                          <div className="slider-image">
                            <PreloadedHerbMainImage
                              src={image.image}
                              alt={
                                image.imageAlt ||
                                `${herb.name} - Image ${index + 1}`
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </Slider>
                  )}
                </div>
              </Col>
            </Row>
          </div>
        </Col>

        {/* Right Side - Description */}
        <Col lg={7}>
          <div className="right-box-contain herb-detail">
            <h2 className="name">{herb.name}</h2>
            {herb.subtitle && (
              <h5 className="text-content scientific-name mb-3">
                <em>{herb.subtitle}</em>
              </h5>
            )}

            {/* Herb Info Sections */}
            {herb.herbInfos && herb.herbInfos.length > 0 && (
              <div className="herb-infos mt-4">
                {herb.herbInfos.map((infoItem) => (
                  <div key={infoItem.uid} className="mb-4">
                    <div className="title">{infoItem.title}</div>
                    <p className="description mt-2">{infoItem.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Timestamps */}
            {herb.created_at && (
              <div className="mt-4 text-muted small">
                <p>
                  <RiCalendarLine className="me-2" />
                  Created on: {formatDate(new Date(herb.created_at))}
                </p>
              </div>
            )}
          </div>
        </Col>
      </WrapperComponent>

      {/* Related Products Slider Section */}
      {normalizedRelatedProducts.length > 0 && (
        <WrapperComponent
          classes={{
            sectionClass:
              'best-seller-products-section related-product-section section-b-space',
          }}
          noRowCol={true}
        >
          <Row className="align-items-center">
            <Col xs={12} lg={8}>
              <CustomHeading
                customClass="mb-0"
                title="Related Products"
                subTitle="Explore Our Top Products"
                svgUrl={<LeafSVG className="icon-width" />}
              />
            </Col>
            <Col lg={4} className="d-none d-lg-flex justify-content-end">
              <a href={`/collections?herbs=${herb.slug}`}>
                <Btn color="primary" size="md">
                  View All Related Products
                </Btn>
              </a>
            </Col>
          </Row>

          <Row>
            <Col>
              <div className="product-slider-placeholder">
                <Row className={`g-sm-4 g-3 product-list-section`}>
                  {normalizedRelatedProducts.slice(0, 4).map((product, i) => (
                    <Col
                      xl={3}
                      lg={4}
                      md={6}
                      xs={6}
                      className="collection-product-col"
                      key={product?.id || product?.uid || i}
                    >
                      <ProductBox1
                        imgUrl={product?.product_thumbnail}
                        productDetail={product}
                        classObj={{ productBoxClass: 'product-box-3' }}
                      />
                    </Col>
                  ))}
                </Row>
              </div>

              <div className="d-flex d-lg-none justify-content-center mt-4">
                <a href={`/collections?herbs=${herb.slug}`}>
                  <Btn color="primary" size="md">
                    View All Related Products
                  </Btn>
                </a>
              </div>
            </Col>
          </Row>
        </WrapperComponent>
      )}

      {/* Other Herbs Slider Section */}
      {transformedOtherHerbs.length > 0 && (
        <WrapperComponent
          classes={{
            sectionClass:
              'product-list-section other-herbs-section section-b-space',
          }}
          noRowCol={true}
        >
          <div className="title mb-0">
            <h2>Explore Other Herbs</h2>
            <span className="title-leaf">
              <LeafSVG className="icon-width" />
            </span>
          </div>

          <div className="product-slider-placeholder mt-4">
            <Row className="g-3 g-md-4">
              {transformedOtherHerbs.slice(0, 8).map((otherHerb) => (
                <Col key={otherHerb.id} xs={6} sm={4} lg={3}>
                  <HerbCard herb={otherHerb} />
                </Col>
              ))}
            </Row>
          </div>

          <div className="d-flex justify-content-center mt-4">
            <a href="/herbs">
              <Btn color="primary" size="md" className="fw-semibold">
                Browse All Herbs
              </Btn>
            </a>
          </div>
        </WrapperComponent>
      )}
    </>
  );
};

export default HerbDetailContent;
