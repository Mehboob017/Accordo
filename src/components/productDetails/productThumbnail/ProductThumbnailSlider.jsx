import { memo, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Slider from 'react-slick';
import { Col, Row } from 'reactstrap';
import { RiPlayCircleFill } from 'react-icons/ri';

import ImageMagnifier from '@/components/ImageZoom/ImageMagnifier';
import useImagePreload from '@/utils/hooks/useImagePreload';
import { useProductImages } from '@/utils/hooks/useProductDetail';
import { getOptimizedCdnImageUrl } from '@/utils/helpers';

// ── YouTube helpers ────────────────────────────────────────────────────────────

/**
 * Extract the 11-character video ID from any YouTube URL variant:
 * - https://www.youtube.com/watch?v=ID
 * - https://youtu.be/ID
 * - https://www.youtube.com/shorts/ID
 * - https://www.youtube.com/embed/ID
 * Returns null for non-YouTube URLs.
 */
const extractYouTubeId = (url) => {
  if (!url) return null;
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = String(url).match(pattern);
    if (match) return match[1];
  }
  return null;
};

/** Thumbnail-strip tile for a YouTube video — shows static YT thumbnail + play badge. */
const YouTubeThumbTile = memo(({ videoId }) => (
  <div style={{ position: 'relative', width: '100%', aspectRatio: '1', background: '#2b2b2b', overflow: 'hidden', borderRadius: 'inherit' }}>
    <Image
      unoptimized
      src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
      alt="Video"
      fill
      sizes="150px"
      style={{ objectFit: 'cover' }}
    />
    <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <RiPlayCircleFill size={16} color="white" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.65))' }} />
    </span>
  </div>
));
YouTubeThumbTile.displayName = 'YouTubeThumbTile';

/**
 * Main-slider tile for a YouTube video.
 * Shows a clickable HQ thumbnail until the user presses play,
 * then replaces itself with an autoplay embed iframe.
 */
const YouTubeMainTile = memo(({ videoId, isPlaying, onPlay }) => {
  if (isPlaying) {
    return (
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1', background: '#2b2b2b' }}>
        <iframe
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title="Product video"
        />
      </div>
    );
  }

  return (
    <div
      style={{ position: 'relative', width: '100%', aspectRatio: '1', cursor: 'pointer', background: '#2b2b2b', overflow: 'hidden' }}
      onClick={onPlay}
      role="button"
      tabIndex={0}
      aria-label="Play video"
      onKeyDown={(e) => e.key === 'Enter' && onPlay()}
    >
      <Image
        unoptimized
        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
        alt="Product video thumbnail"
        fill
        sizes="(max-width: 576px) 100vw, 580px"
        style={{ objectFit: 'cover' }}
      />
      <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.22)' }}>
        <RiPlayCircleFill size={60} color="white" style={{ filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.55))' }} />
      </span>
    </div>
  );
});
YouTubeMainTile.displayName = 'YouTubeMainTile';

/**
 * Default magnifier configuration
 * You can customize these values or pass them as props
 */
const defaultMagnifierConfig = {
  lensWidth: 100,
  lensHeight: 100,
  containerWidth: 300,
  containerHeight: 300,
  zoomLevel: 2.5,
  position: 'right', // 'top' | 'right' | 'bottom' | 'left'
  gap: 20,
  mobileBreakpoint: 992,
  lensColor: 'rgba(0, 0, 0, 0.2)',
  lensBorderColor: '#333',
};

// Custom loader for Next.js Image to handle CDN dynamic width transformations
const customImageLoader = ({ src, width }) => {
  if (!src) return '';
  if (src.startsWith('data:') || src.startsWith('blob:')) return src;
  const separator = src.includes('?') ? '&' : '?';
  return `${src}${separator}width=${width}`;
};

