'use client';

import React from 'react';
import Link from 'next/link';
import WrapperComponent from '@/components/common/WrapperComponent';
import CustomHeading from '@/components/common/CustomHeading';
import { Col, Row } from 'reactstrap';
import styles from './ShopByCategory.module.scss';

// ─── Placeholder categories — exactly 7 categories matching the design ───────
const CATEGORIES = [
  {
    uid: '1',
    name: 'Wires & Cables',
    slug: 'wires-cables',
    bgColor: '#EDF2FF',
    image: '/assets/images/category/wire-coil.png',
  },
  {
    uid: '2',
    name: 'Switches & Sockets',
    slug: 'switches-sockets',
    bgColor: '#E3F6FC',
    image: '/assets/images/category/wire-coil.png',
  },
  {
    uid: '3',
    name: 'MCB & Distributions',
    slug: 'mcb-distributions',
    bgColor: '#FFEEDF',
    image: '/assets/images/category/wire-coil.png',
  },
  {
    uid: '4',
    name: 'Lighting & Fixtures',
    slug: 'lighting-fixtures',
    bgColor: '#F2FCD6',
    image: '/assets/images/category/wire-coil.png',
  },
  {
    uid: '5',
    name: 'Motors & Pumps',
    slug: 'motors-pumps',
    bgColor: '#EDF2FF',
    image: '/assets/images/category/wire-coil.png',
  },
  {
    uid: '6',
    name: 'Conduits & Fittings',
    slug: 'conduits-fittings',
    bgColor: '#E3F6FC',
    image: '/assets/images/category/wire-coil.png',
  },
  {
    uid: '7',
    name: 'Tools & Accessories',
    slug: 'tools-accessories',
    bgColor: '#FFEEDF',
    image: '/assets/images/category/wire-coil.png',
  },
];

const ShopByCategory = () => {
  // Enforce limit of 7 categories
  const categories = CATEGORIES.slice(0, 7);

  if (!categories.length) return null;

  return (
    <WrapperComponent
      classes={{ sectionClass: `${styles['category-section']} section-b-space` }}
      noRowCol={true}
    >
      {/* ── Heading + Clean Text Link View All (matches design) ── */}
      <Row className="align-items-center mb-1">
        <Col xs={9} sm={10}>
          <CustomHeading
            customClass="mb-0"
            title="SHOP BY CATEGORY"
            subTitle="Find the right electrical supplies for every project."
          />
        </Col>
        <Col xs={3} sm={2} className="text-end">
          <Link prefetch={false} href="/collections" className={styles['view-all-link']}>
            View All
          </Link>
        </Col>
      </Row>

      {/* ── 7 Categories Grid (4 in a row on mobile) ── */}
      <div className={styles['category-grid']}>
        {categories.map((category) => (
          <Link
            key={category.uid}
            href={`/collections?category=${category.slug}`}
            className={styles['category-card']}
            aria-label={`Shop ${category.name}`}
          >
            {/* Circular bubble with pastel background and product image */}
            <div
              className={styles['category-bubble']}
              style={{ backgroundColor: category.bgColor }}
            >
              <img
                src={category.image}
                alt={category.name}
                className={styles['category-image']}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.src = '/assets/images/placeholder.png';
                }}
              />
            </div>

            {/* Category title */}
            <span className={styles['category-name']}>{category.name}</span>
          </Link>
        ))}
      </div>
    </WrapperComponent>
  );
};

export default ShopByCategory;
