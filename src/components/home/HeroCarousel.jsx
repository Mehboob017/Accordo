'use client';

import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import Link from 'next/link';
import { preload } from 'react-dom';
import { heroCarouselSlider } from '@/data/SliderSettings';
import WrapperComponent from '../common/WrapperComponent';
import { useHeroBanner, useHome } from '@/utils/hooks/useHome';
import { getOptimizedCdnImageUrl } from '@/utils/helpers';

const BannerSlide = React.forwardRef(({ slide, isFirst, ...props }, ref) => {
  const url = slide.finalUrlPath;
  const isExternal = slide.onclickType === 'External';

  const { tabIndex, 'aria-hidden': ariaHidden, className, style, onClick, ...restProps } = props;

  const desktopSrc = slide.websiteImage || slide.image;
  const mobileSrc = slide.image || slide.websiteImage;
  const altText =
    slide.websiteImageAlt || slide.imageAlt || 'Promotional featured banner';

  const desktopOptimized = getOptimizedCdnImageUrl(desktopSrc, 1440, 430, 85);
  const mobileOptimized = getOptimizedCdnImageUrl(mobileSrc, 768, 250, 85);

  if (isFirst) {
    if (desktopOptimized) {
      preload(desktopOptimized, {
        as: 'image',
        fetchPriority: 'high',
        media: '(min-width: 768px)',
      });
    }
    if (mobileOptimized) {
      preload(mobileOptimized, {
        as: 'image',
        fetchPriority: 'high',
        media: '(max-width: 767px)',
      });
    }
  }

  const pictureElement = (
    <picture>
      <source media="(min-width: 768px)" srcSet={desktopOptimized} width={1440} height={430} />
      <source media="(max-width: 767px)" srcSet={mobileOptimized} width={768} height={250} />
      <img
        src={desktopOptimized}
        alt={altText}
        title={altText}
        width={1440}
        height={430}
        className="bg-img hero-carousel-image"
        style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
        loading={isFirst ? 'eager' : 'lazy'}
        fetchPriority={isFirst ? 'high' : 'auto'}
        decoding={isFirst ? 'sync' : 'async'}
      />
    </picture>
  );

  const content = url ? (
    isExternal ? (
      <Link prefetch={false} href={url} target="_blank" rel="noopener noreferrer" tabIndex={tabIndex}>
        {pictureElement}
      </Link>
    ) : (
      <Link prefetch={false} href={url} tabIndex={tabIndex}>{pictureElement}</Link>
    )
  ) : (
    pictureElement
  );

  return (
    <div
      ref={ref}
      className={`banner-contain hero-carousel-banner ${className || ''}`}
      style={{
        position: 'relative',
        backgroundColor: '#f3f4f6',
        display: 'block',
        ...style
      }}
      aria-hidden={ariaHidden}
      onClick={onClick}
      {...restProps}
    >
      {content}
    </div>
  );
});
BannerSlide.displayName = 'BannerSlide';

const HeroCarousel = () => {
  const { data } = useHeroBanner();
  const homeBannerSlidesList = data?.data?.banner || [];

  const [isSliderReady, setIsSliderReady] = useState(false);

  useEffect(() => {
    // Delay slider initialization to prevent layout thrashing (t.getWidth) during critical rendering path
    if (typeof window !== 'undefined') {
      const initSlider = () => setIsSliderReady(true);
      if ('requestIdleCallback' in window) {
        requestIdleCallback(initSlider, { timeout: 2000 });
      } else {
        setTimeout(initSlider, 500);
      }
    }
  }, []);

  if (homeBannerSlidesList.length === 0) {
    return null;
  }

  const isSingleSlide = homeBannerSlidesList.length === 1;

  const sliderSettings = {
    ...heroCarouselSlider,
    dots: !isSingleSlide,
    arrows: !isSingleSlide,
    infinite: !isSingleSlide,
    autoplay: !isSingleSlide,
    autoplaySpeed: 6000,
    speed: 300,
    pauseOnHover: true,
    pauseOnFocus: true,
    lazyLoad: 'progressive',
  };

  return (
    <WrapperComponent
      classes={{
        fluidClass: 'px-0',
        sectionClass: 'pt-0 section-b-space',
        row: 'm-0',
        col: 'px-0',
      }}
    >
      <div
        className="hero-carousel-section newcss"
        aria-label="Featured Promotions"
      >
        <div className="slider-banner hero-carousel-banner" style={{ minHeight: '150px' }}>
          {isSliderReady ? (
            <Slider {...sliderSettings}>
              {homeBannerSlidesList.map((slide, index) => (
                <BannerSlide key={slide.uid} slide={slide} isFirst={index === 0} />
              ))}
            </Slider>
          ) : (
            <div style={{ display: 'flex', overflow: 'hidden' }}>
              <div style={{ width: '100%', flexShrink: 0 }}>
                <BannerSlide slide={homeBannerSlidesList[0]} isFirst={true} />
              </div>
            </div>
          )}
        </div>
      </div>
    </WrapperComponent>
  );
};

export default HeroCarousel;
