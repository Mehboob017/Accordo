'use client';

import React from 'react';
import CustomHeading from '../common/CustomHeading';
import WrapperComponent from '../common/WrapperComponent';
import { Row, Col } from 'reactstrap';
import { LeafSVG } from '../common/CommonSVG';
import styles from './ManufacturingPlant.module.scss';

const ManufacturingPlant = () => {
  return (
    <>
      <WrapperComponent
        classes={{ sectionClass: 'blog-section section-b-space' }}
        customCol={true}
      >
        <div
          className="hero-carousel-section"
          aria-label="Manufacturing & Quality"
        >
          <div className="text-center">
            <h1 className="events-title">Quality & Excellence</h1>
            <p className="events-subtitle">
              Our state-of-the-art manufacturing facilities uphold the highest
              standards of quality, safety, and authentic Ayurvedic excellence.
            </p>
          </div>
        </div>
      </WrapperComponent>
      {/* <WrapperComponent
        classes={{
          sectionClass: `${styles['about-us-section']} section-b-space`,
        }}
        noRowCol={true}
      >
        <Row>
          <Col>
            <CustomHeading
              customClass="mb-0"
              title="Manufacturing Plant"
              subTitle="Know more about us"
              svgUrl={<LeafSVG className="icon-width" />}
            />
          </Col>
        </Row>

        <Row className={`g-4 ${styles['about-us-row']}`}>
          <Col xs={12} className="d-flex">
            <div className={styles['about-us-content']}>
              <div>
                <p>
                  Located at Panvel, Maharashtra since 1872, Shree
                  Dhootapapeshwar Ltd. has also been famous by the name of
                  ‘Panvel Company’. Large scale manufacturing of various
                  Ayurvedic formulations like Bhasma, Rasayanas, Arka, Avaleha,
                  and other Ayurvedic specialty products of the company
                  originated from this site.
                </p>
                <p>
                  Spread over the total area of 7 acres, the plant has modern
                  gadgets for upscaling of traditional methodology without
                  compromising on the basic ethos of Ayurvediya Aushadhikaran
                  that is Manufacturing of Ayurvedic Medicine at Industrial
                  level.
                </p>
                <p>
                  Even today many specialized Ayurvedic Generic dosage forms
                  like Bhasma, Rasakalpa, Guti-Vati and so on continue to be
                  manufactured from here.
                </p>
              </div>
            </div>
          </Col>
        </Row>
        <Row className="g-4">
          <Col lg={6} xs={12} className="d-flex">
            <div className={styles['about-us-video-wrapper']}>
              <div className={styles['about-us-video']}>
                <img
                  src="/assets/images/aboutus/Shree-Dhootapapeshwarmm.jpg"
                  alt="Manufacturing Plant"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          </Col>
          <Col lg={6} xs={12} className="d-flex">
            <div className={styles['about-us-video-wrapper']}>
              <div className={styles['about-us-video']}>
                <img
                  src="/assets/images/aboutus/factry.webp"
                  alt="Manufacturing Plant"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          </Col>
        </Row>
      </WrapperComponent> */}
    </>
  );
};

export default ManufacturingPlant;
