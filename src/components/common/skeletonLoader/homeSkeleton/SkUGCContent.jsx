'use client';

import React from 'react';
import { Col, Row } from 'reactstrap';
import Slider from 'react-slick';
import { RiPlayCircleFill } from 'react-icons/ri';
import WrapperComponent from '@/components/common/WrapperComponent';
import CustomHeading from '@/components/common/CustomHeading';
import { LeafSVG } from '@/components/common/CommonSVG';

const defaultSliderSettings = {
  dots: false,
  arrows: false,
  infinite: false,
  speed: 400,
  slidesToScroll: 1,
  slidesToShow: 4,
  swipeToSlide: false,
  responsive: [
    {
      breakpoint: 1400,
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 1200,
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 992,
      settings: {
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 576,
      settings: {
        slidesToShow: 1,
      },
    },
  ],
};

const SkUGCContent = ({ count = 4, sliderSettings = defaultSliderSettings }) => {
  const skeletonItems = Array.from({ length: count }, (_, index) => index);

  return (
    <WrapperComponent
      classes={{ sectionClass: 'ugc-section section-b-space' }}
      noRowCol={true}
    >
      <Row>
        <Col>
          <CustomHeading
            customClass="mb-0"
            title="Ayurvedic Health Talks"
            subTitle="Explore What Our Customers Say"
            svgUrl={<LeafSVG className="icon-width" />}
          />
        </Col>
      </Row>

      <div className="hero-carousel-section ugc-grid slider-placeholder">
        <Slider {...sliderSettings}>
          {skeletonItems.map((item) => (
            <div key={item}>
              <div
                className="ugc-card skeleton"
                style={{ cursor: 'default', pointerEvents: 'none' }}
              >
                {/* 9:16 Video Thumbnail skeleton */}
                <div className="ugc-card__thumbnail">
                  <div
                    className="skeleton-shimmer"
                    style={{
                      width: '100%',
                      height: '100%',
                      position: 'absolute',
                      inset: 0,
                    }}
                  />
                  <div className="ugc-card__gradient" />

                  {/* Play button watermark */}
                  <div
                    className="ugc-card__play-btn"
                    style={{ pointerEvents: 'none', opacity: 0.8 }}
                  >
                    <RiPlayCircleFill />
                  </div>

                  {/* User info overlay */}
                  <div className="ugc-card__user-info">
                    <div
                      className="skeleton-shimmer mb-1"
                      style={{
                        width: '65%',
                        height: 16,
                        borderRadius: 4,
                      }}
                    />
                    <div
                      className="skeleton-shimmer"
                      style={{
                        width: '40%',
                        height: 12,
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>

                {/* Card body */}
                <div className="ugc-card__body">
                  {/* Star rating skeleton */}
                  <div className="d-flex gap-1 align-items-center mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="skeleton-shimmer"
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 3,
                        }}
                      />
                    ))}
                  </div>

                  {/* Mini product card */}
                  <div className="ugc-card__product">
                    <div
                      className="ugc-card__product-img skeleton-shimmer"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        flexShrink: 0,
                      }}
                    />
                    <div
                      className="ugc-card__product-info"
                      style={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                      }}
                    >
                      <div
                        className="skeleton-shimmer"
                        style={{
                          width: '85%',
                          height: 14,
                          borderRadius: 4,
                        }}
                      />
                      <div
                        className="skeleton-shimmer"
                        style={{
                          width: '45%',
                          height: 12,
                          borderRadius: 4,
                        }}
                      />
                    </div>
                  </div>

                  {/* Review message placeholder */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      margin: '4px 0',
                    }}
                  >
                    <div
                      className="skeleton-shimmer"
                      style={{
                        width: '100%',
                        height: 12,
                        borderRadius: 4,
                      }}
                    />
                    <div
                      className="skeleton-shimmer"
                      style={{
                        width: '75%',
                        height: 12,
                        borderRadius: 4,
                      }}
                    />
                  </div>

                  {/* Add To Cart button skeleton */}
                  <div
                    className="add-to-cart-box ugc-card__cart-box"
                    style={{ marginTop: 'auto' }}
                  >
                    <div
                      className="skeleton-shimmer"
                      style={{
                        width: '100%',
                        height: 42,
                        borderRadius: 12,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      <style jsx global>{`
        .skeleton-shimmer {
          background: linear-gradient(90deg, #eee 25%, #f5f5f5 37%, #eee 63%);
          background-size: 400% 100%;
          animation: skeleton-shimmer 1.4s ease infinite;
        }
        @keyframes skeleton-shimmer {
          0% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0 50%;
          }
        }
      `}</style>
    </WrapperComponent>
  );
};

export default SkUGCContent;
