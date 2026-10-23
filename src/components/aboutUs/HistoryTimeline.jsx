'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Row, Col } from 'reactstrap';
import styles from './HistoryTimeline.module.scss';
import CustomHeading from '@/components/common/CustomHeading';

import inceptionImage from '/public/assets/images/aboutus/inception_portrait.webp';
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

const HistoryTimeline = () => {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section className={`${styles.timelineSection} section-t-space section-b-space`}>
      <div className="container-fluid-lg">
        <div className={styles.timelineContainer} ref={containerRef}>
          {/* Animated Timeline Track */}
          {/* <div className={styles.timelineTrack}>
            <motion.div className={styles.timelineFill} style={{ scaleY }} />
          </div> */}

          {/* Point 1: Inception */}
          <div className={styles.timelineItem}>
            {/* <div className={styles.timelineDot}></div> */}
            <div className={styles.timelineContent}>
              <Row className=''>
                <CustomHeading title="Inception" />
                <Col lg="8" className="order-2 order-lg-1">
                  <div className={styles.textContent}>
                    <p>
                      Years prior to 1872,{' '}
                      <strong>
                        Late Vaidyaraj Shri. Krushnashastri Puranik
                      </strong>{' '}
                      <em>(1839 – 1905)</em> sowed the seeds of{' '}
                      <em>Ayurved aushadhi nirman</em> at Panvel, near Mumbai.
                    </p>
                    <p>
                      With great dynamism and a vision at play alongwith his son{' '}
                      <strong>
                        Late Vaidyaraj Shri. Vishnushastri Puranik
                      </strong>{' '}
                      <em>(1864 – 1914)</em>, this ignition led to{' '}
                      <em>Shree Dhootapapeshwar Aryaaushadhi Karkhana</em>.
                    </p>
                    <p>
                      The basic aim of the enterprise was service to the Ayurved
                      fraternity which in actuality meant Service to Ayurved.
                    </p>
                  </div>
                </Col>
                <Col
                  lg="4"
                  className={`${styles.imageColumn} order-1 order-lg-2`}
                >
                  <div className={styles.imageWrapper}>
                    <img
                      src={inceptionImage.src}
                      alt="Shri Krushnashastri Puranik"
                      loading="lazy"
                    />
                  </div>
                </Col>
              </Row>
            </div>
          </div>

          {/* Point 2: A simple goal */}
          <div className={styles.timelineItem}>
            {/* <div className={styles.timelineDot}></div> */}
            <div className={styles.timelineContent}>
              <Row>
                <Col xs={12}>
                  <div className={styles.textContent}>
                    <CustomHeading title="A simple goal : Efficacious medicines of the highest quality" />
                    <p>
                      The founder believed that mankind has much to gain from
                      their own traditional medicine. This medicine should be of
                      the highest quality, with the quality being assured from
                      batch to batch, leaving no room for errors. And so, with
                      the greatest of sensitivity to ancient textual
                      description, he focused on the mechanisation of production
                      for Ayurved medicine with no scope for compromise.
                    </p>
                    <p>
                      His approach and immediate goals for the enterprise were
                      very simple – manufacture extremely efficacious medicines,
                      standardise the formulae to the satisfaction of Ayurved
                      Vaidyas, scale-up to industrial scale and nation-wide
                      distribution.
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
              </Row>
            </div>
          </div>

          {/* Point 3: A united platform for Ayurved physicians */}
          <div className={styles.timelineItem}>
            {/* <div className={styles.timelineDot}></div> */}
            <div className={styles.timelineContent}>
              <Row>
                <Col lg="8">
                  <div className={styles.textContent}>
                    <CustomHeading title="A united platform for Ayurved physicians" />
                    <p>
                      With the ongoing onslaught of the British Raj in its early
                      days and their western medicinal approach,{' '}
                      <strong>
                        Late Vaidyaraj Shri. Vishnushastri Puranik
                      </strong>{' '}
                      recognised his fiduciary responsibility in keeping Ayurved
                      alive amongst the fraternity. He knew and thereby invested
                      in all means possible for a united platform for Ayurved
                      Physicians.
                    </p>
                    <p>
                      Generations after him continue this work of keeping the
                      Ayurved Physicians voice paramount in matters of national
                      health.
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

                <Col lg="12" className="mt-4">
                  <div className={styles.textContentFull}>
                    <p>
                      After the untimely demise of{' '}
                      <strong>Late Vaidyaraj Shri. Vishnushastri</strong>, his
                      legacy was carried forward for some time under the
                      guidance of his brother{' '}
                      <strong>Shri. Rambhau Krushnashastri Puranik</strong> till
                      his son{' '}
                      <strong>Shri. Gangadhar Vishnushastri Puranik</strong> was
                      ready to take on the responsibility of leading the
                      enterprise.
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
              </Row>
            </div>
          </div>

          {/* Point 4: Expansion and Advertising */}
          <div className={styles.timelineItem}>
            {/* <div className={styles.timelineDot}></div> */}
            <div className={styles.timelineContent}>
              <Row>
                <Col xs={12}>
                  <CustomHeading title="Expansion and Advertising" />
                </Col>
                <Col lg="8">
                  <div className={styles.textContent}>
                    <p>
                      The third generation of the Puranik family –{' '}
                      <strong>
                        Late Vaidyaraj Shri. Gangadhar Vishnushastri Puranik
                        (1907 – 1980)
                      </strong>{' '}
                      also known as <strong>Nanasaheb</strong>, with great
                      support from his younger brother{' '}
                      <strong>Shri. Mahadev Vishnu Puranik</strong> also known
                      as <strong>Kakasaheb Puranik</strong>,{' '}
                      <strong>Shree Dhootapapeshwar Limited</strong> emerged as
                      the foremost institute of the country known for its
                      superior quality of manufactured medicines.
                    </p>
                    <p>
                      Illustrious leaders of the independence struggle like
                      Mahatma Gandhi, Sardar Patel, Bal Gangadhar Tilak and
                      leading Ayurved Practitioners have visited the factory in
                      Panvel.
                    </p>
                    <p>
                      The vision to take Shree Dhootapapeshwar nation-wide and
                      make medicines available in far corners of India with
                      literature and propagation in local languages was achieved
                      by the brothers. By the mid-1930’s the company had 26
                      branches in far flung areas of India and was manufacturing
                      over 1000 Ayurved medicines. The enterprise had its own
                      printing press in Panvel for the load of publicity and
                      literature was getting larger and larger.
                    </p>
                  </div>
                </Col>
                <Col
                  lg="4"
                  className={`${styles.imageColumn} ${styles.noBorder}`}
                >
                  <div className={styles.imageWrapper}>
                    <img
                      src={gangadharImage.src || gangadharImage}
                      alt="Late Vaidyaraj Shri. Gangadhar Vishnu Puranik"
                      loading="lazy"
                    />
                    <span className={styles.imageCaption}>
                      Late Vaidyaraj Shri. Gangadhar Vishnu Puranik (1907
                      &ndash; 1980)
                    </span>
                  </div>
                </Col>

                <Col xs="12" className="mt-4">
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

                <Col xs={12} className="mt-4">
                  <div className={styles.textContent}>
                    <p>
                      Even today,{' '}
                      <strong>Shree Dhootapapeshwar Limited </strong>and its
                      in-house quality norms christened as{' '}
                      <strong>Shree Dhootapapeshwar Standards (SDS) </strong>is
                      well accepted as benchmark quality. <strong>SDS</strong>{' '}
                      means a warranty for{' '}
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
                      Ayurved medicines. The management believes that Ayurved
                      medicines cure and mitigate disease and disorder whilst
                      also preventing promoting health.
                    </p>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HistoryTimeline;
