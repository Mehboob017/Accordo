'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  RiDoubleQuotesL,
  RiDoubleQuotesR,
  RiStarFill,
  RiStarHalfFill,
  RiStarLine,
  RiImage2Line,
  RiVideoLine,
  RiCloseLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from 'react-icons/ri';
import ResponsiveModal from '@/components/common/ResponsiveModal';
import '../productDetails/common/allModal/ReviewModal.scss';
import styles from './TestimonialSection.module.scss';

const MAX_STARS = 5;

const TestimonialCard = ({ testimonial }) => {
  const [isImageError, setIsImageError] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mediaModal, setMediaModal] = useState({ open: false, file: null, index: 0 });

  const cardRef = useRef(null);
  const reviewRef = useRef(null);

  const safeRating = useMemo(() => {
    const parsed = Number(testimonial?.rating);
    if (!Number.isFinite(parsed)) return 0;
    return Math.min(Math.max(parsed, 0), MAX_STARS);
  }, [testimonial?.rating]);

  // 1. ResizeObserver to reliably detect overflow
  useEffect(() => {
    const reviewElement = reviewRef.current;
    if (!reviewElement) return;

    const checkOverflow = () => {
      if (reviewElement.classList.contains(styles['testimonial-card__review--expanded'])) {
        return;
      }
      setHasOverflow(reviewElement.scrollHeight > reviewElement.clientHeight + 1);
    };

    const resizeObserver = new ResizeObserver(() => checkOverflow());
    resizeObserver.observe(reviewElement);

    checkOverflow();

    return () => resizeObserver.disconnect();
  }, [testimonial?.comment]);

  // 2. Trigger scroll AFTER React updates the DOM with the 'expanded' class
  useEffect(() => {
    const reviewElement = reviewRef.current;
    if (isExpanded && reviewElement) {
      requestAnimationFrame(() => {
        reviewElement.scrollTo({
          top: reviewElement.scrollHeight,
          behavior: 'smooth',
        });
      });
    }
  }, [isExpanded]);

  // 3. Handle Click Outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the card exists, and the click target is NOT inside the card
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        if (isExpanded) {
          handleCollapse();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  const handlePrevMedia = (e) => {
    e.stopPropagation();
    if (!testimonial?.medias) return;
    const newIndex = mediaModal.index > 0 ? mediaModal.index - 1 : testimonial.medias.length - 1;
    setMediaModal({ ...mediaModal, file: testimonial.medias[newIndex], index: newIndex });
  };

  const handleNextMedia = (e) => {
    e.stopPropagation();
    if (!testimonial?.medias) return;
    const newIndex = mediaModal.index < testimonial.medias.length - 1 ? mediaModal.index + 1 : 0;
    setMediaModal({ ...mediaModal, file: testimonial.medias[newIndex], index: newIndex });
  };

  const handleReadMore = () => {
    if (!hasOverflow) return;
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    const reviewElement = reviewRef.current;

    if (reviewElement) {
      reviewElement.scrollTo({
        top: 0,
        behavior: 'auto',
      });
    }
  };

  const renderStars = () =>
    Array.from({ length: MAX_STARS }, (_, index) => {
      const starValue = index + 1;
      const delta = safeRating - (starValue - 1);

      if (delta >= 1) {
        return (
          <RiStarFill
            key={`full-${starValue}`}
            className={styles['testimonial-card__star']}
          />
        );
      }

      if (delta >= 0.5) {
        return (
          <RiStarHalfFill
            key={`half-${starValue}`}
            className={styles['testimonial-card__star']}
          />
        );
      }

      return (
        <RiStarLine
          key={`empty-${starValue}`}
          className={styles['testimonial-card__star']}
        />
      );
    });

  const name = testimonial?.name || 'Customer';
  const initials = name.charAt(0).toUpperCase();
  const reviewClassName = [
    styles['testimonial-card__review'],
    hasOverflow ? styles['testimonial-card__review--overflow'] : '',
    isExpanded ? styles['testimonial-card__review--expanded'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      ref={cardRef}
      className={styles['testimonial-card']}
      onMouseLeave={handleCollapse}
    >
      <RiDoubleQuotesL
        className={`${styles['testimonial-card__quote']} ${styles['testimonial-card__quote--top']}`}
        aria-hidden="true"
      />
      <RiDoubleQuotesR
        className={`${styles['testimonial-card__quote']} ${styles['testimonial-card__quote--bottom']}`}
        aria-hidden="true"
      />

      <div className={styles['testimonial-card__avatar']}>
        {!isImageError && testimonial?.image ? (
          <img
            src={testimonial.image}
            alt={testimonial.imageAlt || name || ''}
            className={styles['testimonial-card__avatar-image']}
            onError={() => setIsImageError(true)}
            loading="lazy"
          />
        ) : (
          <span className={styles['testimonial-card__avatar-fallback']}>
            {initials}
          </span>
        )}
      </div>

      <h3 className={styles['testimonial-card__name']}>{name}</h3>

      <div
        className={styles['testimonial-card__stars']}
        aria-label={`Rated ${safeRating} out of ${MAX_STARS}`}
      >
        {renderStars()}
      </div>

      <div className={styles['testimonial-card__review-wrap']}>
        <p ref={reviewRef} className={reviewClassName} data-lenis-prevent>
          {testimonial?.comment}
        </p>

        {hasOverflow && !isExpanded && (
          <button
            type="button"
            onClick={handleReadMore}
            className={styles['testimonial-card__read-more']}
          >
            Read more
          </button>
        )}

        {hasOverflow && isExpanded && (
          <button
            type="button"
            onClick={handleCollapse}
            className={styles['testimonial-card__read-more']}
          >
            Read less
          </button>
        )}
      </div>

      {testimonial?.medias && testimonial.medias.length > 0 && (
        <div className={styles['testimonial-card__media-gallery']} data-lenis-prevent>
          {testimonial.medias.map((media, index) => (
            <button
              key={`media-${index}`}
              type="button"
              className={styles['testimonial-card__media-thumb']}
              onClick={(e) => {
                e.stopPropagation();
                setMediaModal({ open: true, file: media, index });
              }}
              title={media.type === 'video' ? 'Video' : 'Image'}
            >
              {media.type === 'video' ? (
                <video src={media.url} />
              ) : (
                <img src={media.url} alt="Testimonial media" loading="lazy" />
              )}
              <span className={styles['testimonial-card__media-overlay']}>
                {media.type === 'video' ? <RiVideoLine /> : <RiImage2Line />}
              </span>
            </button>
          ))}
        </div>
      )}

      <ResponsiveModal
        modal={mediaModal.open}
        setModal={() => setMediaModal({ open: false, file: null })}
        closeButton={
          <button
            type="button"
            className="btn-close position-static"
            onClick={() => setMediaModal({ open: false, file: null })}
            aria-label="Close preview"
          >
            <RiCloseLine />
          </button>
        }
        extraFunction={() => setMediaModal({ open: false, file: null })}
        classes={{
          modalClass: 'theme-modal review-preview-modal',
          offcanvasClass: 'review-preview-offcanvas',
          modalHeaderClass: 'review-preview-header justify-content-between',
          modalBodyClass: 'review-preview-body',
          title: 'Media Preview',
        }}
      >
        {mediaModal.file && (
          <>
            <div className="review-preview-media-container">
              {testimonial?.medias?.length > 1 && (
                <button type="button" className="preview-nav-btn prev" onClick={handlePrevMedia} aria-label="Previous">
                  <RiArrowLeftSLine />
                </button>
              )}
              {mediaModal.file.type === 'video' ? (
                <video
                  src={mediaModal.file.url}
                  controls
                  autoPlay
                  playsInline
                  style={{ width: '100%', maxHeight: '70vh' }}
                />
              ) : (
                <img
                  src={mediaModal.file.url}
                  alt="Preview"
                  draggable={false}
                />
              )}
              {testimonial?.medias?.length > 1 && (
                <button type="button" className="preview-nav-btn next" onClick={handleNextMedia} aria-label="Next">
                  <RiArrowRightSLine />
                </button>
              )}
            </div>
            <div className="review-preview-footer">
              <span className="preview-file-name">
                {mediaModal.file.type === 'video' ? 'Video' : 'Image'}
              </span>
              <span className="preview-file-meta">
                <span className="preview-type-badge">
                  {mediaModal.file.type === 'video' ? 'VID' : 'IMG'}
                </span>
              </span>
            </div>
          </>
        )}
      </ResponsiveModal>
    </article>
  );
};

export default TestimonialCard;