'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { getOptimizedCdnImageUrl } from '@/utils/helpers';

/**
 * ImageMagnifier Component
 * 
 * A configurable image magnifier that shows an enlarged version of an image on hover.
 * Works with image sliders and is disabled on mobile devices.
 * 
 * @param {Object} props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Image alt text
 * @param {number} props.width - Original image width
 * @param {number} props.height - Original image height
 * @param {string} props.className - Additional CSS classes for the image
 * @param {Object} props.magnifierConfig - Magnifier configuration
 * @param {number} props.magnifierConfig.lensWidth - Lens width in pixels (default: 150)
 * @param {number} props.magnifierConfig.lensHeight - Lens height in pixels (default: 150)
 * @param {number} props.magnifierConfig.containerWidth - Magnifier container width (default: 400)
 * @param {number} props.magnifierConfig.containerHeight - Magnifier container height (default: 400)
 * @param {number} props.magnifierConfig.zoomLevel - Zoom magnification factor (default: 2.5)
 * @param {string} props.magnifierConfig.position - Position of magnifier: 'top' | 'right' | 'bottom' | 'left' (default: 'right')
 * @param {number} props.magnifierConfig.gap - Gap between image and magnifier container (default: 20)
 * @param {number} props.magnifierConfig.mobileBreakpoint - Screen width below which zoom is disabled (default: 992)
 * @param {string} props.magnifierConfig.lensColor - Lens background color (default: 'rgba(0, 0, 0, 0.2)')
 * @param {string} props.magnifierConfig.lensBorderColor - Lens border color (default: '#2b2b2b')
 */
const ImageMagnifier = ({
  src,
  alt = '',
  width = 800,
  height = 800,
  className = '',
  magnifierConfig = {},
  priority = false,
}) => {
  const {
    lensWidth = 150,
    lensHeight = 150,
    containerWidth = 400,
    containerHeight = 400,
    zoomLevel = 2.5,
    mobileBreakpoint = 992,
    lensColor = 'rgba(0, 0, 0, 0.2)',
    lensBorderColor = '#333',
  } = magnifierConfig;

  const [showMagnifier, setShowMagnifier] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [cursorRelative, setCursorRelative] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageContainerRef = useRef(null);

  const displaySrc = getOptimizedCdnImageUrl(src, 800, 800, 80);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mobileBreakpoint]);

  const handleMouseEnter = useCallback(() => {
    if (!isMobile && imageLoaded) {
      setShowMagnifier(true);
    }
  }, [isMobile, imageLoaded]);

  const handleMouseLeave = useCallback(() => {
    setShowMagnifier(false);
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (isMobile || !imageContainerRef.current || !imageLoaded) return;

      const elem = imageContainerRef.current;
      const rect = elem.getBoundingClientRect();

      // Calculate cursor position relative to image
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Store cursor position for zoom offset
      setCursorRelative({ x, y });

      // Determine overlay size (clamped to image bounds)
      const targetWidth = containerWidth || lensWidth;
      const targetHeight = containerHeight || lensHeight;
      const overlayWidth = Math.min(targetWidth, rect.width);
      const overlayHeight = Math.min(targetHeight, rect.height);

      // Calculate lens position (centered on cursor)
      let lensX = x - overlayWidth / 2;
      let lensY = y - overlayHeight / 2;

      // Constrain lens within image bounds
      lensX = Math.max(0, Math.min(lensX, rect.width - overlayWidth));
      lensY = Math.max(0, Math.min(lensY, rect.height - overlayHeight));

      setLensPosition({ x: lensX, y: lensY });
    },
    [isMobile, containerWidth, containerHeight, imageLoaded, lensWidth, lensHeight]
  );

  // Calculate magnifier container style (inside the image bounds)
  const getMagnifierContainerStyle = () => {
    if (!imageContainerRef.current) return { display: 'none' };

    const rect = imageContainerRef.current.getBoundingClientRect();
    const targetWidth = containerWidth || lensWidth;
    const targetHeight = containerHeight || lensHeight;
    const overlayWidth = Math.min(targetWidth, rect.width);
    const overlayHeight = Math.min(targetHeight, rect.height);

    return {
      position: 'absolute',
      left: `${lensPosition.x}px`,
      top: `${lensPosition.y}px`,
      width: `${overlayWidth}px`,
      height: `${overlayHeight}px`,
      overflow: 'hidden',
      border: '2px solid #ddd',
      backgroundColor: '#fefefe',
      zIndex: 100,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      borderRadius: '4px',
      pointerEvents: 'none',
    };
  };

  // Calculate the zoomed image size and position
  const getZoomedImageStyle = () => {
    if (!imageContainerRef.current) return {};

    const rect = imageContainerRef.current.getBoundingClientRect();
    const targetWidth = containerWidth || lensWidth;
    const targetHeight = containerHeight || lensHeight;
    const overlayWidth = Math.min(targetWidth, rect.width);
    const overlayHeight = Math.min(targetHeight, rect.height);
    const zoomedWidth = rect.width * zoomLevel;
    const zoomedHeight = rect.height * zoomLevel;

    // Position zoom so that the point under the cursor stays centered in the overlay
    let offsetX = cursorRelative.x * zoomLevel - overlayWidth / 2;
    let offsetY = cursorRelative.y * zoomLevel - overlayHeight / 2;

    // Clamp offsets to keep zoomed image covering the overlay
    offsetX = Math.max(0, Math.min(offsetX, zoomedWidth - overlayWidth));
    offsetY = Math.max(0, Math.min(offsetY, zoomedHeight - overlayHeight));

    return {
      position: 'absolute',
      width: `${zoomedWidth}px`,
      height: `${zoomedHeight}px`,
      maxWidth: 'none',
      left: `-${offsetX}px`,
      top: `-${offsetY}px`,
    };
  };

  return (
    <div
      ref={imageContainerRef}
      className="image-magnifier-container"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        cursor: isMobile ? 'default' : 'crosshair',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <img
        src={displaySrc}
        alt={alt}
        width={800}
        height={800}
        className={className}
        style={{
          objectFit: 'contain',
        }}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        draggable={false}
        onLoad={() => setImageLoaded(true)}
      />

      {/* Magnifier container with zoomed image (inside image bounds) */}
      {showMagnifier && !isMobile && (
        <div
          className="magnifier-preview"
          style={getMagnifierContainerStyle()}
        >
          <img
            src={src}
            alt={alt}
            style={getZoomedImageStyle()}
          />
        </div>
      )}
    </div>
  );
};

export default ImageMagnifier;
