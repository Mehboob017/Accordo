'use client';

import React from 'react';
import { Row, Col } from 'reactstrap';
import { RiArrowRightSLine } from 'react-icons/ri';
import WrapperComponent from '@/components/common/WrapperComponent';
import CustomHeading from '@/components/common/CustomHeading';
import { LeafSVG } from '@/components/common/CommonSVG';
import { useAccreditations } from '@/utils/hooks/useAccreditations';
import styles from './CertificationAndAccreditation.module.scss'

const CertificationsAndAccreditations = () => {
  const { data: accreditationsData, isLoading, isError } = useAccreditations();

  const certificatesList = accreditationsData?.data?.accreditations || [];

  if (!isLoading && (isError || certificatesList.length === 0)) {
    return null;
  }

  return (
    <WrapperComponent classes={{ sectionClass: 'section-b-space' }}>
      <CustomHeading
        customClass="mb-0"
        title="Certifications & Accreditations"
        svgUrl={<LeafSVG className="icon-width" />}
        subTitle="Explore our certifications"
      />

      {isLoading ? (
        <Row className="g-sm-4 g-3 mt-3 journal-publications-section">
          {Array.from({ length: 4 }).map((_, index) => (
            <Col key={index} lg={3} md={4} xs={6}>
              <div className="publication-card skeleton">
                <div className="publication-card-inner">
                  <div className="skeleton__img" />
                  <div className="skeleton__section">
                    <div className="skeleton__p" />
                    <div className="skeleton__p skeleton__p--short" />
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      ) : (
        <Row className="g-sm-4 g-3 mt-3 journal-publications-section">
          {certificatesList.map((file) => (
            <Col key={file.uid} lg={3} md={4} xs={6}>
              <a
                href={file.pdfPath || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="publication-card-link d-block h-100"
              >
                <div className="publication-card h-100">
                  <div className="publication-card-inner h-100 d-flex flex-column">
                    <div className="publication-image">
                      <div className="pdf-badge">
                        <span>PDF</span>
                      </div>

                      <img
                        src={file?.coverImage || '/assets/images/logo/1.png'}
                        alt={file?.coverImageAlt || file?.name || 'certificate document'}
                        width={300}
                        height={200}
                        className="img-fluid"
                      />
                    </div>

                    <div className={`${styles.namewrap} flex-grow-1`}>
                      <h3 className={styles.title}>{file?.name}</h3>
                    </div>

                    <div className="publication-meta m-0 mt-auto">
                      <button
                        type="button"
                        className="herb-card__button w-100 btn-primary"
                      >
                        View PDF
                        <RiArrowRightSLine className="button-icon" />
                      </button>
                    </div>
                  </div>
                </div>
              </a>
            </Col>
          ))}
        </Row>
      )}
    </WrapperComponent>
  );
};

export default CertificationsAndAccreditations;
