import React from 'react';
import { Row, Col } from 'reactstrap';
import styles from './CsrActivities.module.scss';
import CustomHeading from '../common/CustomHeading';
import WrapperComponent from '../common/WrapperComponent';
import Image from 'next/image';

const CsrActivities = () => {
  return (
    <>
      <WrapperComponent
        classes={{
          sectionClass: `${styles['csr-section']} section-b-space`,
        }}
        noRowCol={true}
      >
        <Row className="">
          <Col xs={12}>
            <CustomHeading
              customClass="mb-0"
              title="Corporate Social Responsibility"
            />
          </Col>
        </Row>

        <Row className="">
          <Col xs={12}>
            <div className="mb-4">
              <img src="/assets/images/lab/college.webp" alt="CSR Activities" className="img-fluid w-100 rounded" />
            </div>
          </Col>
          <Col xs={12} className="">
            <p className={styles['csr-text']}>
              At Shree Dhootapapeshwar Ltd., Corporate Social Responsibility is rooted in our enduring commitment to promoting health, education, and the advancement of Ayurved for the well-being of society.
            </p>

            <h3 className="h5 mt-4 mb-3" style={{ fontWeight: 'bold' }}>
              Our Commitment to Ayurved Education & Community Health:
            </h3>

            <p className={styles['csr-text']}>
              <strong>Educational Awareness for General Public:</strong> Through our Trust and educational initiatives, we organize awareness and lecture series on adolescent health, menstrual wellness, motherhood, Ayurvedic lifestyle, and nutrition. These programmes empower young girls, women, and communities with practical knowledge for healthier living.
            </p>

            <p className={styles['csr-text']}>
              <strong>Supporting the Next Generation of Ayurved Practitioners:</strong> Through Shree Dhootapapeshwar Vidyalaya Samiti, we proudly support residential workshops organized by various Ayurved associations to strengthen the academic knowledge, clinical skills, and practical understanding of BAMS students and young Ayurved practitioners. As a mark of encouragement and recognition, we also felicitate <strong>BAMS Final Year College Toppers</strong> from the Mumbai region for their outstanding academic achievements, inspiring excellence and motivating future Ayurved professionals.
            </p>

            <p className={styles['csr-text']}>
              <strong>Edutainment through National-Level Quiz Competition:</strong> Shree Dhootapapeshwar Ltd. organizes <strong>&quot;Jyotishmati&quot;</strong>, the <strong>National-Level Intercollegiate Ayurved Quiz Competition</strong>, providing an engaging platform for academic interaction, healthy competition, and knowledge exchange among students from Ayurved colleges across India.
            </p>

            <p className={styles['csr-text']}>
              <strong>Health Check-up Camps:</strong> We conduct health check-up camps to facilitate early diagnosis, preventive healthcare, and access to quality Ayurvedic guidance, benefiting communities across different age groups.
            </p>

            <p className={styles['csr-text']}>
              <strong>Research & Development:</strong> We actively support research into and the development of Ayurvedic medicine and allied sciences, fostering innovation while preserving the timeless <strong>Saiddhantik Ayurved</strong>.
            </p>

            <p className={styles['csr-text']}>
              <strong>Publication & Knowledge Dissemination:</strong> Through the <strong>Shree Dhootapapeshwar Vidyalaya Samiti</strong>, we publish and distribute educational literature, books, and other resources to promote awareness and deepening the understanding the knowledge of Ayurved among Ayurved students and practitioners on a no profit no loss basis.
            </p>
          </Col>
        </Row>
      </WrapperComponent>
    </>
  );
};

export default CsrActivities;
