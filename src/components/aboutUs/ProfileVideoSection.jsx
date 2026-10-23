import React from 'react';
import { Row, Col } from 'reactstrap';
import WrapperComponent from '../common/WrapperComponent';
import styles from './VideoSection.module.scss';
import CustomHeading from '../common/CustomHeading';

const ProfileVideoSection = () => {
  return (
    <WrapperComponent
      classes={{
        sectionClass: `section-b-space`,
      }}
      noRowCol={true}
    >
      <Row>
        <Col>
          <CustomHeading title="Company Profile Video" />
        </Col>
      </Row>
      <Row className="justify-content-start">
        <Col lg={6} xs={12} className="d-flex">
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
        </Col>
      </Row>
    </WrapperComponent>
  );
};

export default ProfileVideoSection;
