'use client';

import WrapperComponent from '@/components/common/WrapperComponent';

const Banner = () => {
  return (
    <WrapperComponent
      classes={{ sectionClass: 'blog-section section-b-space' }}
      customCol={true}
    >
      <div className="hero-carousel-section" aria-label="Featured Promotions">
        <div className="text-center">
          <h1 className="events-title">Associations & Initiatives</h1>
          <p className="events-subtitle">
            World's first ISO 9001 Ayurvedic Manufacturer
          </p>
        </div>
      </div>
    </WrapperComponent>
  );
};

export default Banner;
