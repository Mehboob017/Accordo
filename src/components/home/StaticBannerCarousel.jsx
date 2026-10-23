'use client';

import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { getImageProps } from 'next/image';
import Link from 'next/link';
import { preload } from 'react-dom';
import { heroCarouselSlider } from '@/data/SliderSettings';
import WrapperComponent from '../common/WrapperComponent';

// Static list of banner slides stored locally
// Each slide contains 2 images: one for desktop screens and one for mobile screens
export const STATIC_BANNER_SLIDES = [
  {
    id: 'static-banner-1',
    title: 'Immunity Support',
    desktopImage: '/assets/images/static-banners/1920-x-576-for-desktop-screens.webp',
    mobileImage: '/assets/images/static-banners/768-x-384-for-mobile-screens.webp',
    alt: 'Immunity Support',
    url: '/products/swamala-compound',
    isExternal: false,
  },
  {
    id: 'static-banner-2',
    title: 'Swamala Classic',
    desktopImage: '/assets/images/static-banners/Final .webp',
    mobileImage: '/assets/images/static-banners/Untitled design.webp',
    alt: 'Swamala Classic',
    url: '/products/swamala-classic',
    isExternal: false,
  },
  {
    id: 'static-banner-3',
    title: 'Swamala Compound SF',
    desktopImage: '/assets/images/static-banners/Jab sehat ka ho mamla, Daily do chammach SWamala.webp',
    mobileImage: '/assets/images/static-banners/Naturally Sweetened with Dates.webp',
    alt: 'Swamala Compound SF',
    url: '/products/swamala-compound-sf',
    isExternal: false,
  },
  {
    id: 'static-banner-4',
    title: 'Swamala Classic SF',
    desktopImage: '/assets/images/static-banners/swamala-classic-sf.webp',
    mobileImage: '/assets/images/static-banners/768-x-384-for-mobile-screen.webp',
    alt: 'Swamala Classic SF',
    url: '/products/swamala-classic-sf',
    isExternal: false,
  }
];

const BannerSlide = React.forwardRef(({ slide, isFirst, ...props }, ref) => {
  const url = slide.finalUrlPath || slide.url || slide.link;
  const isExternal = slide.onclickType === 'External' || slide.isExternal;

  const { tabIndex, 'aria-hidden': ariaHidden, className, style, onClick, ...restProps } = props;

  const desktopSrc = slide.desktopImage || slide.websiteImage || slide.image;
  const mobileSrc = slide.mobileImage || slide.image || slide.websiteImage;
  const altText =
    slide.alt || slide.websiteImageAlt || slide.imageAlt || 'Promotional featured banner';

  const commonProps = {
    alt: altText,
    title: altText,
    priority: isFirst,
    quality: 85,
  };

  const {
    props: { srcSet: desktopSrcSet, src: desktopUrl },
  } = getImageProps({
    ...commonProps,
    src: desktopSrc,
    width: 1440,
    height: 430,
  });

  const {
    props: { srcSet: mobileSrcSet, ...rest },
  } = getImageProps({
    ...commonProps,
    src: mobileSrc,
    width: 768,
    height: 250,
  });

  if (isFirst) {
    if (desktopUrl) {
      preload(desktopUrl, {
        as: 'image',
        imageSrcSet: desktopSrcSet,
        fetchPriority: 'high',
        media: '(min-width: 768px)',
      });
    }
    if (rest.src) {
      preload(rest.src, {
        as: 'image',
        imageSrcSet: mobileSrcSet,
        fetchPriority: 'high',
        media: '(max-width: 767px)',
      });
    }
  }

  const pictureElement = (
    <picture>
      <source media="(min-width: 768px)" srcSet={desktopSrcSet} />
      <source media="(max-width: 767px)" srcSet={mobileSrcSet} />
      <img
        {...rest}
        className="bg-img hero-carousel-image"
        style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
        loading={isFirst ? 'eager' : 'lazy'}
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
        ...style,
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

const StaticBannerCarousel = ({ slides = STATIC_BANNER_SLIDES }) => {
  const bannerSlidesList = slides || [];
  const [isSliderReady, setIsSliderReady] = useState(false);

  useEffect(() => {
    // Delay slider initialization to prevent layout thrashing during critical rendering path
    if (typeof window !== 'undefined') {
      const initSlider = () => setIsSliderReady(true);
      if ('requestIdleCallback' in window) {
        requestIdleCallback(initSlider, { timeout: 2000 });
      } else {
        setTimeout(initSlider, 500);
      }
    }
  }, []);

  if (bannerSlidesList.length === 0) {
    return null;
  }

  const isSingleSlide = bannerSlidesList.length === 1;

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
        sectionClass: 'section-b-space',
        row: 'm-0',
        col: 'px-0',
      }}
    >
      <div
        className="hero-carousel-section"
        aria-label="Promotional Highlights"
      >
        <div className="slider-banner hero-carousel-banner" style={{ minHeight: '150px' }}>
          {isSliderReady ? (
            <Slider {...sliderSettings}>
              {bannerSlidesList.map((slide, index) => (
                <BannerSlide key={slide.id || slide.uid || index} slide={slide} isFirst={index === 0} />
              ))}
            </Slider>
          ) : (
            <div style={{ display: 'flex', overflow: 'hidden' }}>
              <div style={{ width: '100%', flexShrink: 0 }}>
                <BannerSlide slide={bannerSlidesList[0]} isFirst={true} />
              </div>
            </div>
          )}
        </div>
      </div>
    </WrapperComponent>
  );
};

export default StaticBannerCarousel;
