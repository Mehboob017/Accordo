'use client';

import { useMemo } from 'react';
import Slider from 'react-slick';
import { Col, Row } from 'reactstrap';
import WrapperComponent from '@/components/common/WrapperComponent';
import CustomHeading from '@/components/common/CustomHeading';
import TestimonialCard from './TestimonialCard';
import { TESTIMONIALS } from './testimonials.data';
import styles from './TestimonialSection.module.scss';

const TestimonialSection = ({ testimonials = [] }) => {
  const sliderTestimonials = useMemo(() => {
    if (!Array.isArray(testimonials)) return [];
    // if (testimonials.length <= 1) return testimonials;
    // if (testimonials.length < 6) return [...testimonials, ...testimonials];
    // if (testimonials.length <= 1) return testimonials;
    // if (testimonials.length < 6) return [...testimonials, ...testimonials];
    return testimonials;
  }, [testimonials]);

  const sliderSettings = useMemo(
    () => ({
      dots: true,
      arrows: true,
      infinite: sliderTestimonials.length > 1,
      autoplay: sliderTestimonials.length > 1,
      autoplaySpeed: 2500,
      speed: 650,
      slidesToShow: 4,
      slidesToScroll: 1,
      pauseOnHover: true,
      responsive: [
        {
          breakpoint: 1400,
          settings: {
            slidesToShow: 3,
          },
        },
        {
          breakpoint: 992,
          settings: {
            slidesToShow: 2,
          },
        },
        {
          breakpoint: 576,
          settings: {
            slidesToShow: 1,
          },
        },
      ],
    }),
    [sliderTestimonials.length]
  );

  return (
    <WrapperComponent
      classes={{
        sectionClass: `section-b-space ${styles['testimonial-section']}`,
      }}
      noRowCol={true}
    >
      {/* <Row className={styles['testimonial-section__head-row']}>
        <Col xs={12}>
          <CustomHeading
            title="Reviews From Our Users"
            // subTitle="Testimonials"
            customTitleClass={styles['testimonial-section__heading']}
          />
        </Col>
      </Row> */}

      <Row>
        <Col xs={12} className={styles['testimonial-section__slider-col']}>
          <div className={styles['testimonial-section__slider-shell']}>
            <Slider {...sliderSettings}>
              {sliderTestimonials.map((testimonial, index) => (
                <div
                  className={styles['testimonial-section__slide']}
                  key={index}
                >
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </Slider>
          </div>
        </Col>
      </Row>
    </WrapperComponent>
  );
};

export default TestimonialSection;
