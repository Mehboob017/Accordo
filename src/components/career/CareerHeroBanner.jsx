'use client';

import Slider from 'react-slick';
import Image from 'next/image';
import Link from 'next/link';
import { heroCarouselSlider } from '@/data/SliderSettings';
import WrapperComponent from '../common/WrapperComponent';
import styles from './CareerHeroBanner.module.scss';

// Static Banner Data
const bannerSlides = [
  // {
  //   uid: 1,
  //   type: 'image',
  //   image: '/assets/images/career/balance.jpg',
  //   imageAlt: 'Career Banner 1',
  //   finalUrlPath: '/about-us',
  //   onclickType: 'Internal',
  // },
  {
    uid: 2,
    type: 'video',
    video: '/assets/team-video1.mp4',
    // poster: '/assets/english_low_res.mp4',
    imageAlt: 'Career Video Banner',
    finalUrlPath: '',
    onclickType: 'Internal',
  },
];

const BannerSlide = ({ slide, isFirst }) => {
  const url = slide.finalUrlPath;
  const isExternal = slide.onclickType === 'External';

  const media =
    slide.type === 'video' ? (
      <video
        className="bg-img hero-carousel-image"
        autoPlay
        muted
        loop
        playsInline
        preload={isFirst ? 'auto' : 'metadata'}
        poster={slide.poster}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          objectPosition: 'top'
        }}
      >
        <source src={slide.video} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    ) : (
      <Image
        src={slide.image}
        className="bg-img hero-carousel-image"
        alt={slide.imageAlt}
        title={slide.imageAlt}
        width={1440}
        height={550}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1440px"
        priority={isFirst}
        loading={isFirst ? 'eager' : 'lazy'}
        fetchPriority={isFirst ? 'high' : 'low'}
        quality={85}
      />
    );

  const content =
    url && slide.type !== 'video' ? (
      isExternal ? (
        <Link href={url} target="_blank" rel="noopener noreferrer">
          {media}
        </Link>
      ) : (
        <Link href={url}>{media}</Link>
      )
    ) : (
      media
    );

  return (
    <div
      className={`banner-contain hero-carousel-banner ${styles.as16}`}
      style={{
        position: 'relative',
        backgroundColor: '#f3f4f6',
      }}
    >
      {content}
    </div>
  );
};

const CareerHeroBanner = () => {
  const isSingleSlide = bannerSlides.length === 1;

  const sliderSettings = {
    ...heroCarouselSlider,
    dots: !isSingleSlide,
    arrows: !isSingleSlide,
    infinite: !isSingleSlide,
    autoplay: !isSingleSlide,
    autoplaySpeed: 3000,
    speed: 700,
    pauseOnHover: true,
    pauseOnFocus: true,
    lazyLoad: 'progressive',
  };

  return (
    // <WrapperComponent
    //   classes={{ sectionClass: 'blog-section section-b-space' }}
    //   customCol={true}
    // >
    <div
      className="hero-carousel-section"
      aria-label="Featured Promotions"
    >
      <div className="slider-banner hero-carousel-banner">
        <Slider {...sliderSettings}>
          {bannerSlides.map((slide, index) => (
            <div key={slide.uid}>
              <BannerSlide slide={slide} isFirst={index === 0} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
    // </WrapperComponent>
  );
};

export default CareerHeroBanner;
