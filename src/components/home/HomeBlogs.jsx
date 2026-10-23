'use client';

import { useEffect, useRef } from 'react';
import { Row } from 'reactstrap';
import Link from 'next/link';
import WrapperComponent from '@/components/common/WrapperComponent';
import FeatureBlog from '@/components/parisTheme/FeatureBlog';
import { useHome, useLatestBlogs } from '@/utils/hooks/useHome';
import CustomHeading from '@/components/common/CustomHeading';
import { LeafSVG } from '@/components/common/CommonSVG';
import Btn from '@/elements/buttons/Btn';
import SkHomeBlogs from '@/components/common/skeletonLoader/homeSkeleton/SkHomeBlogs';

const HomeBlogs = () => {
  // const { data } = useHome();
  const { data, isLoading } = useLatestBlogs();

  const sliderRef = useRef(null);
  const sliderContainerRef = useRef(null);

  const homeBlogs = data?.data?.latestBlogs?.slice(0, 8) || [];

  useEffect(() => {
    if (!homeBlogs.length) return;

    // react-slick can calculate width late on small devices; force recalculation
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      sliderRef.current?.slickGoTo?.(0, true);
    }, 120);

    return () => clearTimeout(timer);
  }, [homeBlogs.length]);

  useEffect(() => {
    const container = sliderContainerRef.current;
    if (!container) return;

    const updateInertState = () => {
      const slides = container.querySelectorAll('.slick-slide');
      slides.forEach((slide) => {
        const isHidden = slide.getAttribute('aria-hidden') === 'true';
        if (isHidden) {
          if (!slide.hasAttribute('inert')) {
            slide.setAttribute('inert', '');
            slide.inert = true;
          }
        } else {
          if (slide.hasAttribute('inert')) {
            slide.removeAttribute('inert');
            slide.inert = false;
          }
        }
      });
    };

    updateInertState();

    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      for (let i = 0; i < mutations.length; i++) {
        const mutation = mutations[i];
        if (
          (mutation.type === 'attributes' &&
            (mutation.attributeName === 'aria-hidden' ||
              mutation.attributeName === 'class')) ||
          mutation.type === 'childList'
        ) {
          shouldUpdate = true;
          break;
        }
      }
      if (shouldUpdate) {
        updateInertState();
      }
    });

    observer.observe(container, {
      attributes: true,
      attributeFilter: ['aria-hidden', 'class'],
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [homeBlogs]);

  // Blog slider configuration
  const blogSliderConfig = {
    // ...latestBlogSlider,
    // infinite: false,
    // draggable: true,
    // swipe: true,
    // swipeToSlide: true,
    // waitForAnimate: false,
    // touchThreshold: 10,
    className: 'ratio_87',
    dots: true,
    arrows: true,
    infinite: homeBlogs.length > 1,
    autoplay: homeBlogs.length > 1,
    autoplaySpeed: 3500,
    speed: 650,
    slidesToShow: 4,
    slidesToScroll: 1,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 876,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  if (isLoading) {
    return <SkHomeBlogs />;
  }

  if (!homeBlogs.length) return null;

  return (
    <WrapperComponent
      classes={{ sectionClass: 'home-blogs-section section-b-space' }}
      noRowCol
    >
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 title">
        <CustomHeading
          customClass="mb-0"
          title="Latest Blogs"
          subTitle="Explore Our Insights"
          svgUrl={<LeafSVG className="icon-width" />}
        />
        <div className="d-none d-lg-flex">
          <Link prefetch={false} draggable={false} href="/blogs">
            <Btn color="primary" size="md">
              View More
            </Btn>
          </Link>
        </div>
      </div>
      <div ref={sliderContainerRef} className="hero-carousel-section mt-4">
        <Row>
          <FeatureBlog
            classes={{
              sliderClass: 'col-12 home-blogs-slider',
              sliderOption: blogSliderConfig,
            }}
            sliderRef={sliderRef}
            blogs={homeBlogs}
          />
        </Row>
      </div>
      <div className="d-flex d-lg-none justify-content-center mt-4">
        <Link prefetch={false} draggable={false} href="/blogs">
          <Btn color="primary" size="md">
            View More
          </Btn>
        </Link>
      </div>
    </WrapperComponent>
  );
};

export default HomeBlogs;
