'use client';

import WrapperComponent from '@/components/common/WrapperComponent';

const PageBanner = ({ title, subtitle }) => {
  return (
    <WrapperComponent
      classes={{ sectionClass: 'blog-section section-b-space' }}
      customCol={true}
    >
      <div className="hero-carousel-section" aria-label="Featured Promotions">
        <div className="text-center">
          <h1 className="events-title">{title}</h1>
          {subtitle && (
            <p className="events-subtitle">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </WrapperComponent>
  );
};

export default PageBanner;
