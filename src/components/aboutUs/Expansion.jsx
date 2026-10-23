'use client';

import React from 'react';
import { Row, Col } from 'reactstrap';
import styles from './HistorySection.module.scss';
import WrapperComponent from '@/components/common/WrapperComponent';
import CustomHeading from '@/components/common/CustomHeading';
import company_staff from '/public/assets/images/aboutus/Company-Staff.jpg';
import Hospital_building from '/public/assets/images/aboutus/Hospital-building.jpg';

const Expansion = () => {
  return (
    <WrapperComponent
      classes={{
        sectionClass: 'section-b-space',
      }}
      customCol={true}
      id="history-section"
    >
      <Col xs={12} className="mt-2">
        <div className={styles.textContent}>
          <CustomHeading title="Expansion and Advertising" />

          <p>
            The vision to take Shree Dhootapapeshwar nation-wide and make
            medicines available in far corners of India with literature and
            propagation in local languages was achieved by the brothers. By the
            mid-1930’s the company had 26 branches in far flung areas of India
            and was manufacturing over 1000 Ayurved medicines. The enterprise
            had its own printing press in Panvel for the load of publicity and
            literature was getting larger and larger.
          </p>

          <p>
            Quality of the highest order was never a second thought and this
            policy yielded great patronage amongst the Ayurved Physicians.
          </p>
        </div>
      </Col>
      <Col xs="12" className="mt-2">
        <Row className={styles.imageGrid}>
          <Col md="4" className="mb-3">
            <img
              src={company_staff.src || company_staff}
              alt="Company Staff"
              loading="lazy"
            />
          </Col>
          <Col md="4" className="mb-3">
            <img
              src={Hospital_building.src || Hospital_building}
              alt="Shree Dhootapapeshwar Ayurvedic Hospital"
              loading="lazy"
            />
          </Col>
        </Row>
      </Col>
      <Col xs={12} className="mt-2">
        <div className={styles.textContent}>
          <p>
            Even today, <strong>Shree Dhootapapeshwar Limited </strong>and its
            in-house quality norms christened as{' '}
            <strong>Shree Dhootapapeshwar Standards (SDS) </strong>is well
            accepted as benchmark quality. <strong>SDS</strong> means a warranty
            for{' '}
            <strong>
              <em>E</em>
            </strong>
            <strong>
              <em>fficacious, </em>
            </strong>
            <strong>
              <em>S</em>
            </strong>
            <strong>
              <em>hastrashuddha, </em>
            </strong>
            <strong>
              <em>S</em>
            </strong>
            <strong>
              <em>tandardised and </em>
            </strong>
            <strong>
              <em>S</em>
            </strong>
            <strong>
              <em>afe</em>
            </strong>{' '}
            Ayurved medicines. The management believes that Ayurved medicines
            cure and mitigate disease and disorder whilst also preventing
            promoting health.
          </p>
        </div>
      </Col>
    </WrapperComponent>
  );
};

export default Expansion;
