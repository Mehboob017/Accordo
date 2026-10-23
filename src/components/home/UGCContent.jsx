'use client';

import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useHome, useTestimonials } from '@/utils/hooks/useHome';
import dynamic from 'next/dynamic';
import { Col, Row } from 'reactstrap';
import Slider from 'react-slick';
import WrapperComponent from '@/components/common/WrapperComponent';
import CustomHeading from '@/components/common/CustomHeading';
import { LeafSVG } from '@/components/common/CommonSVG';
import SkUGCContent from '@/components/common/skeletonLoader/homeSkeleton/SkUGCContent';
import UGCCard from './ugc/UGCCard';

const UGCVideoOverlay = dynamic(() => import('./ugc/UGCVideoOverlay'), {
  ssr: false,
});

function getYouTubeId(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    // youtu.be/VIDEO_ID
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1);
    }

    // youtube.com/watch?v=VIDEO_ID
    const videoId = parsed.searchParams.get('v');
    if (videoId) {
      return videoId;
    }

    // youtube.com/embed/VIDEO_ID
    const embedMatch = parsed.pathname.match(/\/embed\/([^/?]+)/);
    if (embedMatch) {
      return embedMatch[1];
    }

    // youtube.com/shorts/VIDEO_ID
    const shortsMatch = parsed.pathname.match(/\/shorts\/([^/?]+)/);
    if (shortsMatch) {
      return shortsMatch[1];
    }

    return null;
  } catch {
    return null;
  }
}

const getIsInfinite = (length, slidesToShow) => length > slidesToShow;

const UGCContent = () => {
  const sliderContainerRef = useRef(null);
  // const { data } = useHome();
  const { data, isLoading } = useTestimonials();

  // console.log({ data })

  const [overlayOpen, setOverlayOpen] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  const testimonials = useMemo(() => {
    const items = data?.data?.testimonials || [];

    return items.map((item) => ({
      id: item?.uid,
      // id: item?.product.uid,
      // uid: item?.product.uid,
      name: item?.name,
      handle: item?.designation,
      views: null,
      lowestVariant: item?.lowestVariant,
      thumbnailUrl:
        item?.videoUrl?.includes('youtube.com') ||
          item?.videoUrl?.includes('youtu.be')
          ? `https://img.youtube.com/vi/${getYouTubeId(item?.videoUrl)}/hqdefault.jpg`
          : item?.image,
      videoUrl: item?.videoUrl,
      videoId: getYouTubeId(item?.videoUrl),
      rating: item?.product?.rating || 0,
      review: item?.message,
      product: { ...item?.product, lowestVariantUid: item?.lowestVariant?.uid },
    }));
  }, [data]);

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
  }, [testimonials]);

  if (isLoading) {
    return <SkUGCContent />;
  }

  if (!testimonials.length) return null;

  const handlePlay = useCallback((index) => {
    setActiveVideoIndex(index);
    setOverlayOpen(true);
  }, []);

  const handleCloseOverlay = useCallback(() => {
    setOverlayOpen(false);
  }, []);

  const ugcSliderSettings = {
    dots: false,
    arrows: true,
    infinite: getIsInfinite(testimonials.length, 4),
    centerMode: false,
    speed: 400,
    slidesToScroll: 1,
    slidesToShow: 4,
    swipeToSlide: true,
    autoHeight: false,
    lazyLoad: 'ondemand',
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 3,
          infinite: getIsInfinite(testimonials.length, 3),
        },
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          infinite: getIsInfinite(testimonials.length, 3),
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          infinite: getIsInfinite(testimonials.length, 2),
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          infinite: getIsInfinite(testimonials.length, 2),
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          infinite: getIsInfinite(testimonials.length, 1),
        },
      },
    ],
  };

  return (
    <>
      <WrapperComponent
        classes={{ sectionClass: 'ugc-section section-b-space' }}
        noRowCol={true}
      >
        <Row>
          <Col>
            <CustomHeading
              customClass="mb-0"
              title="Ayurvedic Health Talks"
              subTitle="Explore What Our Customers Say"
              svgUrl={<LeafSVG className="icon-width" />}
            />
          </Col>
        </Row>

        <div
          ref={sliderContainerRef}
          className="hero-carousel-section ugc-grid slider-placeholder"
        >
          <Slider {...ugcSliderSettings}>
            {testimonials.map((item, idx) => (
              <div key={item.id}>
                <UGCCard
                  data={item}
                  index={idx}
                  onPlay={handlePlay}
                  eagerLoad={idx === 0}
                />
              </div>
            ))}
          </Slider>
        </div>
      </WrapperComponent>

      {overlayOpen && (
        <UGCVideoOverlay
          videos={testimonials}
          activeIndex={activeVideoIndex}
          onClose={handleCloseOverlay}
        />
      )}
    </>
  );
};

export default UGCContent;
