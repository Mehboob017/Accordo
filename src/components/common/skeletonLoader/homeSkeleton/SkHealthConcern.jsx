/**
 * Health concerns skeleton (carousel) shown while loading.
 * Reuses the project's global skeleton styles from `public/assets/scss/components/_loader.scss`.
 */
'use client';

import React from 'react';
import Slider from 'react-slick';
import styles from '@/components/home/HealthConcerns.module.scss';

const SkHealthConcern = ({ count = 10, sliderSettings = {} }) => {
  const skeletonItems = Array.from({ length: count }, (_, index) => index);

  return (
    <div
      className={`hero-carousel-section ${styles['health-concerns-slider-outer']}`}
    >
      <div className={styles['health-concerns-slider-inner']}>
        <Slider {...sliderSettings}>
          {skeletonItems.map((i) => (
            <div key={i}>
              <div
                className={styles['health-concern-card']}
                style={{ cursor: 'default', pointerEvents: 'none' }}
              >
                <div
                  className="skeleton"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                  }}
                >
                  <div className={styles['health-concern-image-wrapper']}>
                    <div
                      className="skeleton__img"
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 16,
                      }}
                    />
                  </div>

                  {/* Two-line text placeholder (matches the line-clamp vibe) */}
                  <div style={{ width: '100%', textAlign: 'center' }}>
                    <div
                      className="skeleton__p"
                      style={{
                        height: 14,
                        width: '70%',
                        margin: '0 auto 8px',
                      }}
                    />
                    <div
                      className="skeleton__p"
                      style={{
                        height: 14,
                        width: '55%',
                        margin: '0 auto',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default SkHealthConcern;