'use client';

import Slider from 'react-slick';
import Image, { getImageProps } from 'next/image';
import Link from 'next/link';
import { eventsCarouselSlider } from '@/data/SliderSettings';
import WrapperComponent from '../common/WrapperComponent';

const BannerSlide = ({ slide, isFirst }) => {
  const url = slide.finalUrlPath;
  const isExternal = slide.onclickType === 'External';

  // 2. Set up robust fallbacks.
  const desktopSrc = slide.websiteImage || slide.image;
  const mobileSrc = slide.image || slide.websiteImage;
  const altText =
    slide.websiteImageAlt || slide.imageAlt || 'Event promotional banner';

  // 3. Define common props to avoid repeating code
  const commonProps = {
    alt: altText,
    title: altText,
    priority: isFirst, // Next.js automatically sets fetchPriority="high" & loading="eager" if this is true
    quality: 85,
  };

  // 4. Extract srcSet for Desktop
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({
    ...commonProps,
    src: desktopSrc,
    width: 1440,
    height: 550,
  });

  // 5. Extract srcSet for Mobile (along with the rest of the standard img props)
  const {
    props: { srcSet: mobileSrcSet, ...rest },
  } = getImageProps({
    ...commonProps,
    src: mobileSrc,
    width: 768,
    height: 550,
  });

  // 6. Build the native picture element
  const pictureElement = (
    <picture>
      {/* Desktop: screens 768px and wider */}
      <source media="(min-width: 768px)" srcSet={desktopSrcSet} />
      {/* Mobile: screens smaller than 768px */}
      <source media="(max-width: 767px)" srcSet={mobileSrcSet} />

      {/* Fallback standard img tag (required for <picture> to work) */}
      <img
        {...rest}
        className="bg-img hero-carousel-image"
        style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
      />
    </picture>
  );

  const content = url ? (
    isExternal ? (
      <Link href={url} target="_blank" rel="noopener noreferrer">
        {pictureElement}
      </Link>
    ) : (
      <Link href={url}>{pictureElement}</Link>
    )
  ) : (
    pictureElement
  );

  return (
    <div
      className="banner-contain hero-carousel-banner"
      style={{
        position: 'relative',
        backgroundColor: '#f3f4f6',
      }}
    >
      {content}
    </div>
  );
};

const EventsCarousel = ({ banners = [] }) => {
  if (!banners || banners.length === 0) {
    return null;
  }

  const isSingleSlide = banners.length === 1;

  const sliderSettings = {
    ...eventsCarouselSlider,
    dots: !isSingleSlide,
    arrows: !isSingleSlide,
    infinite: !isSingleSlide,
    autoplay: !isSingleSlide,
  };

  return (
    <WrapperComponent
      classes={{
        fluidClass: 'px-0',
        sectionClass: 'pt-0',
        row: 'm-0',
        col: 'px-0',
      }}
    >
      <div className="events-carousel-section hero-carousel-section">
        <div className="slider-banner hero-carousel-banner">
          <Slider {...sliderSettings}>
            {banners.map((banner, index) => (
              <div key={banner.uid}>
                <BannerSlide slide={banner} isFirst={index === 0} />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </WrapperComponent>
  );
};

export default EventsCarousel;
