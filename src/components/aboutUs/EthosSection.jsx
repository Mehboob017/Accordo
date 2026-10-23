import React from 'react';
import { Row, Col } from 'reactstrap';
import WrapperComponent from '../common/WrapperComponent';
import styles from './EthosSection.module.scss';
import CustomHeading from '../common/CustomHeading';
import { LeafSVG } from '../common/CommonSVG';

const EthosSection = () => {
  return (
    <WrapperComponent
      classes={{
        sectionClass: `${styles['ethos-section']} section-b-space`,
      }}
      noRowCol={true}
    >
      {/* <Row>
        <Col>
          <CustomHeading
            customClass="mb-0 text-center"
            title="Ethos"
            subTitle="Our ethos is rooted in integrity, authenticity, and an unwavering commitment to advancing holistic healthcare through trusted Ayurvedic principles."
            svgUrl={<LeafSVG className="icon-width" />}
          />
        </Col>
      </Row> */}

      {/* <Row className="">
        <Col xs={12}>
        </Col>
      </Row> */}

      <Row>
        <Col>
          <CustomHeading
            customClass="mb-0"
            title="Shree Dhootapapeshwar Standards"
            subTitle="Beyond Business - Our Foundations and Initiatives "
          />
        </Col>
      </Row>
      <Row className="g-4 align-items-stretch justify-content-between">
        {/* <Col xs={12} lg={6} className="position-relative">
          <div className={styles['ethos-image-wrapper']}>
            <img src="/assets/images/aboutus/sdar-2.jpg" alt="Ethos" />
          </div>
        </Col> */}
        <Col xs={12} lg={6}>
          {/* <div className={styles['ethos-text-wrapper']}> */}
          {/* <p className={styles['ethos-text']}>
            With changing times, more precise, contemporary and measurable
            standards that capture the ethos of Ayurvedic manufacturing were
            thought to be the need of the hour. As in many other cases, in
            standardization, too, SDL has done pioneering work wherein the
            Ayurvedic standards have been supplemented with relevant modern
            scientific standards which are in tune with Ayurvedic concepts. All
            such standards that Ayurvedic medicine manufacturing at SDL adheres
            to, have been compiled under the caption of{' '}
            <strong>Shree Dhootapapeshwar Standards</strong>. It is the
            compilation of protocols that validates the classical Ayurvedic
            formulations to the expectations of Modern Medical Practitioners.
            Continuous updation and adaptation of modern Pharmaceutical
            technologies is the hallmark of its mandate;
          </p> */}
          <p className={styles['ethos-text']}>
            SDL holds its formulations to standards higher than what the law prescribes. That is our warranty to every physician and patient who trusts this name.
            enchmarks. Neither compromised for the other.
          </p>
          <p className={styles['ethos-text']}>
            At the heart of it is a specific capability: reading classical texts, understanding the formulation critique, and converting that understanding into a repeatable manufacturing process. Batch to batch. Consistently.
          </p>
          <p className={`${styles['ethos-text']} mb-0`}>
            Every medicine bearing our name is Efficacious, Shastrashudha, Standardised, and Safe. SDS is what makes that warranty possible. First published in 2001. Now in its third edition.
          </p>
          {/* </div> */}
        </Col>
        <Col xs={12} lg={6}>
          <div className={styles['ethos-image-wrapper']}>
            <img src="/assets/images/aboutus/sds_page-0001.png" alt="Ethos" />
          </div>
        </Col>
      </Row>

      {/* <Row className="mt-2">
        <Col xs={12}>
          <div className={styles['ethos-text-wrapper']}>
            <p className={styles['ethos-bold-text']}>
              <strong>
                Our ability to read texts, cogently understand the critique and
                convert that into manufacturing process to give you batch to
                batch consistency is something we have been very proud of.
              </strong>
            </p>
          </div>
        </Col>
      </Row> */}

      {/* <Row className="mt-2">
        <Col xs={12}>
        
          <p className={styles['ethos-text']}>
            <strong>SDS</strong> means a warranty for{' '}
            <em>Efficacious, Shastrashuddha, Standardised and Safe</em> Ayurved
            medicines.
          </p>
          <p className={styles['ethos-text']}>
            Research and standardisation of present high-performance drugs has
            been a hallmark of this team&apos;s achievements over the years.
          </p>
          <ul className={styles['ethos-list']}>
            <li>
              The first edition of SDS was released in a grand ceremony at
              Panvel in 2001 by the hands of the renowned Ayurvedic doyen of our
              times Vd. Appa ( K.K.Kanitkar).
            </li>
            <li>
              The 3<sup>rd</sup> edition of was released on 21<sup>st</sup>{' '}
              August 2010 in Mumbai by the hands of Dr.Ramesh Babu Devalla,
              Director General, CCRAS, Govt. of India.
            </li>
          </ul>
         
        </Col>
      </Row> */}

      {/* <Row className="mt-2">
        <Col xs={12}>
          <div className={styles['ethos-text-wrapper']}>
            <p className={styles['ethos-bold-text']}>
              <strong>
                Our standards are always at a higher threshold than what the law
                of the land prescribes, which is our warranty to the Ayurved
                fraternity in the quality that we have inherently reposed in our
                formulations.
              </strong>
            </p>
          </div>
        </Col>
      </Row> */}
    </WrapperComponent>
  );
};

export default EthosSection;
