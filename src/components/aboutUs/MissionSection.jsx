'use client';

import React from 'react';
import { Row, Col } from 'reactstrap';
import WrapperComponent from '../common/WrapperComponent';
import styles from './MissionSection.module.scss';
import CustomHeading from '../common/CustomHeading';
import { LeafSVG } from '../common/CommonSVG';

const MissionSection = () => {
  return (
    <WrapperComponent
      classes={{
        sectionClass: `${styles['mission-section']} section-b-space`,
      }}
      noRowCol={true}
    >
      <Row>
        <Col>
          <CustomHeading
            customClass="mb-0"
            title="Our Mission"
            subTitle="The Mission line of the Company is simple, yet tall – Serving Ayurved since 1872."
            svgUrl={<LeafSVG className="icon-width" />}
          />
        </Col>
      </Row>
      <Row className="g-4 align-items-stretch justify-content-between">
        <Col xs={12} >
          {/* <div className={styles['mission-text-wrapper']}> */}
          <p className={styles['mission-text']}>
            The mission at SDL has always been simply stated: Serving Ayurved. What that means in practice is less simple. It means that every medicine leaving our facilities must deliver genuine therapeutic benefit, support the body as a whole, and remain faithful to the classical texts it is drawn from.

          </p>
          <p className={styles['mission-text']}>
            Ayurved has faced questions of relevance in every era. Our response has never been to defend science rhetorically, it has been to keep improving how we apply it. Better understanding, better processes, better consistency. The medicine either works or it does not. We are focused entirely on ensuring it does.
          </p>
          {/* </div> */}
        </Col>
        {/* <Col xs={12} lg={6}>
          <div className={styles['mission-image-wrapper']}>
            <img src="/assets/images/aboutus/sdar-1.webp" alt="Mission" />
          </div>
        </Col> */}
      </Row>
      <Row className="mt-2">
        <Col xs={12}>
          <div className={styles['mission-text-wrapper']}>
            <p className={styles['mission-bold-text']}>
              <strong>
                Our standards are always at a higher threshold than what the law of the land prescribes. That is our warranty to the Ayurved fraternity.
              </strong>
            </p>
          </div>
        </Col>
      </Row>
    </WrapperComponent>
  );
};

export default MissionSection;
