'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Row, Col } from 'reactstrap';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import WrapperComponent from '../common/WrapperComponent';
import CustomHeading from '../common/CustomHeading';
import styles from './Milestonessection.module.scss';

/**
 * milestones: array of
 *   { year: string, title: string, text: string, image: string }
 * image should point to /public (e.g. "/images/milestones/1972.jpg")
 * or a remote URL allowed in next.config.js under images.remotePatterns.
 */
export default function MilestonesSection({
  milestones = [],
  initialIndex = 0,
}) {
  const [active, setActive] = useState(initialIndex);
  const railRef = useRef(null);
  const sectionRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const moveTo = useCallback(
    (idx) => {
      const clamped = Math.min(milestones.length - 1, Math.max(0, idx));
      setActive(clamped);
    },
    [milestones.length]
  );

  const go = useCallback((dir) => moveTo(active + dir), [active, moveTo]);

  useEffect(() => {
    if (railRef.current) {
      const activeElement = railRef.current.querySelector(`.${styles.active}`);
      const firstElement = railRef.current.querySelector(`.${styles.railItem}`);

      if (activeElement && firstElement) {
        const rail = railRef.current;
        const railInner = rail.firstElementChild;
        const isHorizontal =
          window.getComputedStyle(railInner).flexDirection === 'row';

        if (isHorizontal) {
          const scrollLeft =
            activeElement.offsetLeft -
            firstElement.offsetLeft -
            rail.clientWidth / 2 +
            activeElement.clientWidth / 2;
          rail.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        } else {
          const scrollTop =
            activeElement.offsetTop -
            firstElement.offsetTop -
            rail.clientHeight / 2 +
            activeElement.clientHeight / 2;
          rail.scrollTo({ top: scrollTop, behavior: 'smooth' });
        }
      }
    }
  }, [active]);

  // Auto-play the slider every 3 seconds
  useEffect(() => {
    if (!milestones.length || !isInView) return;
    const timer = setTimeout(() => {
      setActive((current) => (current + 1) % milestones.length);
    }, 10000000);
    return () => clearTimeout(timer);
  }, [active, milestones.length, isInView]);

  if (!milestones.length) return null;

  const m = milestones[active];

  return (
    <div ref={sectionRef}>
      <WrapperComponent
        classes={{
          sectionClass: `section-b-space`,
        }}
        noRowCol={true}
      >
        <Row>
          <Col>
            <CustomHeading
              title="Milestones"
              subTitle="Milestones that define our legacy."
            />
          </Col>
        </Row>

        <div className={styles.container}>
          {/* desktop: vertical year rail, scrollable */}
          <div className={styles.rail} ref={railRef}>
            <div className={styles.railInner}>
              <div className={styles.railLine} />
              {milestones.map((slide, i) => (
                <button
                  key={slide.year}
                  onClick={() => moveTo(i)}
                  className={`${styles.railItem} ${i === active ? styles.active : ''}`}
                >
                  <div className={styles.railDotWrap}>
                    <span className={styles.railDot} />
                  </div>
                  <span className={styles.railYear}>{slide.year}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.sliderWrapper}>
            <section
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown' || e.key === 'ArrowRight') go(1);
                if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') go(-1);
              }}
              tabIndex={0}
              aria-roledescription="milestone slider"
              className={styles.section}
            >
              {/* background images, one per milestone, crossfaded */}
              {milestones.map((slide, i) => (
                <div
                  key={slide.year}
                  className={`${styles.bgSlide} ${i === active ? styles.active : ''}`}
                  aria-hidden={i !== active}
                >
                  <img
                    src={slide.image}
                    alt={slide.imageAlt}
                    width={1024}
                    height={600}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                    priority={i === 0}
                  />
                  <div className={styles.bgOverlay} />
                </div>
              ))}

              {/* content card */}
              <div className={styles.cardWrap}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={m.year}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className={styles.card}
                  >
                    <div className={styles.cardYear}>{m.year}</div>
                    <ul className={styles.cardTitleList}>
                      {m.title.map((item, index) => (
                        <li key={index} className={styles.cardTitle}>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className={styles.cardText}>{m.text}</p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* progress bar, desktop only */}
              <div className={styles.progress}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${((active + 1) / milestones.length) * 100}%`,
                  }}
                />
              </div>
            </section>

            <button
              className={styles.navButtonLeft}
              onClick={() => go(-1)}
              aria-label="Previous milestone"
            >
              <FiChevronLeft size={24} />
            </button>

            <button
              className={styles.navButtonRight}
              onClick={() => go(1)}
              aria-label="Next milestone"
            >
              <FiChevronRight size={24} />
            </button>
          </div>
        </div>
      </WrapperComponent>
    </div>
  );
}
