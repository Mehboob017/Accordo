import React from 'react';
import { Row, Col } from 'reactstrap';
import WrapperComponent from '../common/WrapperComponent';
import styles from './Gmp.module.scss';
import CustomHeading from '../common/CustomHeading';

const Gmp = () => {
  return (
    <WrapperComponent
      classes={{
        sectionClass: `section-b-space section-t-space ${styles['gmp-section']}`,
      }}
      noRowCol={true}
      noSectionTopSpace={true}
    >
      <Row>
        <Col xs={12}>
          <div className={styles['gmp-content']}>
            {/* <h3 className={styles['gmp-title']}>GMP</h3> */}
            <CustomHeading title="GMP" />
            <p className={styles['gmp-text']}>
              Shree Dhootapapeshwar Ltd. is one of the first few Ayurvedic
              Industries to receive the GMP certification.
            </p>
            <p className={styles['gmp-text']}>
              <strong>GMP (Good Manufacturing Practice)</strong> is an accepted
              norm for various industries all over the world today. It is
              recognized as a robust methodology to control and manage the
              manufacturing operations and quality control testing of raw
              materials as well as the finished products. It covers each and
              every aspect of manufacturing and testing. GMP certification
              ensures that the products coming from GMP certified units comply
              with the specified set of standards for <strong>Quality</strong>{' '}
              and <strong>Purity</strong>.
            </p>
            <p className={styles['gmp-text']}>
              Naturally the equipment and methodology used to manufacture the
              products also needs to be of a particular quality. Documentation
              of every aspect of processing operations and testing activities
              involved in the manufacturing of the product needs to be perfect
              and clear. GMP ensures that these documents are followed
              diligently to ensure and demonstrate that the end product is of
              acceptable quality and the contaminants are within specified
              limits. It is because of these norms that the tractability of the
              product can be established.
            </p>
          </div>
        </Col>
      </Row>
    </WrapperComponent>
  );
};

export default Gmp;
