'use client';

import React from 'react';
import styles from './Timeline.module.scss';
import WrapperComponent from '@/components/common/WrapperComponent';
import CustomHeading from '@/components/common/CustomHeading';

const Timeline = () => {
  const sections = [
    {
      id: 'SDAT',
      title: 'SDAT',
      content: (
        <>
          <p className={styles.text}>
            Vaidya Gangadharshastri Puranik took reins of the company in his
            hands in 1933. In the same year, he and his younger brother Shree
            Mahadevshastri Puranik established{' '}
            <strong>Shree Dhootapapeshwar Ayurved Trust</strong> in memory of
            their late father Shree Vishnushastri Puranik. This trust gave funds
            for the research work on basic principles of Ayurvedic Medicine.
          </p>
          <p className={styles.text}>
            The trust in 1934 started a 30 bed Ayurvedic Hospital named{' '}
            <strong>Ayurved Rugnalaya</strong>. For next 50 years many Ayurvedic
            doctors provided their services to the society through this
            hospital. Today Shree Dhootapapeshwar Ayurved Trust is a registered
            trust dedicated to the cause of Ayurved. Its activities touch
            diverse fields such as organic cultivation, free healthcare camps
            and liaisons with Ayurvedic fraternity.
          </p>
          <div className={styles.highlightBox}>
            <p>
              <strong>Shree Dhootapapeshwar Ayurved Trust, 1933</strong>
            </p>
            <p>
              <strong>Shree Dhootapapeshwar Ayurved Rugnalaya, 1939</strong>
            </p>
          </div>
        </>
      ),
    },
    {
      id: 'SDAVS',
      title: 'SDAVS',
      content: (
        <>
          <p className={styles.text}>
            In the pre-independence era, it was the need of the period to bring
            Ayurvedic Medicine into the main stream along with Modern medicine
            which was the only medicine promoted by the British Government. Even
            main leaders of the Independence struggle were of the same opinion.
          </p>
          <p className={styles.text}>
            For this to happen it was necessary to systemise the education
            system of Ayurvedic Medicine. At that time, Ayurved was still taught
            and studied in traditional way mostly in families and through
            Guru-Shishya Parampara. There was neither the official Ayurvedic
            course nor the institution for Ayurvedic Medicine.
          </p>
          <p className={styles.text}>
            It was thus the necessity of the time to establish an institute or
            College imparting official and systematic course in Ayurvedic
            medicine. Banaras Hindu University, commonly known as BHU founded in
            1912 by Madan Mohan Malaviya initiated this process.
          </p>
          <p className={styles.text}>
            Taking inspiration from him{' '}
            <strong>Shree Dhootapapeshwar Ayurved Vidyalaya Samiti</strong>{' '}
            (SDAVS) was established in 1940 with the aim of starting Ayurved
            College in Panvel. Many renowned vaidyas were students of this
            institution.
          </p>
          <p className={styles.text}>
            When in post independence era many Ayurvedic institutions were
            founded and Education of Ayurvedic medicine was finally systemized
            students from SDAVS were transferred to Ayurved Mahavidyalaya, Sion.
          </p>
          <p className={styles.text}>
            Today,{' '}
            <strong>Shree Dhootapapeshwar Ayurved Vidyalaya Samiti</strong>{' '}
            (SDAVS) is engaged in Reprinting and Publishing of old Ayurvedic
            text books and treatises to make them easily available and
            accessible to Ayurvedic physicians as well as students.
          </p>
          <p className={styles.text}>
            Its key publications include{' '}
            <strong>Ayurvediya Aushadhikaran</strong> by Vd. Dhamankar and Vd.
            Gangadhar Puranik, and{' '}
            <strong>Ayurvediya Aushadhi Dravya Shodanvidhi</strong> by Vd.
            Dhamankar.
          </p>
          <a
            href="http://www.sdlindia.com/publications"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkButton}
          >
            View our publications here
          </a>
        </>
      ),
    },
    {
      id: 'SDARF',
      title: 'SDARF',
      content: (
        <>
          <p className={styles.text}>
            <strong>Shree Dhootapapeshwar Ayurved Research Foundation</strong>{' '}
            was established in 1949 under chairmanship of Vaidya Venumadhav
            Shastri.
          </p>
          <p className={styles.text}>
            It is an organisation dedicated to challenges concerning updating of
            the Ayurvedic tenets. Standardized, Authentic, Safe and Efficacious
            are the virtues this research foundation validates for Ayurvedic
            formulations. The challenge is to present Ayurvedic products, which
            have been in use for centuries on the firm footing to meet the
            demands of questioning scientists of the new millennium.
          </p>
          <div className={styles.highlightBox}>
            <p>
              <strong>
                Shree Dhootapapeshwar Ayurved Research Foundation, 1996
              </strong>
            </p>
          </div>
          <p className={styles.text}>
            <strong>SDARF</strong> in 2001 developed{' '}
            <strong>Shree Dhootapapeshwar Standards</strong> to define own norms
            of Shree Dhootapapeshwar Ltd for raw material as well as finished
            products. Shree Dhootapapeshwar Standards (SDS) is a compilation of
            protocols that validates the classical Ayurvedic formulations to the
            expectations of Modern Medical Practitioners. Continuous updating
            and adaptation of modern Pharmaceutical technologies are hallmark of
            its mandate.
          </p>
          <p className={styles.text}>
            Ayurvedic remedies are increasingly being sought these days for the
            treatment of various ‘Life style disorders’. Shree Dhootapapeshwar
            Ayurvedic Research Foundation (SDARF) is responding to these
            requirements of the society and is working tirelessly in this
            direction.
          </p>
        </>
      ),
    },
  ];

  return (
    <>
      <WrapperComponent
        classes={{ sectionClass: 'blog-section section-b-space' }}
      >
        <section className={styles.timelineSection}>
          <div className="container-fluid-lg">
            <CustomHeading
              customClass="mb-3 mb-lg-4"
              title="Organisations & Initiatives"
            // subTitle=""
            // svgUrl={<LeafSVG className="icon-width" />}
            />
          </div>
          <div className={styles.timelineWrapper}>
            {sections.map((section, index) => (
              <div key={section.id} className={styles.timelineItem}>
                {/* Timeline Node (The Circle with the Number) */}
                <div className={styles.timelineNode}>
                  <span>{index + 1}</span>
                </div>

                {/* Card Content */}
                <div className={styles.timelineCard}>
                  <h3 className={styles.title}>{section.title}</h3>
                  {section.content}
                </div>
              </div>
            ))}
          </div>
          {/* <div className={styles.container}>
          </div> */}
        </section>
      </WrapperComponent>
    </>
  );
};

export default Timeline;
