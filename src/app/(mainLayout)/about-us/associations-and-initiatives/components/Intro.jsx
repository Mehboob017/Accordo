import React from 'react';
import styles from './Intro.module.scss';
import Image from 'next/image';
import omPharmaceuticalsImage from '/public/assets/images/aboutus/Om_Pharmaceuticals.webp';
import WrapperComponent from '@/components/common/WrapperComponent';
import CustomHeading from '@/components/common/CustomHeading';
import { Col, Row } from 'reactstrap';

const Intro = () => {
  return (
    <>
      {/* Manufacturing Plant */}
      <WrapperComponent
        classes={{ sectionClass: 'section-b-space' }}
        customCol={true}
      >
        <CustomHeading
          customClass="mb-0"
          title="Manufacturing Plant"
          subTitle="A Legacy of Ayurvedic Manufacturing Excellence Since 1871"
        />
        <Col xs={12}>
          <div className={styles.textContent}>
            <p>
              Located at Panvel, Maharashtra since 1872, Shree Dhootapapeshwar
              Ltd. has also been famous by the name of "Panvel Company'. Large
              scale manufacturing of various Ayurvedic formulations like Bhasma,
              Rasayanas, Arka, Avaleha, and other Ayurvedic specialty products
              of the company originated from this site.
            </p>
            <p>
              Spread over the total area of 7 acres, the plant has modern
              gadgets for upscaling of traditional methodology without
              compromising on the basic ethos of Ayurvediya Aushadhikaran that
              is Manufacturing of Ayurvedic Medicine at Industrial level.
            </p>
            <p>
              Even today many specialized Ayurvedic Generic dosage forms like
              Bhasma, Rasakalpa, Guti-Vati and so on continue to be manufactured
              from here.
            </p>
          </div>
        </Col>
        <Col lg={6} xs={12} className="mt-3">
          <img
            src="/assets/images/aboutus/Shree-Dhootapapeshwarmm.jpg"
            alt="Manufacturing Plant"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            className="rounded-3 overflow-hidden"
          />
        </Col>
        <Col lg={6} xs={12} className="mt-3">
          <img
            src="/assets/images/aboutus/factry.webp"
            alt="Manufacturing Plant"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            className="rounded-3 overflow-hidden"
          />
        </Col>
      </WrapperComponent>
      <WrapperComponent
        classes={{
          sectionClass: `${styles.section} section-b-space`,
        }}
        noRowCol={true}
      >
        <Row>
          <Col>
            <CustomHeading
              customClass="mb-0"
              title="Om Pharmaceutical Ltd."
              subTitle="World's first ISO 9001 ayurvedic manufacturer"
              // svgUrl={<LeafSVG className="icon-width" />}
            />
          </Col>
        </Row>

        <Row className={`g-4 flex-column-reverse flex-lg-row`}>
          <Col lg={6} xs={12}>
            <div>
              <p className={styles.text}>
                <strong>Om Pharmaceutical Ltd.</strong> is one of the first{' '}
                <strong>ISO 9001 certified</strong> companies. This
                manufacturing expert has also been accredited under GMP
                regulations. Located in the southern city of Bangalore, it also
                cultivate some of the key herbal inputs in production.
                Adaptation of technology and blend of traditional practices are
                witnessed in this manufacturing campus. Quality and increased
                productivity through interaction at all management levels is the
                key to it’s success. It’s infrastructure and capacities in{' '}
                <strong>
                  Syrup, Liniments, Tablets, Capsules, Gels, and Asavas
                </strong>{' '}
                are benchmarked to the best in Industry.
              </p>
              <p className={styles.text}>
                In Jun 2000 OPL (Om Pharmaceutical Ltd) was certified as World’s
                first ISO 9001 Company. The company has a full flagged
                manufacturing unit at Bengaluru, Karnataka.
              </p>
              <p className={styles.text}>
                The foundation stone of the Bengaluru plant was laid in 1973.
                April 1975 saw the completion of a modernized full fledged plant
                at Bengaluru. This plant has all the modern technologies for
                manufacturing of <strong>Asavarishtas</strong>. This is the
                plant designed to manufacture Asavarishtas at a mammoth capacity
                of 150,000 liters per month.
              </p>
              <p className={styles.text}>
                In 1979, Medicinal plant cultivation was started in Bangalore
                for captive consumption. Pilot studies were also conducted to
                determine the yield patterns of medicinal plants. Establishment
                of a herbarium at Bangalore plant was carried out for enhancing
                better quality herbs.
              </p>
            </div>
          </Col>

          <Col lg={6} xs={12}>
            <div className="rounded-3 overflow-hidden">
              <Image
                src={omPharmaceuticalsImage}
                width={1200}
                height={500}
                quality={100}
                alt="Om Pharmaceutical Ltd."
                className={`${styles.imgWrap} w-100 object-fit-cover`}
              />
            </div>
          </Col>
        </Row>
      </WrapperComponent>
    </>
  );
};

export default Intro;
