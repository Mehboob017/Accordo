'use client';

import React from 'react';
import {
  RiHeartPulseLine,
  RiBarChart2Line,
  RiMedalLine,
  RiTeamLine,
  RiTimeLine,
  RiLeafLine,
} from 'react-icons/ri';
import styles from './CareerBenefits.module.scss';
import CustomHeading from '../common/CustomHeading';
import { LeafSVG } from '../common/CommonSVG';

const benefits = [
  {
    id: 1,
    title: 'Comprehensive Health Support',
    description:
      'Access wellness-focused healthcare benefits that keep you and your family supported and cared for.',
    icon: RiHeartPulseLine,
  },
  {
    id: 2,
    title: 'Growth & Learning',
    description:
      'Upskill with continuous learning opportunities, mentorship, and exposure to new challenges.',
    icon: RiBarChart2Line,
  },
  {
    id: 3,
    title: 'Performance Rewards',
    description:
      'Get recognized and rewarded for your contributions through competitive compensation and incentives.',
    icon: RiMedalLine,
  },
  {
    id: 4,
    title: 'Inclusive Culture',
    description:
      'Work in a collaborative, inclusive environment where every voice is heard and valued.',
    icon: RiTeamLine,
  },
  {
    id: 5,
    title: 'Work–Life Balance',
    description:
      'Enjoy flexible, people-first policies that help you balance your professional and personal life.',
    icon: RiTimeLine,
  },
  {
    id: 6,
    title: 'Purpose-Driven Work',
    description:
      'Contribute to meaningful projects that positively impact people’s lives and well-being.',
    icon: RiLeafLine,
  },
];

const CareerBenefits = () => {
  return (
    <section className={`${styles.section} section-b-space section-lg-space`}>
      <div className="container-fluid-lg">
        {/* <div className="row justify-content-center">
          <div className="col-12 text-center">
            <h2 className={styles.heading}>Benefits &amp; Perks</h2>
            <p className={styles.subHeading}>
              We believe great work happens when people feel supported, inspired, and rewarded.
            </p>
          </div>
        </div> */}

        <CustomHeading
            customClass="mb-0"
            title="Benefits &amp; Perks"
            subTitle="We believe great work happens when people feel supported, inspired, and rewarded."
            svgUrl={<LeafSVG className="icon-width" />}
          />

        <div className="row g-3 g-md-4">
          {benefits.map((item) => (
            <div key={item.id} className="col-xl-4 col-md-6 col-sm-12">
              <div className={styles.card}>
                <div className={styles.iconWrapper}>
                  <div className={styles.iconCircle}>
                    <item.icon className={styles.icon} aria-hidden="true" />
                  </div>
                </div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDescription}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CareerBenefits;

