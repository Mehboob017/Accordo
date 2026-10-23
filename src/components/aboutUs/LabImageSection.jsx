'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Slider from 'react-slick';
import { latestBlogSlider } from '@/data/SliderSettings';
import CustomHeading from '@/components/common/CustomHeading';
import { LeafSVG } from '@/components/common/CommonSVG';
import styles from './LabImageSection.module.scss';

const galleryItems = [
  {
    id: 1,
    image: '/assets/images/lab/Lab2.webp',
  },
  {
    id: 2,
    image: '/assets/images/lab/Lab3.webp',
  },
  {
    id: 3,
    image: '/assets/images/lab/lab.webp',
  },
  {
    id: 4,
    image: '/assets/images/lab/lab1.webp',
  },
];

const sliderConfig = {
  ...latestBlogSlider,
  arrows: true,
  infinite: false,
  slidesToShow: 3,
  responsive: [
    { breakpoint: 1400, settings: { slidesToShow: 3 } },
    { breakpoint: 1024, settings: { slidesToShow: 3 } },
    { breakpoint: 876, settings: { slidesToShow: 2 } },
    { breakpoint: 576, settings: { slidesToShow: 1 } },
  ],
};

const LabImageSection = () => {
  const sliderRef = useRef(null);

  return (
    <section className={`${styles.section} related-blogs-section section-lg-space`}>
      <div className="container-fluid-lg">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 title mb-3 mb-md-4">
          <CustomHeading
            customClass="mb-0"
            title="Our Laboratory"
            subTitle="Glimpses of our state-of-the-art facilities"
            svgUrl={<LeafSVG className="icon-width" />}
          />
        </div>

        <div className={`hero-carousel-section ${styles.sliderWrapper}`}>
          <Slider ref={sliderRef} {...sliderConfig}>
            {galleryItems.map((item) => (
              <div key={item.id} className='h-100'>
                <div className={`${styles.card} h-100`}>
                  <div className={`${styles.cardImageWrapper} h-100`}>
                    <Image
                      src={item.image}
                      alt="Lab gallery"
                      width={600}
                      height={400}
                      className={styles.cardImage}
                    />
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default LabImageSection;
