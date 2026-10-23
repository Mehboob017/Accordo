import React from 'react';
import { Row, Col } from 'reactstrap';
import WrapperComponent from '../common/WrapperComponent';
import styles from './Facilities.module.scss';
import CustomHeading from '../common/CustomHeading';
import { LeafSVG } from '../common/CommonSVG';

const FacilitiesSection = () => {
  return (
    <WrapperComponent
      classes={{
        sectionClass: `${styles['ethos-section']} section-b-space`,
      }}
      noRowCol={true}
    >
      <Row>
        <Col>
          <CustomHeading
            customClass="mb-0 text-center"
            title="Facilities"
            subTitle="State-of-the-art infrastructure for quality manufacturing"
            svgUrl={<LeafSVG className="icon-width" />}
          />
        </Col>
      </Row>

      <Row className="">
        <Col xs={12}>
          {/* <div className={styles['ethos-text-wrapper']}> */}
          <p className={styles['facility-text']}>
            The company has an in-house Research and Development facility which
            is recognized by DST (Department of Science and Technology, Govt of
            India). It has a multi-disciplinary technical team for chemical and
            instrumental analysis, for standardization of raw material and
            finished products and for dosage development. The laboratory is well
            equipped with instruments like AAS (Atomic Absorption
            Spectrophotometer), UV-Vis Spectrophotometer, Infra Red
            Spectrophotometer etc.
          </p>
          {/* </div> */}
          <p className={styles['facility-text']}>
            The standards are followed for day to day monitoring of quality of
            the raw materials and finished products. The standards are updated
            on a regular basis.
          </p>
          <p className={styles['facility-text']}>
            We have our own animal house duly registered with CPCSEA for
            pharmacological and safety studies. Primarily the animal house is
            used to carry out acute toxicity studies on random batches to
            confirm safety of our metal based products.
          </p>
          <p className={styles['facility-text']}>
            We have a nursery for organic cultivation of selected medicinal
            plants required for production and R & D.
          </p>
          <p className={styles['facility-text']}>
            Thus SDL is in an enviable position to undertake various research
            projects involving fundamental research work in Ayurvedic medicine
            and is currently working on it.
          </p>
        </Col>
      </Row>
    </WrapperComponent>
  );
};

export default FacilitiesSection;
