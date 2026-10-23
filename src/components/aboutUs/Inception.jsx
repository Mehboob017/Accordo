'use client';

import React from 'react';
import { Col } from 'reactstrap';
import styles from './Inception.module.scss';
import WrapperComponent from '@/components/common/WrapperComponent';
import CustomHeading from '@/components/common/CustomHeading';
import inceptionImage from '/public/assets/images/aboutus/inception_portrait.webp';

const Inception = () => {
  return (
    <WrapperComponent
      classes={{
        sectionClass: 'section-b-space',
      }}
      customCol={true}
      id="inception"
    >
      {/* Left Column: Text */}
      <Col lg="8" className="d-flex flex-column justify-content-center">
        <div className={styles.textContent}>
          <CustomHeading title="Inception" />

          <p>
            Years prior to 1872,{' '}
            <strong>Late Vaidyaraj Shri. Krushnashastri Puranik</strong>{' '}
            <em>(1839 – 1905)</em> sowed the seeds of{' '}
            <em>Ayurved aushadhi nirman</em> at Panvel, near Mumbai.
          </p>

          <p>
            With great dynamism and a vision at play alongwith his son{' '}
            <strong>Late Vaidyaraj Shri. Vishnushastri Puranik</strong>{' '}
            <em>(1864 – 1914)</em>, this ignition led to{' '}
            <em>Shree Dhootapapeshwar Aryaaushadhi Karkhana</em>.
          </p>

          <p>
            The basic aim of the enterprise was service to the Ayurved
            fraternity which in actuality meant Service to Ayurved.
          </p>
        </div>
      </Col>

      {/* Right Column: Image with Divider */}
      <Col lg="4" className={styles.imageColumn}>
        <div className={styles.imageWrapper}>
          <img
            src={inceptionImage.src}
            alt="Shri Krushnashastri Puranik"
            // loading="lazy"
            fetchpriority="high"
          />
        </div>
      </Col>
    </WrapperComponent>
  );
};

export default Inception;
