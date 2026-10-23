'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Slider from 'react-slick';
import WrapperComponent from '../common/WrapperComponent';
import CustomHeading from '@/components/common/CustomHeading';
import { LeafSVG } from '@/components/common/CommonSVG';
import { Col, Row } from 'reactstrap';
import { useHealthInterest, useHome } from '@/utils/hooks/useHome';
import styles from './HealthConcerns.module.scss';
import { getOptimizedCdnImageUrl } from '@/utils/helpers';
// import SkHealthConcern from '@/components/common/skeletonLoader/homeSkeleton/SkHealthConcern';

const sliderSettings = {
  dots: false,
  arrows: true,
  infinite: true,
  speed: 400,

  autoplay: true,
  autoplaySpeed: 3000,
  pauseOnHover: true,
  pauseOnFocus: true,

  slidesToScroll: 1,
  slidesToShow: 7,
  swipeToSlide: false,
  responsive: [
    { breakpoint: 1440, settings: { slidesToShow: 7 } },
    { breakpoint: 1200, settings: { slidesToShow: 6 } },
    { breakpoint: 768, settings: { slidesToShow: 5 } },
    { breakpoint: 540, settings: { slidesToShow: 3 } },
  ],
};

const ShopByHealthConcerns = () => {
  const sliderContainerRef = useRef(null);
  // const { data } = useHome();
  const { data } = useHealthInterest();

  const healthInterest = data?.data?.healthInterest || [];

  useEffect(() => {
    const container = sliderContainerRef.current;
    if (!container) return;

    const updateInertState = () => {
      const slides = container.querySelectorAll('.slick-slide');
      slides.forEach((slide) => {
        const isHidden = slide.getAttribute('aria-hidden') === 'true';
        if (isHidden) {
          if (!slide.hasAttribute('inert')) {
            slide.setAttribute('inert', '');
            slide.inert = true;
          }
        } else {
          if (slide.hasAttribute('inert')) {
            slide.removeAttribute('inert');
            slide.inert = false;
          }
        }
      });
    };

    updateInertState();

    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      for (let i = 0; i < mutations.length; i++) {
        const mutation = mutations[i];
        if (
          (mutation.type === 'attributes' &&
            (mutation.attributeName === 'aria-hidden' ||
              mutation.attributeName === 'class')) ||
          mutation.type === 'childList'
        ) {
          shouldUpdate = true;
          break;
        }
      }
      if (shouldUpdate) {
        updateInertState();
      }
    });

    observer.observe(container, {
      attributes: true,
      attributeFilter: ['aria-hidden', 'class'],
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [healthInterest]);

  // Show skeleton while loading
  // if (isLoading) {
  //   return (
  //     <WrapperComponent
  //       classes={{
  //         sectionClass: `${styles['health-concerns-section']} section-b-space`,
  //       }}
  //       noRowCol={true}
  //     >
  //       <Row>
  //         <Col>
  //           <CustomHeading
  //             customClass="mb-0"
  //             title="Shop by Health Concerns"
  //             subTitle="Explore trusted Ayurvedic care for every health condition"
  //             svgUrl={<LeafSVG className="icon-width" />}
  //           />
  //         </Col>
  //       </Row>

  //       <Row>
  //         <Col>
  //           <SkHealthConcern count={10} sliderSettings={sliderSettings} />
  //         </Col>
  //       </Row>
  //     </WrapperComponent>
  //   );
  // }

  // Don't render anything if no data
  if (!healthInterest.length) {
    return null;
  }

  // console.log({ ...sliderSettings });

  return (
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
            title="Shop by Health Concerns"
            subTitle="Explore trusted Ayurvedic care for every health condition"
            svgUrl={<LeafSVG className="icon-width" />}
          />
        </Col>
      </Row>

      <Row>
        <Col>
          <div
            ref={sliderContainerRef}
            className={`hero-carousel-section ${styles['health-concerns-slider-outer']}`}
          >
            <div className={styles['health-concerns-slider-inner']}>
              <Slider {...sliderSettings}>
                {healthInterest.slice(0, 12).map((concern) => (
                  <div key={concern.uid}>
                    <a
                      draggable={false}
                      href={`/health-concerns/${concern.slug}`}
                      className={styles['health-concern-card']}
                    >
                      <div className={styles['health-concern-image-wrapper']}>
                        <img
                          src={getOptimizedCdnImageUrl(concern.image, 150, 150, 80)}
                          height={150}
                          width={150}
                          alt={
                            concern.imageAlt ||
                            concern.name ||
                            'Health Concern Image'
                          }
                          className={styles['health-concern-image']}
                          draggable={false}
                          loading='lazy'
                          decoding='async'
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
  );
};

export default ShopByHealthConcerns;
