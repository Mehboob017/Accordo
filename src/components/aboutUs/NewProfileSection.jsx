'use client';
import React from 'react';
import { Row, Col } from 'reactstrap';
import WrapperComponent from '../common/WrapperComponent';
import styles from './NewProfileSection.module.scss';
import CustomHeading from '../common/CustomHeading';
import { LeafSVG } from '../common/CommonSVG';
// import CsrActivities from './CsrActivities';
// import AwardsRecognition from './AwardsRecognition';

const NewProfileSection = () => {
    return (
        <>
            <WrapperComponent
                classes={{
                    sectionClass: `${styles['profile-section']} section-b-space`,
                }}
                noRowCol={true}
            >
                <Row>
                    <Col>
                        <CustomHeading
                            customClass="mb-0"
                            title="Wellness for the Whole Family"
                            // subTitle="Discover our legacy, values, and commitment to authentic Ayurvedic healthcare."
                            svgUrl={<LeafSVG className="icon-width" />}
                        />
                    </Col>
                </Row>

                <Row className="gy-3">
                    <Col lg={12} xs={12}>
                        {/* <div className={styles['profile-text-wrapper']}> */}
                        <p className={styles['profile-text']}>
                            “Balancing my corporate work and family, I’m always looking for simple ways to care for their everyday
                            wellness. Dhootapapeshwar Medicated Gulkand has become a part of our family routine.
                            <br />
                            <br />
                            I enjoy it before lunch, especially when I experience acidity or digestive discomfort, and my kids love it with
                            roti instead of jam. It’s a simple, traditional favourite that my whole family enjoys.”
                        </p>
                    </Col>
                    {/* <Col lg={6} xs={12} className="d-flex">
            <div className={styles['profile-video-wrapper']}>
              <div className={styles['profile-video']}>
                <img src="/assets/images/cake/banner/newb.jpeg" className="w-100" alt="" />
              </div>
            </div>
          </Col> */}
                    {/* <Col xs={12}>
            <div className={styles['profile-text-wrapper']}>
              <p className={styles['profile-bold-text']}>
                <strong>
                  “We see Ayurved as a medical system being accepted world over.
                  This is an opportunity for us and we foresee being one of the
                  first Classical Ayurved Multinationals.”
                </strong>
              </p>
            </div>
          </Col> */}
                </Row>

                {/* <CsrActivities />
        <AwardsRecognition /> */}
            </WrapperComponent>
        </>
    );
};
export default NewProfileSection;