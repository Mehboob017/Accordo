'use client';

import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import { RiDoubleQuotesR } from 'react-icons/ri';
import { LeafSVG } from '@/components/common/CommonSVG';
import CustomHeading from '@/components/common/CustomHeading';

const SkReviews = ({ count = 5 }) => {
  const skeletonItems = Array.from({ length: count }, (_, index) => index);

  return (
    <section className="review-section section-b-space section-t-space">
      <Container fluid>
        <CustomHeading
          customClass="mb-0 text-center"
          title="Testimonials"
          subTitle="See what our customers are saying about their wellness journey with us"
          svgUrl={<LeafSVG className="icon-width" />}
        />

        <Row>
          <Col xs="12">
            <div className="reviews-marquee">
              <div
                className="reviews-marquee__track"
                style={{ animation: 'none' }}
              >
                {skeletonItems.map((item) => (
                  <div className="reviews-marquee__slide" key={item}>
                    <div
                      className="reviewer-box skeleton"
                      style={{ cursor: 'default', pointerEvents: 'none' }}
                    >
                      <div className="icon">
                        <RiDoubleQuotesR />
                      </div>

                      {/* Rating stars skeleton */}
                      <div className="product-rating mb-2 d-flex gap-1 align-items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className="skeleton-shimmer"
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: 3,
                            }}
                          />
                        ))}
                      </div>

                      {/* Review message lines skeleton */}
                      <div
                        style={{
                          marginBottom: 23,
                          minHeight: 74,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                          justifyContent: 'center',
                        }}
                      >
                        <div
                          className="skeleton-shimmer"
                          style={{
                            width: '100%',
                            height: 14,
                            borderRadius: 4,
                          }}
                        />
                        <div
                          className="skeleton-shimmer"
                          style={{
                            width: '90%',
                            height: 14,
                            borderRadius: 4,
                          }}
                        />
                        <div
                          className="skeleton-shimmer"
                          style={{
                            width: '60%',
                            height: 14,
                            borderRadius: 4,
                          }}
                        />
                      </div>

                      {/* Reviewer profile skeleton */}
                      <div className="reviewer-profile">
                        <div
                          className="reviewer-image skeleton-shimmer"
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            flexShrink: 0,
                          }}
                        />

                        <div className="reviewer-name" style={{ flex: 1 }}>
                          <div
                            className="skeleton-shimmer"
                            style={{
                              width: '55%',
                              height: 16,
                              borderRadius: 4,
                              marginBottom: 6,
                            }}
                          />
                          <div
                            className="skeleton-shimmer"
                            style={{
                              width: '35%',
                              height: 12,
                              borderRadius: 4,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Col>
        </Row>
      </Container>

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
    </section>
  );
};

export default SkReviews;
