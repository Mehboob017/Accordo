'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import styles from './CareerStats.module.scss';
import { useInView } from 'framer-motion';
import {
  FiAward,
  FiUsers,
  FiPackage,
  FiBriefcase,
} from 'react-icons/fi';

const stats = [
  {
    id: 1,
    value: 150,
    suffix: '+',
    label: 'Years of Ayurvedic legacy',
    icon: FiAward,
  },
  {
    id: 2,
    value: 500,
    suffix: '+',
    label: 'Passionate team members',
    icon: FiUsers,
  },
  {
    id: 3,
    value: 25,
    suffix: '+',
    label: 'Innovative products & lines',
    icon: FiPackage,
  },
  {
    id: 4,
    value: 10,
    suffix: '+',
    label: 'Departments & career paths',
    icon: FiBriefcase,
  },
];

const AnimatedStat = ({ value, suffix, inView }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const duration = 1500;
    const frameRate = 30;
    const totalFrames = Math.round((duration / 1000) * frameRate);
    let frame = 0;

    const counter = setInterval(() => {
      frame += 1;
      const progress = Math.min(frame / totalFrames, 1);
      const currentValue = Math.round(value * progress);
      setCount(currentValue);

      if (progress === 1) {
        clearInterval(counter);
      }
    }, 1000 / frameRate);

    return () => clearInterval(counter);
  }, [value, inView]);

  return (
    <>
      {count}
      {suffix}
    </>
  );
};

const CareerStats = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className={`${styles.section} `}>
      <div className="container-fluid-lg">
        <div className="row align-items-center">
          <div className=" col-12">
            <div className={styles.content}>
            <div className={styles.statsWrapper}>
            <div className={`row g-3 g-md-4 flex-nowrap ${styles.statsRow}`}>
              {stats.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.id} className="col-lg-3 col-sm-6 col-12">
                    <div className={styles.statCard}>
                      {/* <div className={styles.iconBox}>
                        <Icon />
                      </div> */}

                      <div className={styles.statValue}>
                        <AnimatedStat value={item.value} suffix={item.suffix} inView={isInView} />
                      </div>

                      <div className={styles.statLabel}>
                        {item.label}
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CareerStats;

