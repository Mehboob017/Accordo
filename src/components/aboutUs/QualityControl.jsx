'use client';

import React from 'react';
import {
  RiSettings3Line,
  RiFileList3Line,
  RiTeamLine,
  RiShieldCheckLine,
  RiComputerLine,
} from 'react-icons/ri';
import styles from './QualityControl.module.scss';
import CustomHeading from '../common/CustomHeading';
import { LeafSVG } from '../common/CommonSVG';

const features = [
  {
    id: 1,
    title: 'Advanced Machineries',
    description: 'Advanced, sophisticated machineries and instruments',
    icon: RiSettings3Line,
  },
  {
    id: 2,
    title: 'Quality Policies',
    description: 'Comprehensive quality policies and procedures',
    icon: RiFileList3Line,
  },
  {
    id: 3,
    title: 'Dedicated Staff',
    description: 'Competent, enthusiastic and dedicated staff',
    icon: RiTeamLine,
  },
  {
    id: 4,
    title: 'Continual Monitoring',
    description: 'Continual monitoring by dedicated quality assurance team',
    icon: RiShieldCheckLine,
  },
  {
    id: 5,
    title: 'Computerized Systems',
    description: 'Controlled computerized systems.',
    icon: RiComputerLine,
  },
];

const QualityControl = () => {
  return (
    <section className={`${styles.section} bg-light section-b-space section-lg-space`}>
      <div className="container-fluid-lg">
        <CustomHeading
          customClass="mb-4"
          title="Quality Control at SDL"
          subTitle="Ensuring Excellence Through Rigorous Quality Standards."
          svgUrl={<LeafSVG className="icon-width" />}
        />

        <div className="row justify-content-center mb-4 mt-2">
          <div className="col-12">
            <p className={styles.description}><strong>Shree Dhootapapeshwar Ltd's</strong> Quality team ensures the delivery of high standard products by conducting step by step reviews. Our internal quality parameters include not only systems and instruments, but also well trained and responsible staff to execute the entire processing in highly calibrated, sophisticated analysers.</p>
            <h3 className={styles.subHeadingTitle}>Salient features of the Quality Control Laboratory:</h3>
          </div>
        </div>

        <div className="row g-3 g-md-4">
          {features.map((item) => (
            <div key={item.id} className="col-xl-4 col-md-6 col-sm-12">
              <div className={styles.card}>
                <div className={styles.iconWrapper}>
                  <div className={styles.iconCircle}>
                    <item.icon className={styles.icon} aria-hidden="true" />
                  </div>
                </div>
                <h4 className={styles.cardTitle}>{item.title}</h4>
                <p className={styles.cardDescription}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="row justify-content-center mt-5">
          <div className="col-12">
            <p className={styles.footerText}>
              At <span className="fw-bold">SDL</span>, we carry out quality evaluation as per specifications laid down in Ayurvedic Pharmacopoeia of India and established in-house standards i.e. <span className="fw-bold">SDS</span>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QualityControl;
