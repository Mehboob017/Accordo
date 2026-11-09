'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Row, Col } from 'reactstrap';
import WrapperComponent from '@/components/common/WrapperComponent';
import CustomHeading from '@/components/common/CustomHeading';
import styles from './TopBrandsMarquee.module.scss';

// ── Static brand list matching design ─────────────────────────────────────────
const DEFAULT_BRANDS = [
  {
    id: 'havells',
    name: 'Havells',
    image: '/assets/images/brands/havells.png',
    link: '/collections?brand=havells',
    width: 91,
    height: 63,
  },
  {
    id: 'kei',
    name: 'KEI Wires & Cables',
    image: '/assets/images/brands/kei.png',
    link: '/collections?brand=kei',
    width: 130,
    height: 62,
  },
  {
    id: 'crompton',
    name: 'Crompton',
    image: '/assets/images/brands/crompton.png',
    link: '/collections?brand=crompton',
    width: 199,
    height: 50,
  },
  {
    id: 'legrand',
    name: 'Legrand',
    image: '/assets/images/brands/legrand.png',
    link: '/collections?brand=legrand',
    width: 129,
    height: 41,
  },
  {
    id: 'philips',
    name: 'Philips',
    image: '/assets/images/brands/philips.png',
    link: '/collections?brand=philips',
    width: 144,
    height: 37,
  },
];

// Ensure items array is sufficiently wide to avoid gaps on wide displays
const ensureSufficientItems = (list, minCount = 10) => {
  if (!list || list.length === 0) return [];
  let result = [...list];
  while (result.length < minCount) {
    result = [...result, ...list];
  }
  return result;
};

const TopBrandsMarquee = ({
  title = 'TOP BRANDS WE WORK WITH',
  subTitle = 'Quality products from most trusted names',
  viewAllText = 'View All',
  viewAllLink = '/collections',
  brands = DEFAULT_BRANDS,
  speed = 28,
  pauseOnHover = true,
}) => {
  const displayItems = useMemo(() => {
    return ensureSufficientItems(brands, 10);
  }, [brands]);

  const renderBrand = (brand, keyPrefix) => (
    <Link
      key={`${keyPrefix}-${brand.id}`}
      href={brand.link || '/collections'}
      className={styles.brandCard}
      aria-label={`Shop ${brand.name}`}
      prefetch={false}
    >
      <Image
        src={brand.image}
        alt={brand.name}
        width={brand.width || 140}
        height={brand.height || 48}
        className={styles.brandImage}
        // quality={90}
        loading="lazy"
      />
    </Link>
  );

  return (
    <WrapperComponent
      classes={{ sectionClass: `${styles['brands-section']} section-b-space` }}
      noRowCol={true}
    >
      {/* ── Section Header with Title + Subtitle and View All ── */}
      <Row className="align-items-center mb-2">
        <Col xs={8} sm={9} md={10}>
          <CustomHeading
            customClass="mb-0"
            title={title}
            subTitle={subTitle}
          />
        </Col>
        <Col xs={4} sm={3} md={2} className="text-end">
          <Link
            prefetch={false}
            href={viewAllLink}
            className={styles['view-all-link']}
          >
            {viewAllText}
          </Link>
        </Col>
      </Row>

      {/* ── Infinite Scrolling Marquee Track ── */}
      <div
        className={styles.marqueeWrapper}
        style={{ '--marquee-speed': `${speed}s` }}
        role="region"
        aria-label="Top Brands Marquee"
      >
        <div className={styles.marqueeTrack}>
          <div className={styles.marqueeGroup}>
            {displayItems.map((brand, index) =>
              renderBrand(brand, `primary-${index}`)
            )}
          </div>
          <div className={styles.marqueeGroup} aria-hidden="true">
            {displayItems.map((brand, index) =>
              renderBrand(brand, `clone-${index}`)
            )}
          </div>
        </div>
      </div>
    </WrapperComponent>
  );
};

export default TopBrandsMarquee;
