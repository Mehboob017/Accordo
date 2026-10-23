import React from 'react';
import { Row, Col } from 'reactstrap';
import WrapperComponent from '../common/WrapperComponent';
import CustomHeading from '../common/CustomHeading';
import styles from './ManufacturingExcellence.module.scss';

const ManufacturingExcellence = () => {
  return (
    <WrapperComponent
      classes={{
        sectionClass: `section-b-space section-t-space ${styles['excellence-section']}`,
      }}
      noRowCol={true}
      noSectionTopSpace={true}
    >
      <Row>
        <Col xs={12}>
          <div className={styles['excellence-content']}>
            <CustomHeading title="Manufacturing Excellence" />

            <p className={styles['excellence-text']}>
              Ayurved has defined specifications of a good product mainly on the
              basis of organoleptic tests. Now that the Ayurvedic manufacturing
              has moved from the hands of an Ayurvedic physician who used to
              make his own medicines to those of a large scale manufacturer, it
              is imperative that nothing is left to individual subjectivity and
              discretion.
            </p>

            <p className={styles['excellence-text']}>
              Specific acceptance criteria therefore need to be evolved not only
              for the raw material selected through the well laid out meticulous
              selection process but also for the processes carried out at
              critical stages of product manufacturing and the finished product
              that goes to the end consumer.
            </p>

            <p className={styles['excellence-text']}>
              There are various standards that are specifically mentioned in
              various Government publications. However, in today's competitive
              world the end consumer expects much more from a product in terms
              of <strong>Quality</strong> and <strong>Purity</strong> requiring
              thorough approach and diligent scrutiny.
            </p>

            <p className={styles['excellence-text']}>
              Keeping this in mind, Shree Dhootapapeshwar Ltd. has taken
              appropriate steps in this direction and has evolved standards
              based on globally acceptable parameters. All of these have been
              compiled as monographs which has made it possible for 'Shree
              Dhootapapeshwar Ltd'. to produce products meeting these rigid
              standards of Quality and Purity. Quality Standardized logo has
              been inscribed on the label of the product as a guarantee of this
              Quality to the end consumer.
            </p>

            <p className={styles['excellence-text']}>
              We strive not just to meet International Specifications but we
              also try to excel in what we call{' '}
              <strong>'Shree Dhootapapeshwar Benchmark'</strong>. One of our
              associate organization and major vendor{' '}
              <strong>Om Pharmaceuticals Ltd</strong>, Bengaluru, became the
              first Ayurvedic manufacturing unit in India and in the world to be{' '}
              <strong>certified under the guidelines of ISO-9001</strong>.
            </p>
          </div>
        </Col>
      </Row>
    </WrapperComponent>
  );
};

export default ManufacturingExcellence;
