import React from 'react';
import styles from './CareerLookFor.module.scss';
import CustomHeading from '../common/CustomHeading';

const CareerLookFor = () => {
  return (
    <section className="section-b-space ">
      <div className="container-fluid-lg">
        {/* <div className="row justify-content-center">
          <div className="">
            
            <CustomHeading
              customClass="mb-0"
              title="What We Look For"
              subTitle="Discover roles that match your passion and expertise. Join us in shaping the future of Ayurvedic healthcare."
            
            />
            <p className={styles.description}>
              We focus on recruiting exceptionally talented, passionate, creative, dedicated and focused individuals who love getting
              challenged and are committed to their growth. We nurture them professionally, to develop them into leaders for tomorrow,
              where they will make a meaningful impact to the business. We are also on lookout for leaders – individuals who have a vision
              for the future, a passion to develop teams and who inspire others to grow.
            </p>
          </div>
        </div> */}

        <div className="row justify-content-center ">
          <div className="">
            <hr className={styles.divider} />
            {/* <h2 className={styles.subHeading}>Current Openings</h2> */}
            <CustomHeading
              customClass="mb-0"
              title="Current Openings"
            // svgUrl={<LeafSVG className="icon-width" />}
            />
            <div className="d-flex align-items-center mt-3 flex-wrap gap-2">
              <span className={styles.openingsText}>We are hiring!</span>
              <a href="https://hrms.sdlindia.com/hradmin/careers/" target='_blank' className={`btn ${styles.clickHereBtn}`}>Click here</a>
              <span className={styles.openingsText}>to view the current openings.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CareerLookFor;