const PreloadedThumbImage = memo(({ src, alt }) => {
  const thumbSrc = getOptimizedCdnImageUrl(src, 150, 150, 80);
  const { resolvedSrc, isLoaded, isError } = useImagePreload(thumbSrc, {
    fallbackSrc: '',
  });

  return (
    <div className={`preload-media-frame preload-media-frame--thumb ${isLoaded ? 'is-loaded' : 'is-loading'}`}>
      {!isLoaded && !isError ? (
        <span className="preload-media-skeleton" aria-hidden="true" />
      ) : null}

      {isLoaded ? (
        <img
          src={resolvedSrc}
          width={150}
          height={150}
          className="img-fluid preload-media-image"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          alt={alt}
          loading="lazy"
          decoding="async"
        />
      ) : null}

      {isError ? (
        <span className="preload-media-error">Image unavailable</span>
      ) : null}
    </div>
  );
});

PreloadedThumbImage.displayName = 'PreloadedThumbImage';

const PreloadedMainImage = memo(({ src, alt, magnifierConfig, priority = false }) => {
  const { resolvedSrc, isLoaded, isError } = useImagePreload(src, {
    fallbackSrc: '',
  });

  return (
    <div className={`preload-media-frame preload-media-frame--main ${isLoaded ? 'is-loaded' : 'is-loading'}`}>
      {!isLoaded && !isError ? (
        <span className="preload-media-skeleton" aria-hidden="true" />
      ) : null}

      {isLoaded ? (
        <div className="preload-media-reveal">
          <ImageMagnifier
            src={resolvedSrc}
            alt={alt}
            width={580}
            height={580}
            className="img-fluid"
            magnifierConfig={magnifierConfig}
            priority={priority}
          />
        </div>
      ) : null}

      {isError ? (
        <span className="preload-media-error">Image unavailable</span>
      ) : null}
    </div>
  );
});

PreloadedMainImage.displayName = 'PreloadedMainImage';

