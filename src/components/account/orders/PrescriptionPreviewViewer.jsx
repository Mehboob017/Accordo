'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { RiCloseLine, RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';
import styles from './PrescriptionPreviewViewer.module.scss';

const MIN_SCALE = 1;
const MAX_SCALE = 4;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getDistance = (touchA, touchB) => {
  const deltaX = touchB.clientX - touchA.clientX;
  const deltaY = touchB.clientY - touchA.clientY;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
};

const PrescriptionPreviewViewer = ({
  isOpen,
  files = [],
  initialIndex = 0,
  onClose,
}) => {
  const imageFiles = useMemo(
    () =>
      (Array.isArray(files) ? files : []).filter((file) =>
        String(file?.type || '').startsWith('image/')
      ),
    [files]
  );

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const pinchDistanceRef = useRef(0);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setActiveIndex(clamp(initialIndex, 0, Math.max(imageFiles.length - 1, 0)));
  }, [isOpen, initialIndex, imageFiles.length]);

  useEffect(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setIsDragging(false);
    pinchDistanceRef.current = 0;
  }, [activeIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose && onClose();
      }

      if (event.key === 'ArrowRight' && activeIndex < imageFiles.length - 1) {
        setActiveIndex((previous) => previous + 1);
      }

      if (event.key === 'ArrowLeft' && activeIndex > 0) {
        setActiveIndex((previous) => previous - 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose, activeIndex, imageFiles.length]);

  if (!isOpen || !imageFiles.length) {
    return null;
  }

  const currentFile = imageFiles[activeIndex];

  const applyZoom = (nextScale) => {
    const safeScale = clamp(nextScale, MIN_SCALE, MAX_SCALE);
    setScale(safeScale);

    if (safeScale === 1) {
      setTranslate({ x: 0, y: 0 });
    }
  };

  const handleWheel = (event) => {
    const direction = event.deltaY > 0 ? -0.1 : 0.1;
    applyZoom(scale + direction);
  };

  const handleTouchStart = (event) => {
    if (event.touches.length === 2) {
      pinchDistanceRef.current = getDistance(event.touches[0], event.touches[1]);
      return;
    }

    if (event.touches.length === 1 && scale > 1) {
      const touch = event.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - translate.x, y: touch.clientY - translate.y });
    }
  };

  const handleTouchMove = (event) => {
    if (event.touches.length === 2) {
      const nextDistance = getDistance(event.touches[0], event.touches[1]);

      if (!pinchDistanceRef.current) {
        pinchDistanceRef.current = nextDistance;
        return;
      }

      const ratio = nextDistance / pinchDistanceRef.current;
      applyZoom(scale * ratio);
      pinchDistanceRef.current = nextDistance;
      return;
    }

    if (event.touches.length === 1 && isDragging && scale > 1) {
      event.preventDefault();
      const touch = event.touches[0];
      setTranslate({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    if (pinchDistanceRef.current) {
      pinchDistanceRef.current = 0;
    }
  };

  const handleMouseDown = (event) => {
    if (scale <= 1) {
      return;
    }

    setIsDragging(true);
    setDragStart({ x: event.clientX - translate.x, y: event.clientY - translate.y });
  };

  const handleMouseMove = (event) => {
    if (!isDragging || scale <= 1) {
      return;
    }

    setTranslate({
      x: event.clientX - dragStart.x,
      y: event.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.backdrop} onClick={onClose} />

      <div className={styles.panel}>
        <div className={styles.toolbar}>
          <span className={styles.fileName}>{currentFile?.name || 'Prescription'}</span>
          <div className={styles.toolbarActions}>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => applyZoom(scale - 0.25)}
            >
              -
            </button>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => applyZoom(scale + 0.25)}
            >
              +
            </button>
            <button type="button" className={styles.iconBtn} onClick={onClose}>
              <RiCloseLine />
            </button>
          </div>
        </div>

        <div className={styles.viewerWrap}>
          <button
            type="button"
            className={`${styles.navBtn} ${styles.leftNav}`}
            onClick={() => setActiveIndex((previous) => Math.max(0, previous - 1))}
            disabled={activeIndex === 0}
            aria-label="Previous prescription"
          >
            <RiArrowLeftSLine />
          </button>

          <div
            className={styles.imageSurface}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              src={currentFile?.previewUrl}
              alt={currentFile?.name || 'Prescription'}
              className={styles.image}
              draggable={false}
              style={{
                transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
              }}
            />
          </div>

          <button
            type="button"
            className={`${styles.navBtn} ${styles.rightNav}`}
            onClick={() =>
              setActiveIndex((previous) =>
                Math.min(imageFiles.length - 1, previous + 1)
              )
            }
            disabled={activeIndex >= imageFiles.length - 1}
            aria-label="Next prescription"
          >
            <RiArrowRightSLine />
          </button>
        </div>

        <div className={styles.footer}>
          <span>
            {activeIndex + 1} / {imageFiles.length}
          </span>
          <button type="button" className={styles.resetBtn} onClick={() => applyZoom(1)}>
            Reset Zoom
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionPreviewViewer;
