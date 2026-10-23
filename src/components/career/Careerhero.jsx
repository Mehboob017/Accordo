import React from 'react';
import styles from './Careerhero.module.scss';

export const CareerHero = () => {
  return (
    <section className={`${styles.heroSection} section-b-space section-t-space`}>
      <div className="container-fluid">
        <div className="row align-items-center">
          {/* Left Side - Image */}
          <div className="col-lg-6 col-md-12">
            <div className={styles.imageWrapper}>
              <img
                src="/assets/images/career/careerpagehero.png"
                alt="Join Our Team"
                className={styles.heroImage}
              /> 
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="col-lg-6 col-md-12">
            <div className={styles.contentWrapper}>
              <h1 className={styles.title}>
                You can't do the good job if your job is all you do<span className={styles.highlight}></span>
              </h1>

              <p className={styles.description}>
              A career at Shree Dhootapapeshwar Limited is more than just a job — it’s your opportunity to shape a meaningful future.
              </p>

              <div className={styles.buttonGroup}>
                <a href="https://hrms.sdlindia.com/hradmin/careers/" className={`${styles.btn} ${styles.btnPrimary} btn-primary`}>View Open Positions</a>
                <a href="#career-opportunities" className={`${styles.btn} ${styles.btnSecondary} btn-secondary`}>Explore More</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};