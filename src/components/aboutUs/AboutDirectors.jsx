'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './AboutDirectors.module.scss';
import CustomHeading from '@/components/common/CustomHeading';
import { LeafSVG } from '@/components/common/CommonSVG';
import WrapperComponent from '@/components/common/WrapperComponent';

const directors = [
  {
    id: 1,
    title: 'Shri Ranjit Anand Puranik',
    designation: 'Managing Director',
    description: (
      <>
        <p>
          Managing Director of Shree Dhootapapeshwar Ltd., he represents the
          fifth generation and is the seventh member of the Puranik family to
          lead the organization. Under his robust leadership, the company today
          boasts last-mile engagement with the largest network of Ayurved
          physicians of any company. He strongly believes that what is good for
          Ayurveda is best for the enterprise, staying true to the vision of its
          founding fathers.
        </p>

        <p>
          Mr. Puranik is Director of Shree Dhootapapeshwar Research Foundation.
          He also serves as President of Ayurvidya Prasarak Mandal, a
          60-year-old Ayurveda college and teaching hospital. He is a Member of
          the Advisory Committee, Ministry of AYUSH, Government of India. Mr.
          Puranik has been a vocal advocate for the recognition and acceptance
          of traditional medicine, particularly the classical principles of
          Ayurveda.
        </p>

        <p>
          As Trustee of the All India Ayurveda Congress and the World Ayurveda
          Foundation, he actively advocates for the advancement of Ayurveda. He
          currently holds the following positions:
        </p>

        <ul>
          <li>Trustee, Shree Dhootapapeshwar Ayurved Vidyalay Samiti</li>
          <li>Board Member, National Medicinal Plants Board</li>
          <li>
            Founder Trustee, National Ayurveda Students &amp; Youth Association
            (NASYA)
          </li>
          <li>Founder Group Member, AYUSH Export Promotion Council (FICCI)</li>
          <li>
            Vice President (West), Ayurvedic Drug Manufacturers' Association
          </li>
          <li>
            Member, Ayurvedic Committee, American Herbal Products Association
            (AHPA)
          </li>
          <li>Member, AYUSH Core Group, CII</li>
        </ul>
      </>
    ),
    image: '/assets/images/aboutus/director1.webp',
  },
  {
    id: 2,
    title: 'Adv. Yashodhan Divekar',
    designation: 'Director',
    description:
      `Adv. Yashodhan Divekar is associated with Shree Dhootapapeshwar Limites since the year 2020. He is an Advocate and Solicitor of the Incorporated Law Society of
India and Law Society of England. He is 3rd generation Solicitor and Partner of Divekar and Co., a 101 year old and most reputed Law firm in Mumbai. Mr. Divekar
has robust experience as an Solicitor and Counsel. He is an expert on matters pertaining to Hindu law, property and Constitutional law and handles the firm's
plenteous Arbitration work.
`,
    image: '/assets/images/aboutus/director2.webp',
  },
  {
    id: 3,
    title: 'Adv. Mrs. N.R.Patankar',
    designation: 'Director',
    description: (
      <>
        <p>
          Adv. Mrs. N. R. Patankar has been associated with Shree Dhootapapeshwar Limited since the mid 1980's and has been a steadfast support to the enterprise aims.
          She has an extensive experience of over 40 years in the field of Labour & Industrial Law. Her expertise involves arbitration, mediation and conciliation in her law
          practice. She acts as a Counsel for formulation of policies and other matters related to litigation within the Company.

        </p>

        <p>
          Mrs. Patankar is an acknowledged authority on Labour Law and her footprint in High Courts in India is well acclaimed.
        </p>
      </>
    ),

    image: '/assets/images/aboutus/director3.webp',
  },
];

const AboutDirectors = () => {
  const [flippedId, setFlippedId] = useState(null);

  const showFront = () => setFlippedId(null);
  const showBack = (id) => setFlippedId(id);

  return (
    <>
      <WrapperComponent
        classes={{ sectionClass: 'blog-section section-b-space' }}
        customCol={true}
      >
        <div className="hero-carousel-section" aria-label="Leadership">
          <div className="text-center">
            <h1 className="events-title">Leadership</h1>
            <p className="events-subtitle">
              Guided by purpose and driven by excellence, our leaders continue
              to strengthen our legacy of trusted healthcare.
            </p>
          </div>
        </div>
      </WrapperComponent>
      <section className={`${styles.section} section-b-space section-t-space`}>
        <div className="container-fluid-lg">
          <CustomHeading
            customClass="mb-0"
            title="Meet the minds behind SDL (BOD)"
            subTitle="Shree Dhootapapeshwar is guided by a board that blends Ayurvedic authority, legal expertise and professional governance. Together they uphold the founding belief that what is Good for Ayurveda is Best for the enterprise."
            svgUrl={<LeafSVG className="icon-width" />}
          />

          <div className="row g-3 g-md-4">
            {directors.map((item) => {
              const isFlipped = flippedId === item.id;

              return (
                <div key={item.id} className="col-lg-4 col-md-6 col-sm-12">
                  <div
                    className={`${styles.card} ${isFlipped ? styles.flipped : ''}`}
                  >
                    <div className={styles.inner}>
                      {/* FRONT */}
                      <div className={`${styles.face} ${styles.front}`}>
                        <div className={styles.cardImageWrapper}>
                          <img
                            src={item.image}
                            alt={item.title}
                            className={styles.cardImage}
                          />
                        </div>

                        <div className={styles.cardBody}>
                          <div>
                            <h3 className={styles.cardTitle}>{item.title}</h3>
                            <p className={styles.cardDesignation}>
                              {item.designation}
                            </p>
                          </div>
                          <button
                            type="button"
                            className={styles.viewProfileBtn}
                            onClick={() => showBack(item.id)}
                          >
                            View Profile
                          </button>
                        </div>
                      </div>

                      {/* BACK */}
                      <div className={`${styles.face} ${styles.back}`}>
                        <div className={styles.backHeader}>
                          <h3 className={styles.cardTitle}>{item.title}</h3>
                          <p className={styles.cardDesignation}>
                            {item.designation}
                          </p>
                        </div>

                        <div className={styles.descriptionWrap}>
                          <div className={styles.cardDescription}>
                            {item.description}
                          </div>
                        </div>

                        <div className={styles.backFooter}>
                          <button
                            className={styles.backBtn}
                            onClick={showFront}
                          >
                            ← Back
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutDirectors;
