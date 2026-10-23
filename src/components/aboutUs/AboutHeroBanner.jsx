// 'use client';

// import Slider from 'react-slick';
// import Image from 'next/image';
// import Link from 'next/link';
// import { heroCarouselSlider } from '@/data/SliderSettings';
// import WrapperComponent from '../common/WrapperComponent';

// // Static Banner Images
// const bannerSlides = [
//   {
//     uid: 1,
//     image: '/assets/images/career/balance.jpg',
//     imageAlt: 'Career Banner 1',
//     finalUrlPath: '/about-us', 
//     onclickType: 'Internal',
//   },

// ];

// const BannerSlide = ({ slide, isFirst }) => {
//   const url = slide.finalUrlPath;
//   const isExternal = slide.onclickType === 'External';

//   const image = (
//     <Image
//       src={slide.image}
//       className="bg-img hero-carousel-image"
//       alt={slide.imageAlt}
//       title={slide.imageAlt}
//       width={1440}
//       height={550}
//       sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1440px"
//       priority={isFirst}
//       loading={isFirst ? 'eager' : 'lazy'}
//       fetchPriority={isFirst ? 'high' : 'low'}
//       quality={85}
//     />
//   );

//   const content = url ? (
//     isExternal ? (
//       <Link href={url} target="_blank" rel="noopener noreferrer">
//         {image}
//       </Link>
//     ) : (
//       <Link href={url}>{image}</Link>
//     )
//   ) : (
//     image
//   );

//   return (
//     <div
//       className="banner-contain hero-carousel-banner"
//       style={{
//         position: 'relative',
//         backgroundColor: '#f3f4f6',
//       }}
//     >
//       {content}
//     </div>
//   );
// };

// const CareerHeroBanner = () => {
//   const isSingleSlide = bannerSlides.length === 1;

//   const sliderSettings = {
//     ...heroCarouselSlider,
//     dots: !isSingleSlide,
//     arrows: !isSingleSlide,
//     infinite: !isSingleSlide,
//     autoplay: !isSingleSlide,
//     autoplaySpeed: 3000,
//     speed: 700,
//     pauseOnHover: true,
//     pauseOnFocus: true,
//     lazyLoad: 'progressive',
//   };

//   return (
//     <WrapperComponent
//       classes={{
//         fluidClass: 'px-0',
//         sectionClass: 'pt-0',
//         row: 'm-0',
//         col: 'px-0',
//       }}
//     >
//       <div
//         className="hero-carousel-section newcss"
//         aria-label="Featured Promotions"
//       >
//         <h2
//           className="visually-hidden"
//           style={{
//             position: 'absolute',
//             width: '1px',
//             height: '1px',
//             padding: 0,
//             margin: '-1px',
//             overflow: 'hidden',
//             clip: 'rect(0,0,0,0)',
//             border: 0,
//           }}
//         >
//           Featured Highlights
//         </h2>

//         <div className="slider-banner hero-carousel-banner">
//           <Slider {...sliderSettings}>
//             {bannerSlides.map((slide, index) => (
//               <div key={slide.uid}>
//                 <BannerSlide slide={slide} isFirst={index === 0} />
//               </div>
//             ))}
//           </Slider>
//         </div>
//       </div>
//     </WrapperComponent>
//   );
// };

// export default CareerHeroBanner;

'use client';

import Slider from 'react-slick';
import Image from 'next/image';
import Link from 'next/link';
import { heroCarouselSlider } from '@/data/SliderSettings';
import WrapperComponent from '../common/WrapperComponent';
import styles from './AboutHeroBanner.module.scss';

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
    video: '/assets/english_low_res.mp4',
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
        className={styles.heroVideo}
        autoPlay
        muted
        loop
        playsInline
        preload={isFirst ? 'auto' : 'metadata'}
        poster={slide.poster}
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
    <div className={styles.bannerContain}>
      {content}
    </div>
  );
};

const AboutHeroBanner = () => {
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
    <WrapperComponent
      classes={{
        fluidClass: 'px-0',
        sectionClass: 'pt-0',
        row: 'm-0',
        col: 'px-0',
      }}
    >
      <div
        className={styles.heroCarouselSection}
        aria-label="Featured Promotions"
      >
        <h2 className={styles.visuallyHidden}>
          Featured Highlights
        </h2>

        <div className={styles.sliderBanner}>
          <Slider {...sliderSettings}>
            {bannerSlides.map((slide, index) => (
              <div key={slide.uid}>
                <BannerSlide slide={slide} isFirst={index === 0} />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </WrapperComponent>
  );
};

export default AboutHeroBanner;