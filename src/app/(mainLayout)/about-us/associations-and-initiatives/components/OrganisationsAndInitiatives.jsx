'use client';

import React from 'react';
import { Row, Col } from 'reactstrap';
import styles from './OrganisationsAndInitiatives.module.scss';
import WrapperComponent from '@/components/common/WrapperComponent';
import CustomHeading from '@/components/common/CustomHeading';
import sdat from '/public/assets/images/aboutus/sdat.webp';
import sdar1 from '/public/assets/images/aboutus/sdar-1.webp';
import sdar2 from '/public/assets/images/aboutus/sdar-2.webp';
import sdarf from '/public/assets/images/aboutus/sdarf.webp';

const OrganisationsAndInitiatives = () => {
  return (
    <>
      {/* SDAT Section */}
      <WrapperComponent
        classes={{
          sectionClass: `${styles.section} section-b-space`,
        }}
        customCol={true}
        id="sdat"
      >
        <Col xs={12}>
          <CustomHeading
            customClass="mb-0"
            title="SDAT"
            subTitle="Shree Dhootapapeshwar Ayurved Trust"
          // svgUrl={<LeafSVG className="icon-width" />}
          />
        </Col>
        <Col xs={12}>
          <div className={styles.textContent}>
            <p>
              Vaidya Gangadharshastri Puranik took reins of the company in his
              hands in 1933. In the same year, he and his younger brother Shree
              Mahadevshastri Puranik established{' '}
              <strong>Shree Dhootapapeshwar Ayurved Trust</strong> in memory of
              their late father Shree Vishnushastri Puranik. This trust gave
              funds for the research work on basic principles of Ayurvedic
              Medicine.
            </p>
            <p>
              The trust in 1934 started a 30 bed Ayurvedic Hospital named{' '}
              <strong>Ayurved Rugnalaya</strong>. For next 50 years many
              Ayurvedic doctors provided their services to the society through
              this hospital. Today Shree Dhootapapeshwar Ayurved Trust is a
              registered trust dedicated to the cause of Ayurved. Its activities
              touch diverse fields such as organic cultivation, free healthcare
              camps and liaisons with Ayurvedic fraternity.
            </p>
          </div>
        </Col>
        <Col xs="12" className="mt-3">
          <div className={styles.imageGroup}>
            {/* <div className={styles.imageCard}> */}
            <div className={styles.splitImages}>
              <div className={styles.imageWrapper}>
                <img
                  src={sdat.src}
                  alt="SDAT"
                  className={`${styles.imgWrap} w-100 object-fit-cover`}
                  loading="lazy"
                />
              </div>
              <div className={styles.imageWrapper}>
                <img
                  src={sdar1.src}
                  alt="Shree Dhootapapeshwar Ayurved Rugnalaya Hospital"
                  loading="lazy"
                />
              </div>
              <div className={styles.imageWrapper}>
                <img
                  src={sdar2.src}
                  alt="Shree Dhootapapeshwar Ayurved Ruganalaya Hospital"
                  loading="lazy"
                />
              </div>
            </div>
            {/* <p className={styles.caption}>
              Shree Dhootapapeshwar Ayurved Rugnalaya, 1939
            </p> */}
            {/* </div> */}
          </div>
        </Col>
        {/* <Col lg="6">
          <div className={styles.imageGroup}>
            <div className={styles.imageCard}>
              <div className={styles.imageWrapper}>
                <img
                  src={sdat.src}
                  alt="SDAT"
                  className={`${styles.imgWrap} w-100 object-fit-cover`}
                  loading="lazy"
                />
              </div>
              <p className={styles.caption}>
                Shree Dhootapapeshwar Ayurved Trust, 1933
              </p>
            </div>
          </div>
        </Col>
        <Col lg="6" className="mt-3">
          <div className={styles.imageCard}>
            <div className={styles.splitImages}>
              <div className={styles.imageWrapper}>
                <img
                  src={sdar1.src}
                  alt="Shree Dhootapapeshwar Ayurved Rugnalaya Hospital"
                  loading="lazy"
                />
              </div>
              <div className={styles.imageWrapper}>
                <img
                  src={sdar2.src}
                  alt="Shree Dhootapapeshwar Ayurved Ruganalaya Hospital"
                  loading="lazy"
                />
              </div>
            </div>
            <p className={styles.caption}>
              Shree Dhootapapeshwar Ayurved Rugnalaya, 1939
            </p>
          </div>
        </Col> */}
      </WrapperComponent>

      {/* SDAVS Section (Centered Full Width Text) */}
      <WrapperComponent
        classes={{ sectionClass: 'section-b-space' }}
        customCol={true}
        id="sdavs"
      >
        <Col xs={12}>
          <CustomHeading
            customClass="mb-0"
            title="SDAVS"
            subTitle="Shree Dhootapapeshwar Ayurved Vidyalaya Samiti"
          // svgUrl={<LeafSVG className="icon-width" />}
          />
        </Col>
        <Col lg="12">
          <div className={styles.textContent}>
            {/* <CustomHeading
                customClass="mb-0 text-center"
                title="SDAVS"
                subTitle="Shree Dhootapapeshwar Ayurved Vidyalaya Samiti"
              /> */}
            <p>
              In the pre-independence era, it was the need of the period to
              bring Ayurvedic Medicine into the main stream along with Modern
              medicine which was the only medicine promoted by the British
              Government. Even main leaders of the Independence struggle were of
              the same opinion.
            </p>
            <p>
              For this to happen it was necessary to systemise the education
              system of Ayurvedic Medicine. At that time, Ayurved was still
              taught and studied in traditional way mostly in families and
              through Guru-Shishya Parampara. There was neither the official
              Ayurvedic course nor the institution for Ayurvedic Medicine.
            </p>
            <p>
              It was thus the necessity of the time to establish an institute or
              College imparting official and systematic course in Ayurvedic
              medicine. Banaras Hindu University, commonly known as BHU founded
              in 1912 by Madan Mohan Malaviya initiated this process.
            </p>
            <p>
              Taking inspiration from him{' '}
              <strong>Shree Dhootapapeshwar Ayurved Vidyalaya Samiti</strong>{' '}
              (SDAVS) was established in 1940 with the aim of starting Ayurved
              College in Panvel. Many renowned vaidyas were students of this
              institution.
            </p>
            <p>
              When in post independence era many Ayurvedic institutions were
              founded and Education of Ayurvedic medicine was finally systemized
              students from SDAVS were transferred to Ayurved Mahavidyalaya,
              Sion.
            </p>
            <p>
              Today,{' '}
              <strong>Shree Dhootapapeshwar Ayurved Vidyalaya Samiti</strong>{' '}
              (SDAVS) is engaged in Reprinting and Publishing of old Ayurvedic
              text books and treatises to make them easily available and
              accessible to Ayurvedic physicians as well as students.
            </p>
            <p>
              Its key publications include{' '}
              <strong>Ayurvediya Aushadhikaran</strong> by Vd. Dhamankar and Vd.
              Gangadhar Puranik, and{' '}
              <strong>Ayurvediya Aushadhi Dravya Shodanvidhi</strong> by Vd.
              Dhamankar.
            </p>
            {/* <p>
              View our publications{' '}
              <a
                href="http://www.sdlindia.com/resources/journal-publication"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                here
              </a>
              .
            </p> */}
          </div>
        </Col>
      </WrapperComponent>

      {/* SDARF Section */}
      <WrapperComponent
        customCol={true}
        id="sdarf"
        classes={{ sectionClass: 'section-b-space' }}
      >
        <CustomHeading
          customClass="mb-0"
          title="SDARF"
          subTitle="Shree Dhootapapeshwar Ayurved Research Foundation"
        />
        <Col lg="6" className="d-flex flex-column justify-content-center order-lg-1 order-2">
          <div className={styles.textContent}>
            <p>
              <strong>Shree Dhootapapeshwar Ayurved Research Foundation</strong>{' '}
              was established in 1949 under chairmanship of Vaidya Venumadhav
              Shastri.
            </p>
            <p>
              It is an organisation dedicated to challenges concerning updating
              of the Ayurvedic tenets. Standardized, Authentic, Safe and
              Efficacious are the virtues this research foundation validates for
              Ayurvedic formulations. The challenge is to present Ayurvedic
              products, which have been in use for centuries on the firm footing
              to meet the demands of questioning scientists of the new
              millennium.
            </p>
            <div className="mt-4">
              <p>
                <strong>SDARF</strong> in 2001 developed{' '}
                <strong>Shree Dhootapapeshwar Standards</strong> to define own
                norms of Shree Dhootapapeshwar Ltd for raw material as well as
                finished products. Shree Dhootapapeshwar Standards (SDS) is a
                compilation of protocols that validates the classical Ayurvedic
                formulations to the expectations of Modern Medical
                Practitioners. Continuous updating and adaptation of modern
                Pharmaceutical technologies are hallmark of its mandate.
              </p>
              <p>
                Ayurvedic remedies are increasingly being sought these days for
                the treatment of various ‘Life style disorders’. Shree
                Dhootapapeshwar Ayurvedic Research Foundation (SDARF) is
                responding to these requirements of the society and is working
                tirelessly in this direction.
              </p>
            </div>
          </div>
        </Col>

        <Col lg="6" className='order-lg-2 order-1'>
          <div className={styles.imageGroup}>
            <div className={styles.imageCard}>
              <div className={styles.imageWrapper}>
                <img src={sdarf.src} alt="1996-SDL R&D Panvel" loading="lazy" />
              </div>
              <p className={styles.caption}>
                Shree Dhootapapeshwar Ayurved Research Foundation, 1996
              </p>
            </div>
          </div>
        </Col>
      </WrapperComponent>
    </>
  );
};

export default OrganisationsAndInitiatives;
