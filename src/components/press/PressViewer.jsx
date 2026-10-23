import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/utils/helpers';

export default function PressViewer({
  items,
  activeIndex,
  setActiveIndex,
  onClose,
  searchParams,
}) {
  const router = useRouter();
  const total = items.length;
  const [zoomed, setZoomed] = useState(false);
  const [scale, setScale] = useState(1);

  // Drag state
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const imgRef = useRef(null);
  const wrapperRef = useRef(null);

  const next = () => {
    resetZoom();
    setActiveIndex((prev) => (prev + 1) % total);
  };
  const prev = () => {
    resetZoom();
    setActiveIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') {
        if (zoomed) {
          resetZoom();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [zoomed]);

  // Sync URL with active image
  useEffect(() => {
    const uid = items[activeIndex]?.uid;
    if (!uid) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('uid', uid);

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [activeIndex, items, router, searchParams]);

  // Reset zoom and pan
  const resetZoom = () => {
    setZoomed(false);
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  // Get bounds for panning
  const getBounds = () => {
    if (!imgRef.current || !wrapperRef.current) return { maxX: 0, maxY: 0 };

    const img = imgRef.current;
    const wrapper = wrapperRef.current;

    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    const wrapperWidth = wrapper.clientWidth;
    const wrapperHeight = wrapper.clientHeight;

    // Calculate how the image is displayed
    const imgAspect = imgWidth / imgHeight;
    const wrapperAspect = wrapperWidth / wrapperHeight;

    let displayWidth, displayHeight;
    if (imgAspect > wrapperAspect) {
      // Image is wider - constrained by width
      displayWidth = wrapperWidth;
      displayHeight = wrapperWidth / imgAspect;
    } else {
      // Image is taller - constrained by height
      displayHeight = wrapperHeight;
      displayWidth = wrapperHeight * imgAspect;
    }

    // When zoomed, the image is scaled
    const scaledWidth = displayWidth * scale;
    const scaledHeight = displayHeight * scale;

    // Maximum translation is half the difference between scaled and wrapper size
    const maxX = Math.max(0, (scaledWidth - wrapperWidth) / 2);
    const maxY = Math.max(0, (scaledHeight - wrapperHeight) / 2);

    return { maxX, maxY };
  };

  // Constrain translation to bounds
  const constrainTranslate = (x, y) => {
    const { maxX, maxY } = getBounds();
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  };

  // Toggle zoom (zoom to 2x on click)
  const toggleZoom = (e) => {
    if (isDragging.current) return; // Don't zoom if we were dragging

    if (!zoomed) {
      // Zoom in
      setZoomed(true);
      setScale(2);

      // Calculate click position relative to image center
      if (wrapperRef.current && e) {
        const rect = wrapperRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left - rect.width / 2;
        const clickY = e.clientY - rect.top - rect.height / 2;

        // Pan to center the clicked point
        const newTranslate = constrainTranslate(-clickX, -clickY);
        setTranslate(newTranslate);
      }
    } else {
      // Zoom out
      resetZoom();
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();

    const delta = -e.deltaY;
    const zoomIntensity = 0.1;
    const newScale = Math.max(
      1,
      Math.min(4, scale + (delta > 0 ? zoomIntensity : -zoomIntensity))
    );

    if (newScale === 1) {
      resetZoom();
      return;
    }

    setScale(newScale);
    setZoomed(newScale > 1);

    // Adjust pan position to zoom toward mouse cursor
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;

      const scaleRatio = newScale / scale;
      const newX = mouseX - (mouseX - translate.x) * scaleRatio;
      const newY = mouseY - (mouseY - translate.y) * scaleRatio;

      setTranslate(constrainTranslate(newX, newY));
    }
  };

  // Mouse / touch events for dragging
  const startDrag = (e) => {
    if (!zoomed) return;

    const pageX = e.type.includes('touch') ? e.touches[0].pageX : e.pageX;
    const pageY = e.type.includes('touch') ? e.touches[0].pageY : e.pageY;

    isDragging.current = true;
    setDragStart({ x: pageX - translate.x, y: pageY - translate.y });
  };

  const onDrag = (e) => {
    if (!zoomed || !isDragging.current) return;

    e.preventDefault();

    const pageX = e.type.includes('touch') ? e.touches[0].pageX : e.pageX;
    const pageY = e.type.includes('touch') ? e.touches[0].pageY : e.pageY;

    const newTranslate = constrainTranslate(
      pageX - dragStart.x,
      pageY - dragStart.y
    );

    setTranslate(newTranslate);
  };

  const endDrag = () => {
    // Small delay to prevent click event from firing after drag
    setTimeout(() => {
      isDragging.current = false;
    }, 10);
  };

  // Double-click to zoom
  const handleDoubleClick = (e) => {
    toggleZoom(e);
  };

  const currentItem = items[activeIndex];

  return (
    <div className="press-viewer" role="dialog" aria-modal="true">
      <div className="press-viewer__backdrop" onClick={onClose} />

      <div className="press-viewer__stage">
        {/* LEFT NAV */}
        <button
          className="press-viewer__nav press-viewer__nav--left"
          aria-label="Previous image"
          onClick={prev}
        >
          <FaChevronLeft />
        </button>

        {/* IMAGE */}
        <div
          ref={wrapperRef}
          className="press-viewer__image-wrapper"
          onMouseDown={startDrag}
          onMouseMove={onDrag}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onTouchStart={startDrag}
          onTouchMove={onDrag}
          onTouchEnd={endDrag}
          onWheel={handleWheel}
          style={{
            cursor: zoomed
              ? isDragging.current
                ? 'grabbing'
                : 'grab'
              : 'zoom-in',
          }}
        >
          <img
            ref={imgRef}
            src={currentItem.image}
            alt={currentItem.imageAlt}
            className={`press-viewer__image ${zoomed ? 'zoomed' : ''}`}
            onDoubleClick={handleDoubleClick}
            style={{
              transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              transition: isDragging.current
                ? 'none'
                : 'transform 0.2s ease-out',
            }}
            draggable={false}
          />

          {/* TITLE & DATE OVERLAY - hide when zoomed */}
          {!zoomed && (
            <div className="press-viewer__overlay">
              <h3 className="press-viewer__title">{currentItem.name}</h3>
              <span className="press-viewer__date">
                {formatDate(currentItem.date)}
              </span>
            </div>
          )}
        </div>

        {/* RIGHT NAV */}
        <button
          className="press-viewer__nav press-viewer__nav--right"
          aria-label="Next image"
          onClick={next}
        >
          <FaChevronRight />
        </button>
      </div>

      {/* BOTTOM CONTROLS */}
      <div className="press-viewer__controls">
        <span className="press-viewer__count">
          {activeIndex + 1} / {total}
        </span>

        {zoomed && (
          <button aria-label="Reset zoom" onClick={resetZoom}>
            Reset Zoom ({Math.round(scale * 100)}%)
          </button>
        )}

        <button aria-label="Share image" onClick={() => share(currentItem)}>
          Share
        </button>

        <button aria-label="Close viewer" onClick={onClose}>
          <IoClose />
        </button>
      </div>
    </div>
  );
}

function share(item) {
  const url = `${window.location.origin}/press?uid=${item.uid}`;
  if (navigator.share) {
    navigator.share({ title: item.name, url });
  } else {
    navigator.clipboard.writeText(url);
    alert('Link copied');
  }
}
