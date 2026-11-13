'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import WrapperComponent from '@/components/common/WrapperComponent';
import CustomHeading from '@/components/common/CustomHeading';
import styles from './SaveAndShop.module.scss';

const DEFAULT_BANNERS = [
  {
    id: 'deals',
    title: 'Great Deals On Top Brands - 40% OFF',
    image: '/assets/images/save-shop/shop-banner1.png',
    link: '/collections',
    alt: 'Great Deals On Top Brands - Up to 40% OFF with Trusted Brands, Fast Delivery and Great Savings',
  },
  {
    id: 'bulk',
    title: 'Bulk Orders With Better Pricing',
    image: '/assets/images/save-shop/shop-banner2.png',
    link: '/contact-us',
    alt: 'Bulk Orders With Better Pricing for Businesses - Request a Quote with Competitive Bulk Pricing, GST Invoicing and Dedicated Support',
  },
  {
    id: 'ai-negotiation',
    title: 'Negotiate With AI',
    image: '/assets/images/save-shop/shop-banner3.png',
    link: '/collections',
    alt: 'Negotiate With AI - Get the best price with the help of Accordo AI negotiations',
  },
];

const SaveAndShop = ({
  title = 'MORE WAYS TO SAVE & SHOP',
  subTitle = 'Explore deals, business buying and AI-powered negotiation.',
  banners = DEFAULT_BANNERS,
}) => {
  if (!banners || !banners.length) return null;

  return (
    <WrapperComponent
      classes={{ sectionClass: `${styles['save-shop-section']} section-b-space` }}
      noRowCol={true}
    >
      {/* ── Section Header ── */}
      <CustomHeading
        customClass="mb-0"
        title={title}
        subTitle={subTitle}
      />

      {/* ── 3 Promotional Banners Grid ── */}
      <div className={styles['banners-grid']}>
        {banners.map((banner) => (
          <div key={banner.id} className={styles['banner-card-wrapper']}>
            <Link
              href={banner.link}
              className={styles['banner-card']}
              aria-label={banner.title}
            >
              <div className={styles['image-container']}>
                <Image
                  src={banner.image}
                  alt={banner.alt || banner.title}
                  width={600}
                  height={236}
                  sizes="(max-width: 767px) 100vw, (max-width: 1199px) 33vw, 420px"
                  className={styles['banner-image']}
                  priority={false}
                  quality={85}
                />
              </div>
            </Link>
          </div>
        ))}
      </div>
    </WrapperComponent>
  );
};

export default SaveAndShop;

