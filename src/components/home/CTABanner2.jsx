'use client';

import { useState, useEffect, useCallback } from 'react';
import { getImageProps } from 'next/image';
import WrapperComponent from '@/components/common/WrapperComponent';
import { Col, Container, Row } from 'reactstrap';
import { RiCloseLine } from 'react-icons/ri';

const BANNER_VIDEO_URL = 'https://www.youtube.com/shorts/c3sfOLBBf2g';

function getYouTubeId(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1);
    const videoId = parsed.searchParams.get('v');
    if (videoId) return videoId;
    const embedMatch = parsed.pathname.match(/\/embed\/([^/?]+)/);
    if (embedMatch) return embedMatch[1];
    const shortsMatch = parsed.pathname.match(/\/shorts\/([^/?]+)/);
    if (shortsMatch) return shortsMatch[1];
    return null;
  } catch {
    return null;
  }
}

const CTABanner2 = () => {
  const [overlayOpen, setOverlayOpen] = useState(false);

  const youtubeId = getYouTubeId(BANNER_VIDEO_URL);

  const handleOpen = useCallback(() => {
    setOverlayOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOverlayOpen(false);
  }, []);

  // Lock body scroll & close on Escape
  useEffect(() => {
    if (!overlayOpen) return;

    document.body.style.overflow = 'hidden';
    const handleKey = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [overlayOpen, handleClose]);

  const commonProps = {
    alt: 'App Download Banner',
    loading: 'lazy', // Lazy load because it's below the fold!
    // quality: 80,
  };

  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({
    ...commonProps,
    src: '/assets/images/caring-for-my-family.png',
    width: 1440,
    height: 500,
  });

  const {
    props: { srcSet: mobileSrcSet, ...rest },
  } = getImageProps({
    ...commonProps,
    src: '/assets/images/caring-for-my-family-mobile.png',
    width: 600,
    height: 300,
  });

  return (
    <>
      <Container fluid>
        <WrapperComponent classes={{ fluidClass: 'px-0' }} noRowCol={true}>
          <Row>
            <Col className="px-0">
              <div
                onClick={handleOpen}
                className="hero-banner"
                style={{ cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleOpen();
                }}
              >
                <picture>
                  <source media="(min-width: 768px)" srcSet={desktopSrcSet} />
                  <source media="(max-width: 767px)" srcSet={mobileSrcSet} />
                  <img
                    {...rest}
                    className="banner-img"
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </picture>
              </div>
            </Col>
          </Row>
        </WrapperComponent>
      </Container>

      {overlayOpen && youtubeId && (
        <div className="ugc-overlay" onClick={handleClose}>
          <div
            className="ugc-overlay__container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Video */}
            <div className="ugc-overlay__video-wrapper">
              {/* Close button */}
              <button
                className="ugc-overlay__close"
                onClick={handleClose}
                aria-label="Close"
              >
                <RiCloseLine />
              </button>

              <iframe
                className="ugc-overlay__video"
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1&playsinline=1`}
                title="Banner Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CTABanner2;

