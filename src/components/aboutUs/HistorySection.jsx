'use client';

import React from 'react';
import { Row, Col } from 'reactstrap';
import styles from './HistorySection.module.scss';
import WrapperComponent from '@/components/common/WrapperComponent';
import CustomHeading from '@/components/common/CustomHeading';

import vishnushastriImage from '/public/assets/images/aboutus/vishnushastri_portrait-removebg-preview.png';
import historicGroupImg from '/public/assets/images/aboutus/Historical-Gathering.jpg';
import historicFactoryImg from '/public/assets/images/aboutus/historic_factory.jpg';
import historicEventImg from '/public/assets/images/aboutus/historic_event.jpg';
import gangadharImage from '/public/assets/images/aboutus/gangadhar_portrait.webp';
import company_staff from '/public/assets/images/aboutus/Company-Staff.jpg';
import Hospital_building from '/public/assets/images/aboutus/Hospital-building.jpg';

import karkhana from '/public/assets/images/aboutus/karkhana.jpg';
import inside_factory from '/public/assets/images/aboutus/Factory-inside1.jpeg';
import oldman_chair from '/public/assets/images/aboutus/Factory-inside2.jpeg';

const HistorySection = () => {
  return (
    <>
      <WrapperComponent
        classes={{
          sectionClass: 'section-b-space',
        }}
        customCol={true}
        id="history-section"
      >
        <Col xs={12} className="mt-2">
          <div className={styles.textContent}>
            <CustomHeading title="A simple goal : Efficacious medicines of the highest quality" />

            <p>
              The founder believed that mankind has much to gain from their own
              traditional medicine. This medicine should be of the highest
              quality, with the quality being assured from batch to batch,
              leaving no room for errors. And so, with the greatest of
              sensitivity to ancient textual description, he focused on the
              mechanisation of production for Ayurved medicine with no scope for
              compromise.
            </p>

            <p>
              His approach and immediate goals for the enterprise were very
              simple – manufacture extremely efficacious medicines, standardise
              the formulae to the satisfaction of Ayurved Vaidyas, scale-up to
              industrial scale and nation-wide distribution.
            </p>
          </div>
        </Col>
        <Col xs="12" className="mt-2">
          <Row className={styles.imageGrid}>
            <Col md="4" className="mb-3">
              <img
                src={karkhana.src || karkhana}
                alt="Shree Dhootapapeshwar Aryaushadi Karkhana, Panvel"
                loading="lazy"
              />
            </Col>
            <Col md="4" className="mb-3">
              <img
                src={inside_factory.src || inside_factory}
                alt="Inside the Factory"
                loading="lazy"
              />
            </Col>
            <Col md="4" className="mb-3">
              <img
                src={oldman_chair.src || oldman_chair}
                alt="Inside the Factory"
                loading="lazy"
              />
            </Col>
          </Row>
        </Col>
      </WrapperComponent>
      <WrapperComponent
        classes={{
          sectionClass: 'section-b-space',
        }}
        customCol={true}
        id="history-section"
      >
        {/* --- TOP SECTION --- */}
        <Col lg="8" className="">
          <div className={styles.textContent}>
            <CustomHeading title="A united platform for Ayurved physicians" />

            <p>
              With the ongoing onslaught of the British Raj in its early days
              and their western medicinal approach,{' '}
              <strong>Late Vaidyaraj Shri. Vishnushastri Puranik</strong>{' '}
              recognised his fiduciary responsibility in keeping Ayurved alive
              amongst the fraternity. He knew and thereby invested in all means
              possible for a united platform for Ayurved Physicians.
            </p>

            <p>
              Generations after him continue this work of keeping the Ayurved
              Physicians voice paramount in matters of national health.
            </p>
          </div>
        </Col>

        <Col lg="4" className={styles.imageColumn}>
          <div className={styles.imageWrapper}>
            <img
              src={vishnushastriImage.src || vishnushastriImage}
              alt="Late Vaidyaraj Shri. Vishnushastri Puranik"
              loading="lazy"
            />
          </div>
        </Col>

        {/* --- DIVIDER --- */}
        {/* <Col lg="12">
        <hr className={styles.sectionDivider} />
      </Col> */}

        {/* --- MIDDLE SECTION --- */}
        <Col lg="12" className="mt-2">
          <div className={styles.textContentFull}>
            <p>
              After the untimely demise of{' '}
              <strong>Late Vaidyaraj Shri. Vishnushastri</strong>, his legacy
              was carried forward for some time under the guidance of his
              brother <strong>Shri. Rambhau Krushnashastri Puranik</strong> till
              his son <strong>Shri. Gangadhar Vishnushastri Puranik</strong> was
              ready to take on the responsibility of leading the enterprise.
            </p>
          </div>

          <Row className={styles.imageGrid}>
            <Col md="4" className="mb-3">
              <img
                src={historicGroupImg.src || historicGroupImg}
                alt="Historical Gathering"
                loading="lazy"
              />
            </Col>
            <Col md="4" className="mb-3">
              <img
                src={historicFactoryImg.src || historicFactoryImg}
                alt="Historic Factory View"
                loading="lazy"
              />
            </Col>
            <Col md="4" className="mb-3">
              <img
                src={historicEventImg.src || historicEventImg}
                alt="Historical Event"
                loading="lazy"
              />
            </Col>
          </Row>
        </Col>
      </WrapperComponent>
      <WrapperComponent
        classes={{
          sectionClass: 'section-b-space',
        }}
        customCol={true}
      >
        <CustomHeading title="Expansion and Advertising" />

        {/* --- BOTTOM SECTION --- */}
        <Col lg="8" className="">
          <div className={styles.textContent}>
            <p>
              The third generation of the Puranik family –{' '}
              <strong>
                Late Vaidyaraj Shri. Gangadhar Vishnushastri Puranik (1907 –
                1980)
              </strong>{' '}
              also known as <strong>Nanasaheb</strong>, with great support from
              his younger brother <strong>Shri. Mahadev Vishnu Puranik</strong>{' '}
              also known as <strong>Kakasaheb Puranik</strong>,{' '}
              <strong>Shree Dhootapapeshwar Limited</strong> emerged as the
              foremost institute of the country known for its superior quality
              of manufactured medicines.
            </p>

            <p>
              Illustrious leaders of the independence struggle like Mahatma
              Gandhi, Sardar Patel, Bal Gangadhar Tilak and leading Ayurved
              Practitioners have visited the factory in Panvel.
            </p>

            <p>
              The vision to take Shree Dhootapapeshwar nation-wide and make
              medicines available in far corners of India with literature and
              propagation in local languages was achieved by the brothers. By the
              mid-1930’s the company had 26 branches in far flung areas of India
              and was manufacturing over 1000 Ayurved medicines. The enterprise
              had its own printing press in Panvel for the load of publicity and
              literature was getting larger and larger.
            </p>
          </div>
        </Col>

        <Col lg="4" className={`${styles.imageColumn} ${styles.noBorder}`}>
          <div className={styles.imageWrapper}>
            <img
              src={gangadharImage.src || gangadharImage}
              alt="Late Vaidyaraj Shri. Gangadhar Vishnu Puranik"
              loading="lazy"
            />
            <span className={styles.imageCaption}>
              Late Vaidyaraj Shri. Gangadhar Vishnu Puranik (1907 &ndash; 1980)
            </span>
          </div>
        </Col>

        <Col xs="12" className="mt-2">
          <Row className={styles.imageGrid}>
            <Col md="4" className="mb-3">
              <img
                src={company_staff.src || company_staff}
                alt="Company Staff"
                loading="lazy"
              />
            </Col>
            <Col md="4" className="mb-3">
              <img
                src={Hospital_building.src || Hospital_building}
                alt="Shree Dhootapapeshwar Ayurvedic Hospital"
                loading="lazy"
              />
            </Col>
          </Row>
        </Col>

        <Col xs={12} className="mt-2">
          <div className={styles.textContent}>
            <p>
              Even today, <strong>Shree Dhootapapeshwar Limited </strong>and its
              in-house quality norms christened as{' '}
              <strong>Shree Dhootapapeshwar Standards (SDS) </strong>is well
              accepted as benchmark quality. <strong>SDS</strong> means a warranty
              for{' '}
              <strong>
                <em>E</em>
              </strong>
              <strong>
                <em>fficacious, </em>
              </strong>
              <strong>
                <em>S</em>
              </strong>
              <strong>
                <em>hastrashuddha, </em>
              </strong>
              <strong>
                <em>S</em>
              </strong>
              <strong>
                <em>tandardised and </em>
              </strong>
              <strong>
                <em>S</em>
              </strong>
              <strong>
                <em>afe</em>
              </strong>{' '}
              Ayurved medicines. The management believes that Ayurved medicines
              cure and mitigate disease and disorder whilst also preventing
              promoting health.
            </p>
          </div>
        </Col>
      </WrapperComponent>
    </>
  );
};

export default HistorySection;
