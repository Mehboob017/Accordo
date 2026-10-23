'use client';

import React from 'react';
import Link from 'next/link';
import Slider from 'react-slick';
import WrapperComponent from '@/components/common/WrapperComponent';
import { Col, Row } from 'reactstrap';
import CustomHeading from '@/components/common/CustomHeading';
import { LeafSVG } from '@/components/common/CommonSVG';
import { useHome } from '@/utils/hooks/useHome';
import styles from './ShopByDepartment.module.scss';
// import SkShopByDepartment from '@/components/common/skeletonLoader/homeSkeleton/SkShopByDepartment';
import { brandLogo } from '@/data/CommonPath';
import { useDepartments } from '@/utils/hooks/useDepartments';

const sliderSettings = {
  dots: false,
  arrows: true,
  infinite: true,
  speed: 400,
  slidesToScroll: 1,
  slidesToShow: 3,
  swipeToSlide: true,
  responsive: [
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
};

const ShopByDepartment = () => {
  // const { data } = useHome();
  const { data } = useDepartments();

  const departments = data?.data?.departments || [];

  // Show skeleton while loading
  // if (isLoading) {
  //   return (
  //     <WrapperComponent
  //       classes={{
  //         sectionClass: `${styles['department-section']} section-b-space`,
  //       }}
  //       noRowCol={true}
  //     >
  //       <Row>
  //         <Col>
  //           <CustomHeading
  //             customClass="mb-0"
  //             title="Shop by Department"
  //             subTitle="Explore Our Top Departments"
  //             svgUrl={<LeafSVG className="icon-width" />}
  //           />
  //         </Col>
  //       </Row>

  //       <Row>
  //         <Col>
  //           <SkShopByDepartment count={5} sliderSettings={sliderSettings} />
  //         </Col>
  //       </Row>
  //     </WrapperComponent>
  //   );
  // }

  // Don't render anything if no data
  if (!departments.length) {
    return null;
  }

  return (
    <WrapperComponent
      classes={{
        sectionClass: `${styles['department-section']} section-b-space`,
      }}
      noRowCol={true}
    >
      <Row>
        <Col>
          <CustomHeading
            customClass="mb-0"
            title="Shop by Department"
            subTitle="Explore Our Top Departments"
            svgUrl={<LeafSVG className="icon-width" />}
          />
        </Col>
      </Row>

      <Row>
        <Col>
          <div
            className={`hero-carousel-section ${styles['department-slider-outer']}`}
          >
            <div className={styles['department-slider-inner']}>
              <Slider {...sliderSettings}>
                {departments.slice(0, 3).map((department) => (
                  <div key={department.uid}>
                    <Link
                      href={`/collections?department=${department.slug}`}
                      className={styles['department-card']}
                    >
                      <div className={styles['department-image-wrapper']}>
                        <img
                          src={department.image || brandLogo.src}
                          alt={
                            department.imageAlt ||
                            department.name ||
                            'Department Image'
                          }
                          className={styles['department-image']}
                          onError={(e) => {
                            e.currentTarget.src = brandLogo.src;
                          }}
                        />
                      </div>
                      <h3 className={styles['department-name']}>
                        {department.name}
                      </h3>
                    </Link>
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        </Col>
      </Row>
    </WrapperComponent>
  );
};

export default ShopByDepartment;
