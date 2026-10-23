'use client';
import { useState, useEffect, useRef } from 'react';
import { FiImage } from 'react-icons/fi';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { IoClose } from "react-icons/io5";

const EventGallerySection = ({ eventData }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const imgRef = useRef(null);

  // Map API images to gallery format
  const galleryImages = eventData?.images?.map((img) => ({
    id: img.uid,
    src: img.image,
    alt: img.imageAlt || img.title || 'Event gallery image',
    size: 'medium'
  })) || [];

  const openLightbox = (image, index) => {
    setSelectedImage(image);
    setActiveIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    setZoomed(false);
    resetTranslate();
  };

  const next = () => {
    resetTranslate();
    setActiveIndex((prev) => (prev + 1) % galleryImages.length);
    setSelectedImage(galleryImages[(activeIndex + 1) % galleryImages.length]);
  };

  const prev = () => {
    resetTranslate();
    const newIndex = activeIndex === 0 ? galleryImages.length - 1 : activeIndex - 1;
    setActiveIndex(newIndex);
    setSelectedImage(galleryImages[newIndex]);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!selectedImage) return;
    
    const handler = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedImage, activeIndex]);

  // Toggle zoom
  const toggleZoom = () => {
    // setZoomed((prev) => !prev);
    // resetTranslate();
  };

  // Reset translate
  const resetTranslate = () => setTranslate({ x: 0, y: 0 });

  // Mouse / touch events for dragging zoomed image
  const startDrag = (e) => {
    if (!zoomed) return;

    isDragging.current = true;

    const pageX = e.type.includes('touch')
      ? e.touches[0].pageX
      : e.pageX;
    const pageY = e.type.includes('touch')
      ? e.touches[0].pageY
      : e.pageY;

    setDragStart({ x: pageX - translate.x, y: pageY - translate.y });
  };

  const onDrag = (e) => {
    if (!zoomed || !isDragging.current) return;

    const pageX = e.type.includes('touch')
      ? e.touches[0].pageX
      : e.pageX;
    const pageY = e.type.includes('touch')
      ? e.touches[0].pageY
      : e.pageY;

    setTranslate({
      x: pageX - dragStart.x,
      y: pageY - dragStart.y,
    });
  };

  const endDrag = () => {
    if (!zoomed) return;
    isDragging.current = false;
  };

  // Don't render if no images
  if (!galleryImages || galleryImages.length === 0) {
    return (
      <section className="event-gallery-section">
        <div className="event-section-card">
          <div className="event-section-header">
            <span className="event-section-indicator" />
            <h2 className="section-title">
              <span className="icon">
                <FiImage />
              </span>{' '}
              Event Gallery
            </h2>
          </div>
          <p className="no-images-text">No images available for this event.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="event-gallery-section">
      <div className="event-section-card">
        <div className="event-section-header">
          <span className="event-section-indicator" />
          <h2 className="section-title">
            <span className="icon">
              <FiImage />
            </span>{' '}
            Event Gallery
          </h2>
        </div>

        <div className="event-gallery-grid">
          {galleryImages.map((image, index) => (
            <div
              key={image.id || index}
              className={`gallery-item gallery-item-${image.size || 'medium'}`}
              onClick={() => openLightbox(image, index)}
            >
              <div className="gallery-image-wrapper">
                <img
                  src={image.src || '/assets/images/cake/banner/event-banner-1.png'}
                  alt={image.alt || `Gallery image ${index + 1}`}
                  className="gallery-image"
                />
                <div className="gallery-overlay">
                  <span className="gallery-zoom-icon">🔍</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gallery Viewer Modal (similar to PressViewer) */}
      {selectedImage && (
        <div className="gallery-viewer" role="dialog" aria-modal="true">
          <div className="gallery-viewer__backdrop" onClick={closeLightbox} />

          <div className="gallery-viewer__stage">
            {/* LEFT NAV */}
            <button
              className="gallery-viewer__nav gallery-viewer__nav--left"
              aria-label="Previous image"
              onClick={prev}
            >
              <FaChevronLeft />
            </button>

            {/* IMAGE */}
            <div
              className="gallery-viewer__image-wrapper"
              onMouseDown={startDrag}
              onMouseMove={onDrag}
              onMouseUp={endDrag}
              onMouseLeave={endDrag}
              onTouchStart={startDrag}
              onTouchMove={onDrag}
              onTouchEnd={endDrag}
            >
              <img
                ref={imgRef}
                src={selectedImage.src}
                alt={selectedImage.alt}
                className={`gallery-viewer__image ${zoomed ? 'zoomed' : ''}`}
                onClick={toggleZoom}
                style={{
                  transform: `scale(${zoomed ? 2 : 1}) translate(${translate.x}px, ${translate.y}px)`,
                }}
                draggable={false}
              />

              {/* TITLE OVERLAY */}
              <div className="gallery-viewer__overlay">
                <h3 className="gallery-viewer__title">{selectedImage.alt}</h3>
              </div>
            </div>

            {/* RIGHT NAV */}
            <button
              className="gallery-viewer__nav gallery-viewer__nav--right"
              aria-label="Next image"
              onClick={next}
            >
              <FaChevronRight />
            </button>
          </div>

          {/* BOTTOM CONTROLS */}
          <div className="gallery-viewer__controls">
            <span className="gallery-viewer__count">
              {activeIndex + 1} / {galleryImages.length}
            </span>

            <button aria-label="Close viewer" onClick={closeLightbox}>
              <IoClose />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default EventGallerySection;
