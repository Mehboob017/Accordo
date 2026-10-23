'use client';

import React from 'react';
import { Col, Row } from 'reactstrap';
import { RiArrowDownSLine } from 'react-icons/ri';

const SkHomeFaqs = ({ count = 5 }) => {
  const skeletonItems = Array.from({ length: count }, (_, index) => index);

  return (
    <section className="faq-box-contain section-t-space section-b-space">
      <div className="container-fluid-lg">
        <Row>
          <Col xl={5}>
            <div className="faq-contain">
              <h2>Frequently Asked Questions</h2>
              <p>
                Find answers to common questions about our products, services, and wellness solutions.
              </p>
            </div>
          </Col>
          <Col xl={7}>
            <div className="faq-accordion">
              <div
                className="accordion"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                {skeletonItems.map((item) => (
                  <div
                    key={item}
                    className="accordion-item"
                    style={{
                      width: '100%',
                      backgroundColor: '#fefefe',
                      borderRadius: 7,
                      border: '1px solid #e2e2e2',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'default',
                      pointerEvents: 'none',
                    }}
                  >
                    <div
                      className="skeleton-shimmer"
                      style={{
                        width: `${60 + (item % 3) * 12}%`,
                        height: 18,
                        borderRadius: 4,
                      }}
                    />
                    <div
                      style={{
                        color: '#999',
                        fontSize: 20,
                        display: 'flex',
                        alignItems: 'center',
                        marginLeft: 12,
                      }}
                    >
                      <RiArrowDownSLine />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Col>
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
    </section>
  );
};

export default SkHomeFaqs;
