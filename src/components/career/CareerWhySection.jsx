import React from 'react';
import { RiLeafLine, RiFlaskLine, RiShieldCheckLine, RiRecycleLine } from 'react-icons/ri';
import { LeafSVG } from '@/components/common/CommonSVG';
import CustomHeading from '../common/CustomHeading';
import styles from './CareerWhySection.module.scss';

const items = [
  {
    id: 1,
    label: 'Clinically Proven',
  },
  {
    id: 2,
    label: '100% Natural',
  },
  {
    id: 3,
    label: 'Toxin Free',
  },
  {
    id: 4,
    label: 'Sustainable Packaging',
  },
];

const iconMap = {
  1: RiShieldCheckLine,
  2: RiLeafLine,
  3: RiFlaskLine,
  4: RiRecycleLine,
};

const CareerWhySection = () => {
  return (
    <section className={`${styles.why} section-b-space section-t-space`}>
      <div className="container-fluid-lg">
        <div className=''>
          <div className={styles.inner}>
            <CustomHeading
              customClass="mb-0 text-center"
              title="Why Shree Dhootapapeshwar?"
              subTitle="Know why our customers trust us"
              svgUrl={<LeafSVG className="icon-width" />}
            />

            <div className={`row g-3 g-md-4 ${styles.cardsRow}`}>
              {items.map((item) => {
                const Icon = iconMap[item.id];
                return (
                  <div
                    key={item.id}
                    className="col-md-3 col-3"
                  >
                    <div className={styles.card}>
                      <div className={styles.iconWrapper}>
                        <div className={styles.iconCircle}>
                          <Icon className={styles.icon} aria-hidden="true" />
                        </div>
                      </div>
                      <div className={styles.label}>{item.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CareerWhySection;

