'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Col, Row } from 'reactstrap';
import Slider from 'react-slick';
import { RiCalendarLine } from 'react-icons/ri';
import WrapperComponent from '@/components/common/WrapperComponent';
import CustomHeading from '@/components/common/CustomHeading';
import { LeafSVG } from '@/components/common/CommonSVG';
import Btn from '@/elements/buttons/Btn';
import Loader from '@/layout/loader';
import { formatDate, getOptimizedCdnImageUrl } from '@/utils/helpers';
import ProductBox1 from '@/components/common/productBox/productBox1/ProductBox1';
import useImagePreload from '@/utils/hooks/useImagePreload';
import { placeHolderImage } from '@/data/CommonPath';
import { normalizeProductForCard } from '@/utils/fallbackProducts';
import { useHealthConcernsDetail } from '@/utils/hooks/useHealthConcerns';
import styles from '@/components/home/HealthConcerns.module.scss';
import ProductSkeletonComponent from '@/components/common/skeletonLoader/productSkeleton/ProductSkeletonComponent';

const PreloadedHerbThumbImage = memo(({ src, alt }) => {
  const thumbSrc = getOptimizedCdnImageUrl(src, 150, 150, 80);
  const { resolvedSrc, isLoaded, isError } = useImagePreload(thumbSrc, {
    fallbackSrc: placeHolderImage,
  });

  return (
    <div
      className={`preload-media-frame preload-media-frame--thumb ${isLoaded ? 'is-loaded' : 'is-loading'}`}
    >
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
    <div
      className={`preload-media-frame preload-media-frame--main ${isLoaded ? 'is-loaded' : 'is-loading'}`}
    >
      {!isLoaded && !isError ? (
        <span className="preload-media-skeleton" aria-hidden="true" />
      ) : null}

      {isLoaded ? (
        <div className="preload-media-reveal">
          <img
            src={resolvedSrc}
            alt={alt}
            className="img-fluid"
            loading="lazy"
            decoding="async"
            height={800}
            width={800}
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

const sliderSettings = {
  dots: false,
  arrows: true,
  infinite: true,
  speed: 400,
  slidesToScroll: 1,
  slidesToShow: 7.2,
  swipeToSlide: true,
  responsive: [
    // { breakpoint: 1440, settings: { slidesToShow: 7 } },
    // { breakpoint: 1200, settings: { slidesToShow: 6.5 } },
    { breakpoint: 992, settings: { slidesToShow: 6 } },
    { breakpoint: 768, settings: { slidesToShow: 5.5 } },
    { breakpoint: 540, settings: { slidesToShow: 3 } },
  ],
};

const HealthConcernDetailContent = ({ healthConcernSlug }) => {
  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  const slider1 = useRef();
  const slider2 = useRef();
  const loadMoreRef = useRef(null);

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useHealthConcernsDetail(healthConcernSlug);

  const response = data?.pages?.[0];

  const healthConcern = response?.data?.['Health Concerns'];
  const otherHealthConcerns = response?.data?.['Other Health Concerns'] || [];
  const relatedProducts = useMemo(() => {
    const pages = data?.pages ?? [];
    const seen = new Set();
    const flat = [];

    for (const page of pages) {
      const products = page?.data?.['Related Products']?.data ?? [];

      for (const product of products) {
        if (seen.has(product.uid)) continue;

        seen.add(product.uid);
        flat.push(product);
      }
    }

    return flat;
  }, [data]);

  const normalizedRelatedProducts = useMemo(
    () => relatedProducts.map(normalizeProductForCard).filter(Boolean),
    [relatedProducts]
  );

  const totalProductCount = useMemo(() => {
    const pages = data?.pages ?? [];
    const lastPage = pages[pages.length - 1];

    return (
      lastPage?.data?.['Related Products']?.pagination?.totalItems ??
      normalizedRelatedProducts.length
    );
  }, [data, normalizedRelatedProducts.length]);

  useEffect(() => {
    const node = loadMoreRef.current;

    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: '300px',
        threshold: 0,
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

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

  if (error || !response?.success || !response?.data?.['Health Concerns']) {
    return (
      <WrapperComponent classes={{ sectionClass: 'section-b-space' }}>
        <div className="text-center py-5">
          <h2>Health Concern Not Found</h2>
          <p className="mt-3">
            {error?.message || 'The page you are looking for does not exist.'}
          </p>
          <a href="/">
            <Btn type="button" color="primary" className="btn btn-md mt-3">
              Back to Home
            </Btn>
          </a>
        </div>
      </WrapperComponent>
    );
  }

  // Prepare images array (coverImage + herbImages)
  const allImages = [
    {
      uid: healthConcern.uid,
      image: healthConcern.image,
      imageAlt: healthConcern.imageAlt || healthConcern.name,
    },
  ].filter((item) => item.image);

  // Transform other herbs for HerbCard component
  const transformedOtherHealthConcerns = otherHealthConcerns.map((item) => ({
    uid: item.uid,
    slug: item.slug,
    name: item.name,
    image: item.image,
    imageAlt: item.imageAlt,
    description: item.description,
  }));

  // console.log('relatd concern products', { normalizedRelatedProducts });

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
                                `${healthConcern.name} - Thumbnail ${index + 1}`
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
                                `${healthConcern.name} - Image ${index + 1}`
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
            <h1 className="name">{healthConcern.name}</h1>
            {/* {healthConcern.subtitle && (
              <h5 className="text-content scientific-name mb-3">
                <em>{healthConcern.subtitle}</em>
              </h5>
            )} */}

            {healthConcern.description && (
              <div className="mt-4">
                <p
                  dangerouslySetInnerHTML={{
                    __html: healthConcern.description,
                  }}
                />
              </div>
            )}

            {healthConcern.created_at && (
              <div className="mt-4 text-muted small">
                <p>
                  <RiCalendarLine className="me-2" />
                  Created on: {formatDate(new Date(healthConcern.created_at))}
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
          noRowCol
        >
          <Row className="align-items-center">
            <Col>
              <CustomHeading
                customClass="mb-0"
                title="Related Products"
                subTitle={`Showing ${normalizedRelatedProducts.length} of ${totalProductCount} products`}
                svgUrl={<LeafSVG className="icon-width" />}
              />
            </Col>
          </Row>

          <Row className="g-sm-4 g-3 product-list-section">
            {normalizedRelatedProducts.map((product, i) => (
              <Col
                xxl={3}
                xl={4}
                lg={4}
                md={6}
                xs={6}
                key={product?.uid || product?.id || i}
                className="collection-product-col"
              >
                <ProductBox1
                  imgUrl={product.product_thumbnail}
                  productDetail={product}
                  classObj={{ productBoxClass: 'product-box-3' }}
                />
              </Col>
            ))}

            {isFetchingNextPage && <ProductSkeletonComponent item={4} />}
          </Row>

          <div
            ref={loadMoreRef}
            style={{
              height: 1,
              width: '100%',
            }}
          />
        </WrapperComponent>
      )}

      {transformedOtherHealthConcerns.length > 0 && (
        <WrapperComponent
          classes={{
            sectionClass: `${styles['health-concerns-section']} section-b-space`,
          }}
          noRowCol={true}
        >
          <Row>
            <Col>
              <CustomHeading
                customClass="mb-0"
                title="Other Health Concerns"
                subTitle="Explore trusted Ayurvedic care for every health condition"
                svgUrl={<LeafSVG className="icon-width" />}
              />
            </Col>
          </Row>

          <Row>
            <Col>
              <div
                className={`hero-carousel-section ${styles['health-concerns-slider-outer']}`}
              >
                <div className={styles['health-concerns-slider-inner']}>
                  <Slider {...sliderSettings}>
                    {transformedOtherHealthConcerns
                      .slice(0, 8)
                      .map((concern) => (
                        <div key={concern.uid}>
                          <a
                            href={`/health-concerns/${concern.slug}`}
                            className={styles['health-concern-card']}
                          >
                            <div
                              className={styles['health-concern-image-wrapper']}
                            >
                              <img
                                src={getOptimizedCdnImageUrl(concern.image, 150, 150, 80)}
                                height={150}
                                width={150}
                                alt={
                                  concern.imageAlt || concern.name || 'Image'
                                }
                                className={styles['health-concern-image']}
                                loading="lazy"
                                decoding="async"
                              />
                            </div>
                            <h3 className={styles['health-concern-name']}>
                              {concern.name}
                            </h3>
                          </a>
                        </div>
                      ))}
                  </Slider>
                </div>
              </div>
            </Col>
          </Row>
        </WrapperComponent>
      )}
    </>
  );
};

export default HealthConcernDetailContent;
