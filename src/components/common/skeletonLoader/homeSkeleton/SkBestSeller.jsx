'use client';

import React from 'react';
import { Col, Row } from 'reactstrap';
import WrapperComponent from '@/components/common/WrapperComponent';
import CustomHeading from '@/components/common/CustomHeading';
import { LeafSVG } from '@/components/common/CommonSVG';
import Btn from '@/elements/buttons/Btn';

export const ProductCardSkeleton = () => {
  return (
    <div
      className="product-box d-flex flex-column h-100 product-box-3 p-0 skeleton"
      style={{
        cursor: 'default',
        pointerEvents: 'none',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#fff',
      }}
    >
      {/* Badge Placeholder */}
      <div
        className="skeleton-shimmer"
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          width: 76,
          height: 22,
          borderRadius: 999,
          zIndex: 2,
        }}
      />

      {/* Wishlist Placeholder */}
      <div
        className="skeleton-shimmer"
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          width: 28,
          height: 28,
          borderRadius: '50%',
          zIndex: 2,
        }}
      />

      {/* Product Image Shell - 1:1 Aspect Ratio */}
      <div
        className="product-image"
        style={{
          aspectRatio: '1 / 1',
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <div
          className="skeleton-shimmer"
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </div>

      {/* Product Detail Area */}
      <div
        className="product-detail"
        style={{
          padding: '14px 12px 16px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff',
        }}
      >
        <div
          className="product-detail--wrapper"
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            justifyContent: 'space-between',
          }}
        >
          {/* Title - 2 lines matching line-clamp */}
          <div style={{ marginBottom: 12 }}>
            <div
              className="skeleton-shimmer"
              style={{
                width: '90%',
                height: 16,
                borderRadius: 4,
                marginBottom: 6,
              }}
            />
            <div
              className="skeleton-shimmer"
              style={{
                width: '60%',
                height: 16,
                borderRadius: 4,
              }}
            />
          </div>

          <div className="product-detail-bottom">
            {/* Meta Row: Unit & In-Stock pill on left, Star & Rating on right */}
            <div
              className="meta-1"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10,
                gap: 8,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <div
                  className="skeleton-shimmer"
                  style={{
                    width: 44,
                    height: 14,
                    borderRadius: 4,
                  }}
                />
                <div
                  className="skeleton-shimmer"
                  style={{
                    width: 62,
                    height: 16,
                    borderRadius: 999,
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <div
                  className="skeleton-shimmer"
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                  }}
                />
                <div
                  className="skeleton-shimmer"
                  style={{
                    width: 46,
                    height: 14,
                    borderRadius: 4,
                  }}
                />
              </div>
            </div>

            {/* Price Row: Discounted Price, MRP, % Off */}
            <div
              className="price-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
              }}
            >
              <div
                className="skeleton-shimmer"
                style={{
                  width: 70,
                  height: 20,
                  borderRadius: 4,
                }}
              />
              <div
                className="skeleton-shimmer"
                style={{
                  width: 52,
                  height: 14,
                  borderRadius: 4,
                }}
              />
              <div
                className="skeleton-shimmer"
                style={{
                  width: 48,
                  height: 15,
                  borderRadius: 4,
                }}
              />
            </div>

            {/* Action Buttons: Buy Now & Add to Cart */}
            <div
              className="dual-cart-buttons"
              style={{
                display: 'flex',
                gap: 8,
              }}
            >
              <div
                className="skeleton-shimmer"
                style={{
                  flex: 1,
                  height: 38,
                  borderRadius: 8,
                }}
              />
              <div
                className="skeleton-shimmer"
                style={{
                  flex: 1,
                  height: 38,
                  borderRadius: 8,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SkBestSeller = ({
  count = 4,
  title = 'Our Best Sellers',
  subTitle = 'Explore Our Best Sellers',
  sectionClass = 'best-seller-products-section section-b-space',
  showViewAll = true,
}) => {
  return (
    <WrapperComponent classes={{ sectionClass }} noRowCol={true}>
      <Row className="align-items-center">
        <Col xs={12} lg={8}>
          <CustomHeading
            customClass="mb-0"
            title={title}
            subTitle={subTitle}
            svgUrl={<LeafSVG className="icon-width" />}
          />
        </Col>

        {showViewAll && (
          <Col lg={4} className="d-none d-lg-flex justify-content-end">
            <Btn
              color="primary"
              size="md"
              disabled
              style={{ opacity: 0.7, pointerEvents: 'none' }}
            >
              View All
            </Btn>
          </Col>
        )}
      </Row>

      <Row>
        <Col>
          <div className="product-slider-placeholder">
            <Row className="g-sm-4 g-3 product-list-section">
              {Array.from({ length: count }).map((_, i) => (
                <Col xl={3} lg={4} md={6} xs={6} key={i}>
                  <ProductCardSkeleton />
                </Col>
              ))}
            </Row>
          </div>

          {showViewAll && (
            <div className="d-flex d-lg-none justify-content-center mt-4">
              <Btn
                color="primary"
                size="md"
                disabled
                style={{ opacity: 0.7, pointerEvents: 'none' }}
              >
                View All
              </Btn>
            </div>
          )}
        </Col>
      </Row>

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

export default SkBestSeller;
