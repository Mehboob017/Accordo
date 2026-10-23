'use client';

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { RiPlayCircleFill, RiAddLine, RiSubtractLine } from 'react-icons/ri';
import CartContext from '@/helper/cartContext';
import VariationModal from '@/components/common/productBox/productBox1/variationModal/index';
import UGCStarRating from './UGCStarRating';
import { formatReviewCount } from '@/utils/helpers';

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

const UGCCard = ({ data, onPlay, index, eagerLoad = false }) => {
  const { cartProducts, handleIncDec } = useContext(CartContext);
  const [variationModal, setVariationModal] = useState('');
  const [productQty, setProductQty] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(eagerLoad);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef(null);
  const thumbnailRef = useRef(null);

  const productObj = data?.product;

  // console.log({ data, productObj });

  useEffect(() => {
    if (shouldLoadVideo) return;

    const thumbEl = thumbnailRef.current;
    if (!thumbEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadVideo(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: '200px' }
    );

    observer.observe(thumbEl);
    return () => observer.disconnect();
  }, [shouldLoadVideo]);

  // Play/pause based on viewport visibility (≥50% visible)
  useEffect(() => {
    if (!shouldLoadVideo) return;

    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => { });
        } else {
          video.pause();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [shouldLoadVideo]);

  useEffect(() => {
    if (!shouldLoadVideo) {
      setIsVideoReady(false);
      return;
    }

    const video = videoRef.current;
    if (video?.readyState >= 2) {
      setIsVideoReady(true);
    }
  }, [shouldLoadVideo, data?.videoUrl]);

  const getSelectedVariant = useMemo(() => {
    return cartProducts.find((elem) => elem.product_id === productObj?.uid);
  }, [cartProducts, productObj?.uid]);

  useEffect(() => {
    if (!productObj) return;
    if (cartProducts.length > 0) {
      const foundProduct = cartProducts.find(
        (elem) => elem.product_id === productObj.uid
      );
      if (foundProduct) {
        setIsOpen(true);
        setProductQty(foundProduct.quantity);
      } else {
        setProductQty(0);
        setIsOpen(false);
      }
    } else {
      setProductQty(0);
      setIsOpen(false);
    }
  }, [cartProducts, productObj]);

  const handleAddToCart = () => {
    if (data?.lowestVariant?.inStockFlag) {
      handleIncDec(
        1,
        productObj,
        productQty,
        setProductQty,
        setIsOpen,
        data?.lowestVariant
      );
    }
  };

  const hasVideo = Boolean(data?.videoUrl);
  const isYouTube =
    data?.videoUrl?.includes('youtube.com') ||
    data?.videoUrl?.includes('youtu.be');

  const youtubeId = data?.videoId || getYouTubeId(data?.videoUrl);

  return (
    <>
      <div className="ugc-card">
        {/* Thumbnail + play overlay */}
        <div
          ref={thumbnailRef}
          className="ugc-card__thumbnail"
          onMouseEnter={() => setShouldLoadVideo(true)}
          onClick={() => {
            if (hasVideo) {
              onPlay?.(index);
            }
          }}
        >
          {/* {!isVideoReady && (
            <div className="ugc-card__skeleton" aria-hidden="true" />
          )} */}

          {isYouTube && youtubeId ? (
            shouldLoadVideo ? (
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&playsinline=1&loop=1&playlist=${youtubeId}`}
                title={data?.name || 'YouTube Video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="ugc-card__iframe"
              />
            ) : (
              <img
                src={
                  data.thumbnailUrl ||
                  `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
                }
                alt={data?.name || 'YouTube Video'}
                className="ugc-card__image is-ready"
                loading="lazy"
                decoding="async"
              />
            )
          ) : hasVideo ? (
            <video
              ref={videoRef}
              src={shouldLoadVideo ? data.videoUrl : undefined}
              className={`ugc-card__image ${isVideoReady ? 'is-ready' : ''}`}
              muted
              loop
              playsInline
              preload={shouldLoadVideo ? 'metadata' : 'none'}
              onLoadedData={() => setIsVideoReady(true)}
              onCanPlay={() => setIsVideoReady(true)}
            />
          ) : data?.thumbnailUrl ? (
            <Image
              src={data.thumbnailUrl}
              alt={data.name}
              fill
              className="ugc-card__image is-ready"
              loading={eagerLoad ? 'eager' : 'lazy'}
              decoding="async"
            />
          ) : null}

          {/* Gradient shadow at bottom */}
          <div className="ugc-card__gradient" />

          {/* Play button */}
          {hasVideo && (
            <button type="button" className="ugc-card__play-btn" aria-label="Play video">
              <RiPlayCircleFill />
            </button>
          )}

          {/* User info overlay */}
          <div className="ugc-card__user-info">
            <h4 className="ugc-card__name">{data.name}</h4>
            <span className="ugc-card__meta">
              {data.handle && `${data.handle}`}
              {data.views != null && data.views > 0 && (
                <>
                  {data.handle && <span className="text-warning"> · </span>}
                  {formatReviewCount(data.views)} Views
                </>
              )}
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className="ugc-card__body">
          {/* Star rating */}
          <UGCStarRating rating={data.rating} />

          {/* Mini product card */}
          {productObj?.lowestVariantUid && (
            <div className="ugc-card__product">
              {productObj?.coverImage && (
                <div className="ugc-card__product-img">
                  <Image
                    src={productObj?.coverImage}
                    alt={
                      productObj?.coverImageAlt || productObj?.name || 'Product'
                    }
                    width={40}
                    height={40}
                  />
                </div>
              )}
              <div className="ugc-card__product-info">
                <span
                  className="ugc-card__product-name"
                  title={productObj.name}
                >
                  {productObj.name}
                </span>

                <span className="ugc-card__product-pricing">
                  <span className="ugc-card__sale-price">
                    <span
                      style={{
                        fontSize: 13,
                        color: '#6f6f6f',
                        lineHeight: 1,
                      }}
                    >
                      M.R.P.
                    </span>{' '}
                    ₹
                    {data?.lowestVariant?.disPrice ??
                      data?.lowestVariant?.disPrice}
                  </span>
                  {data?.lowestVariant?.mrp &&
                    data?.lowestVariant.disPrice &&
                    data?.lowestVariant?.disPrice <
                    data?.lowestVariant?.mrp && (
                      <span className="ugc-card__original-price">
                        ₹{data?.lowestVariant?.mrp}
                      </span>
                    )}
                </span>
              </div>
            </div>
          )}

          {/* Review */}
          {data.review && (
            <p className="ugc-card__review">&ldquo;{data.review}&rdquo;</p>
          )}

          {/* Add to Cart button (same UI as ProductBox1Cart) */}
          {productObj?.lowestVariantUid && (
            <div className="add-to-cart-box ugc-card__cart-box">
              {isOpen && productQty >= 1 ? (
                <div className="ugc-cart-qty-row">
                  <button
                    type="button"
                    className="qty-btn qty-minus"
                    onClick={() =>
                      handleIncDec(
                        -1,
                        productObj,
                        productQty,
                        setProductQty,
                        setIsOpen,
                        data?.lowestVariant
                      )
                    }
                  >
                    <RiSubtractLine />
                  </button>
                  <span className="qty-value">{productQty}</span>
                  <button
                    type="button"
                    className="qty-btn qty-plus"
                    onClick={() =>
                      handleIncDec(
                        1,
                        productObj,
                        productQty,
                        setProductQty,
                        setIsOpen,
                        data?.lowestVariant
                      )
                    }
                  >
                    <RiAddLine />
                  </button>
                </div>
              ) : (
                <button
                  className="btn-primary ugc-card__add-btn"
                  onClick={handleAddToCart}
                >
                  Add To Cart
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {productObj && (
        <VariationModal
          setVariationModal={setVariationModal}
          variationModal={variationModal}
          productObj={productObj}
        />
      )}
    </>
  );
};

export default UGCCard;
