'use client';

import React from 'react';
import { Row } from 'reactstrap';
import Slider from 'react-slick';
import WrapperComponent from '@/components/common/WrapperComponent';
import CustomHeading from '@/components/common/CustomHeading';
import { LeafSVG } from '@/components/common/CommonSVG';
import Btn from '@/elements/buttons/Btn';

const defaultSliderConfig = {
  className: 'ratio_87',
  dots: false,
  arrows: false,
  infinite: false,
  speed: 400,
  slidesToShow: 4,
  slidesToScroll: 1,
  responsive: [
    {
      breakpoint: 992,
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 876,
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

const SkHomeBlogs = ({ count = 4, sliderOption = defaultSliderConfig }) => {
  const skeletonItems = Array.from({ length: count }, (_, index) => index);

  return (
    <WrapperComponent
      classes={{ sectionClass: 'home-blogs-section section-b-space' }}
      noRowCol
    >
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 title">
        <CustomHeading
          customClass="mb-0"
          title="Latest Blogs"
          subTitle="Explore Our Insights"
          svgUrl={<LeafSVG className="icon-width" />}
        />
        <div className="d-none d-lg-flex">
          <Btn
            color="primary"
            size="md"
            disabled
            style={{ opacity: 0.7, pointerEvents: 'none' }}
          >
            View More
          </Btn>
        </div>
      </div>

      <div className="hero-carousel-section mt-4">
        <Row>
          <div className="col-12 home-blogs-slider">
            <Slider {...sliderOption}>
              {skeletonItems.map((item) => (
                <div key={item} className="h-100 d-flex">
                  <div
                    className="blog-box feature-blog-card h-100 skeleton"
                    style={{ cursor: 'default', pointerEvents: 'none' }}
                  >
                    {/* Blog image skeleton */}
                    <div className="blog-box-image">
                      <div
                        className="skeleton-shimmer"
                        style={{
                          width: '100%',
                          aspectRatio: '16 / 9',
                          borderTopLeftRadius: 12,
                          borderTopRightRadius: 12,
                        }}
                      />
                    </div>

                    {/* Blog detail skeleton */}
                    <div
                      className="blog-detail feature-blog-detail"
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      {/* Title - 2 lines */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                          marginBottom: 16,
                        }}
                      >
                        <div
                          className="skeleton-shimmer"
                          style={{
                            width: '90%',
                            height: 16,
                            borderRadius: 4,
                          }}
                        />
                        <div
                          className="skeleton-shimmer"
                          style={{
                            width: '65%',
                            height: 16,
                            borderRadius: 4,
                          }}
                        />
                      </div>

                      {/* Meta row */}
                      <div
                        className="feature-blog-meta-row"
                        style={{ marginTop: 'auto' }}
                      >
                        <div
                          className="feature-blog-meta-left"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                          }}
                        >
                          {/* Category pill */}
                          <div
                            className="skeleton-shimmer"
                            style={{
                              width: 70,
                              height: 20,
                              borderRadius: 12,
                            }}
                          />
                          {/* View count */}
                          <div
                            className="skeleton-shimmer"
                            style={{
                              width: 45,
                              height: 14,
                              borderRadius: 4,
                            }}
                          />
                        </div>

                        {/* Arrow circle button skeleton */}
                        <div
                          className="skeleton-shimmer"
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </Row>
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

export default SkHomeBlogs;