const ProductThumbnailSlider = ({ productState, slug, magnifierConfig = {} }) => {
  const [state, setState] = useState({ nav1: null, nav2: null });
  const [activeSlide, setActiveSlide] = useState(0);
  // Tracks which slide index has its YouTube player open (null = no video playing).
  const [playingSlide, setPlayingSlide] = useState(null);
  const slider1 = useRef();
  const slider2 = useRef();
  const videoRefs = useRef([]);
  const { nav1, nav2 } = state;

  const { data: imagesData } = useProductImages(slug);
  const fetchedImages = imagesData?.data || {};
  // console.log({ imagesData })

  // Merge default config with passed config
  const mergedMagnifierConfig = useMemo(
    () => ({
      ...defaultMagnifierConfig,
      ...magnifierConfig,
    }),
    [magnifierConfig]
  );

  useEffect(() => {
    setState({
      nav1: slider1.current,
      nav2: slider2.current,
    });
  }, []);

  // Helper to check if a path is valid (non-null, non-empty)
  const isValidPath = (path) =>
    path != null && String(path || '').trim().length > 0;

  // Build ordered media list: product image → variant images → gallery images (no duplicates)
  const getGalleryImages = () => {
    const product = productState?.product || {};
    const seenPaths = new Set();

    const addIfValid = (path, mediaObj) => {
      const pathStr = String(path || '').trim();
      if (!pathStr || seenPaths.has(pathStr)) return null;
      seenPaths.add(pathStr);
      return mediaObj;
    };

    const mediaList = [];

    // 1. Product cover image (from fetchProductImages or product)
    const coverPath = fetchedImages?.coverImage || product?.coverImage;

    if (isValidPath(coverPath)) {
      const coverMedia = addIfValid(coverPath, {
        type: 'image',
        path: coverPath,
        imageAlt:
          fetchedImages?.coverImageAlt || product?.coverImageAlt || product?.name || 'Product cover image',
      });
      if (coverMedia) mediaList.push(coverMedia);
    }

    // 2. Variant images (from productVariants with valid coverImage)
    const variants = product?.productVariants || [];
    variants.forEach((variant) => {
      const variantPath = variant?.coverImage;

      if (!isValidPath(variantPath)) return;
      const variantMedia = addIfValid(variantPath, {
        type: 'image',
        path: variantPath,
        imageAlt: variant?.coverImageAlt || variant?.name || 'Variant image',
      });
      if (variantMedia) mediaList.push(variantMedia);
    });

    // 3. Gallery images (productFiles from fetchProductImages)
    const galleries = (fetchedImages?.productFiles || []).filter((file) => {
      const fileType = String(file?.type || '').toLowerCase();
      return (
        (fileType === 'image' || fileType === 'video') &&
        isValidPath(file?.path)
      );
    });

    galleries.forEach((file) => {
      const filePath = String(file?.path || '').trim();
      const galleryMedia = addIfValid(filePath, {
        type: String(file?.type || 'image').toLowerCase(),
        path: filePath,
        imageAlt:
          file?.imageAlt || file?.name || product?.name || 'Gallery image',
      });
      if (galleryMedia) mediaList.push(galleryMedia);
    });

    const minSlides = 1;

    if (mediaList.length === 0) {
      return [
        {
          type: 'image',
          path: '',
          imageAlt: product?.name || 'Product image',
        },
      ];
    }
    if (mediaList.length >= minSlides) return mediaList;

    // Clone from existing items to fill for seamless loop
    const clonedGalleries = [];
    const pool = mediaList;
    const timesToRepeat = Math.ceil(minSlides / mediaList.length);
    for (let i = 0; i < timesToRepeat; i++) {
      clonedGalleries.push(...pool);
    }
    return clonedGalleries.slice(0, minSlides);
  };

  const galleryImages = useMemo(() => getGalleryImages(), [
    fetchedImages?.coverImage,
    fetchedImages?.productFiles,
    productState?.product?.coverImage,
    productState?.product?.coverImageAlt,
    productState?.product?.name,
    productState?.product?.productVariants,
  ]);

  const desktopThumbVisibleCount = 5;
  const mobileThumbVisibleCount = 4;
  const thumbSlidesToShow = Math.min(
    desktopThumbVisibleCount,
    Math.max(galleryImages.length, 1)
  );
  const shouldLoopDesktopThumbs = galleryImages.length > desktopThumbVisibleCount;
  const shouldLoopMobileThumbs = galleryImages.length > mobileThumbVisibleCount;

  const pauseAllVideos = () => {
    videoRefs.current.forEach((video) => {
      if (video && !video.paused) {
        video.pause();
      }
    });
  };

  const playVideoForSlide = (index) => {
    const media = galleryImages[index];
    if (!media || String(media?.type || '').toLowerCase() !== 'video') return;

    const activeVideo = videoRefs.current[index];
    if (!activeVideo) return;

    activeVideo.currentTime = 0;
    const playPromise = activeVideo.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        // Autoplay can be blocked by browser policies; controls are still available.
      });
    }
  };

  useEffect(() => {
    pauseAllVideos();
    playVideoForSlide(activeSlide);

    return () => {
      pauseAllVideos();
    };
  }, [activeSlide, galleryImages.length]);

  // When user clicks a variant, go to that variant's image in the slider
  useEffect(() => {
    const requestedAt = productState?.variantImageRequestedAt;
    const variant = productState?.selectedVariation;
    if (!requestedAt || !variant || !slider1.current) return;

    const variantPath = (
      variant?.coverImage ||
      variant?.cover_image ||
      variant?.image ||
      variant?.image_url ||
      ''
    ).trim();
    if (!variantPath) return;

    const index = galleryImages.findIndex(
      (img) => String(img?.path || '').trim() === variantPath
    );
    if (index >= 0) {
      slider1.current.slickGoTo(index);
      setActiveSlide(index);
    }
  }, [
    productState?.variantImageRequestedAt,
    productState?.selectedVariation?.uid,
  ]);

  // Vertical thumbnail slider settings
  const thumbSliderSettings = {
    slidesToShow: thumbSlidesToShow,
    slidesToScroll: 1,
    arrows: false,
    dots: false,
    focusOnSelect: true,
    infinite: shouldLoopDesktopThumbs,
    vertical: true,
    verticalSwiping: false,
    centerMode: false,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: thumbSlidesToShow,
          arrows: false,
          infinite: shouldLoopDesktopThumbs,
        },
      },
      {
        breakpoint: 576,
        settings: {
          vertical: false,
          slidesToShow: mobileThumbVisibleCount,
          arrows: false,
          infinite: shouldLoopMobileThumbs,
        },
      },
    ],
  };

  return (
    <Col xs={12}>
      <div
        className="product-left-box position-sticky top-0"
      >
        <Row className="g-3 flex-sm-row flex-column-reverse">
          <Col xs={12} sm={2}>
            <div className="bottom-slider-image left-slider slick-top product-thumb-vertical">
              <Slider
                {...thumbSliderSettings}
                asNavFor={nav1}
                ref={(slider) => (slider2.current = slider)}
              >
                {galleryImages.map((elem, i) => (
                  <div key={`thumb-${i}`}>
                    <div className="sidebar-image">
                      {String(elem?.type || '').toLowerCase() === 'video' ? (
                        (() => {
                          const ytId = extractYouTubeId(elem?.path);
                          if (ytId) return <YouTubeThumbTile videoId={ytId} />;
                          return (
                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                              <video
                                src={elem?.path}
                                muted
                                playsInline
                                preload="metadata"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                              <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.28)', color: '#fefefe' }}>
                                <RiPlayCircleFill size={24} />
                              </span>
                            </div>
                          );
                        })()
                      ) : (
                        <PreloadedThumbImage
                          src={elem?.path || ''}
                          alt={elem?.imageAlt || elem?.type || 'Thumbnail image'}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </Col>

          {/* Main image slider — col-10 on md+ */}
          <Col xs={12} sm={10}>
            <div className="product-main-1 position-relative">
              {productState?.product?.tags && productState.product.tags.length > 0 && (
                <div className="product-label-tag sale-tag">
                  <span>{productState.product.tags[0]?.name}</span>
                </div>
              )}
              <Slider
                arrows={true}
                infinite={galleryImages.length > 1}
                asNavFor={nav2}
                ref={(slider) => (slider1.current = slider)}
                beforeChange={() => {
                  pauseAllVideos();
                  setPlayingSlide(null);
                }}
                afterChange={(nextIndex) => {
                  setActiveSlide(nextIndex);
                }}
              >
                {galleryImages.map((elem, i) => (
                  <div key={`main-${i}`}>
                    <div className="slider-image" style={{ position: 'relative' }}>
                      {i === 0 && productState?.currentTheme?.type === "Website" && productState?.currentTheme?.image && (
                        <Image
                          unoptimized
                          src={productState.currentTheme.image}
                          alt="Theme Overlay"
                          fill
                          sizes="(max-width: 576px) 100vw, 580px"
                          style={{
                            objectFit: 'contain',
                            pointerEvents: 'none',
                            zIndex: 2,
                          }}
                        />
                      )}
                      {(() => {
                        const type = String(elem?.type || '').toLowerCase();
                        if (type === 'video') {
                          const ytId = extractYouTubeId(elem?.path);
                          if (ytId) {
                            return (
                              <YouTubeMainTile
                                videoId={ytId}
                                isPlaying={playingSlide === i}
                                onPlay={() => setPlayingSlide(i)}
                              />
                            );
                          }
                          return (
                            <video
                              ref={(video) => { videoRefs.current[i] = video; }}
                              src={elem?.path}
                              controls
                              muted
                              playsInline
                              preload="metadata"
                              className="img-fluid"
                              style={{ width: '100%', maxHeight: '580px', height: '100%', objectFit: 'contain' }}
                            />
                          );
                        }
                        return (
                          <PreloadedMainImage
                            src={elem?.path || ''}
                            alt={elem?.imageAlt || elem?.type || ''}
                            magnifierConfig={mergedMagnifierConfig}
                            priority={i === 0}
                          />
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </Col>
        </Row>
      </div>
    </Col>
  );
};

export default ProductThumbnailSlider;
