import React from 'react';
import { Row, Col } from 'reactstrap';
import WrapperComponent from '../common/WrapperComponent';
import styles from './VideoSection.module.scss';
import CustomHeading from '../common/CustomHeading';

const VideoSection = () => {
  return (
    <WrapperComponent
      classes={{
        sectionClass: `section-b-space`,
      }}
      noRowCol={true}
    >
      <Row>
        <Col>
          <CustomHeading title="Company Videos" />
        </Col>
      </Row>
      <Row className="justify-content-start gy-4">
        <Col lg={6} xs={12} className="">
          <div className={styles['video-wrapper']}>
            <div className={styles['video-container']}>
              {/* YouTube Video */}
              <iframe
                src={`https://www.youtube.com/embed/0dzvJQjJYMY?rel=0`}
                title="Company Profile Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
          <h4 className={styles.title}>SDL Corporate Movie</h4>
        </Col>
        <Col lg={6} xs={12} className="">
          <div className={styles['video-wrapper']}>
            <div className={styles['video-container']}>
              {/* YouTube Video */}
              <iframe
                src={`https://www.youtube.com/embed/AeTpcVyKAOE?si=pvxIbjVv7TSEI9Da`}
                title="About Shree Dhootapapeshwar Limited"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
          <h4 className={styles.title}>SDL Corporate Movie Ver 1.0</h4>
        </Col>
      </Row>
    </WrapperComponent>
  );
};

export default VideoSection;
