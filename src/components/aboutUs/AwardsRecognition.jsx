'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Row, Col } from 'reactstrap';
import styles from './ProfileSection.module.scss';
import CustomHeading from '../common/CustomHeading';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { IoClose } from "react-icons/io5";
import WrapperComponent from '../common/WrapperComponent';

const AwardsRecognition = () => {
  const awardImages = [
    {
      id: 1,
      src: '/assets/images/award/awardimg1.webp',
      alt: 'Award 1',
      // name: 'Nagarjuna Awards 2007 at the hands of Hon’ble Vice President of India Shri. Bhairon Singh Shekhawat for its Standardised and Best Quality medicine production',
    },
    {
      id: 2,
      src: '/assets/images/award/awardimg2.webp',
      alt: 'Award 2',
      // name: 'Nagarjuna Awards 2009 at the hands of Hon’ble President of India Smt. Pratibha Patil for its Standardised and Best Quality medicine production',
    },
    {
      id: 3,
      src: '/assets/images/award/awardimg3.webp',
      alt: 'Award 3',
      name: '',
    },
    // {
    //   id: 4,
    //   src: '/assets/images/award/awardimg4.webp',
    //   alt: 'Award 4',
    //   name: '',
    // },
    // {
    //   id: 5,
    //   src: '/assets/images/award/awardimg5.webp',
    //   alt: 'Award 5',
    //   name: '',
    // },
    // {
    //   id: 6,
    //   src: '/assets/images/award/awardimg6.webp',
    //   alt: 'Award 6',
    //   name: '',
    // },
  ];

  const [selectedImage, setSelectedImage] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const imgRef = useRef(null);

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
    setActiveIndex((prev) => (prev + 1) % awardImages.length);
    setSelectedImage(awardImages[(activeIndex + 1) % awardImages.length]);
  };

  const prev = () => {
    resetTranslate();
    const newIndex = activeIndex === 0 ? awardImages.length - 1 : activeIndex - 1;
    setActiveIndex(newIndex);
    setSelectedImage(awardImages[newIndex]);
  };

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

  const toggleZoom = () => { };
  const resetTranslate = () => setTranslate({ x: 0, y: 0 });

  const startDrag = (e) => {
    if (!zoomed) return;
    isDragging.current = true;
    const pageX = e.type.includes('touch') ? e.touches[0].pageX : e.pageX;
    const pageY = e.type.includes('touch') ? e.touches[0].pageY : e.pageY;
    setDragStart({ x: pageX - translate.x, y: pageY - translate.y });
  };

  const onDrag = (e) => {
    if (!zoomed || !isDragging.current) return;
    const pageX = e.type.includes('touch') ? e.touches[0].pageX : e.pageX;
    const pageY = e.type.includes('touch') ? e.touches[0].pageY : e.pageY;
    setTranslate({ x: pageX - dragStart.x, y: pageY - dragStart.y });
  };

  const endDrag = () => {
    if (!zoomed) return;
    isDragging.current = false;
  };

  return (
    <>
      <WrapperComponent
        classes={{
          sectionClass: `${styles['profile-section']} section-b-space`,
        }}
        noRowCol={true}
      >
        <Row>
          <Col xs={12}>
            <CustomHeading
              customClass="mb-0"
              title="Awards & Recognition"
            />
          </Col>
        </Row>

        {/* <Row className="mt-2">
          <Col xs={12}>
            <ul className={styles['profile-list']}>
              <li>Nagarjuna Awards 2007 at the hands of Hon’ble Vice President of India Shri. Bhairon Singh Shekhawat for its Standardised and Best Quality medicine production.</li>
              <li>Nagarjuna Awards 2009 at the hands of Hon’ble President of India Smt. Pratibha Patil for its Standardised and Best Quality medicine production.</li>
            </ul>
          </Col>
        </Row> */}

        <Row className=" gy-3">
          <Col xs={12}>
            <ul className={styles['profile-list']}>
              <li>Nagarjuna Awards 2007 at the hands of Hon’ble Vice President of India Shri. Bhairon Singh Shekhawat for its Standardised and Best Quality medicine production.</li>
              <li>Nagarjuna Awards 2009 at the hands of Hon’ble President of India Smt. Pratibha Patil for its Standardised and Best Quality medicine production.</li>
              <li>Herbal Industry Leader Award (2025) by Society for Ethnopharmacology (SFE)
                (Dr. Shivaji Rao Kadam Award)</li>
            </ul>
          </Col>
          {awardImages.map((image, index) => (
            <Col xs={12} sm={6} md={4} className=" text-center" key={image.id}>
              <img
                src={image.src}
                alt={image.alt}
                className="img-fluid rounded shadow-sm"
                style={{ width: '100%', height: '250px', objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => openLightbox(image, index)}
              />
              <p className={`${styles['award-name']} mb-0`}>{image.name}</p>
            </Col>
          ))}
        </Row>

      </WrapperComponent>

      {/* Gallery Viewer Modal */}
      {selectedImage && (
        <div className="gallery-viewer" role="dialog" aria-modal="true">
          <div className="gallery-viewer__backdrop" onClick={closeLightbox} />

          <div className="gallery-viewer__stage">
            <button
              className="gallery-viewer__nav gallery-viewer__nav--left"
              aria-label="Previous image"
              onClick={prev}
            >
              <FaChevronLeft />
            </button>

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

              <div className="gallery-viewer__overlay">
                {/* <h3 className="gallery-viewer__title">{selectedImage.alt}</h3> */}
              </div>
            </div>

            <button
              className="gallery-viewer__nav gallery-viewer__nav--right"
              aria-label="Next image"
              onClick={next}
            >
              <FaChevronRight />
            </button>
          </div>

          <div className="gallery-viewer__controls">
            <span className="gallery-viewer__count">
              {activeIndex + 1} / {awardImages.length}
            </span>

            <button aria-label="Close viewer" onClick={closeLightbox}>
              <IoClose />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AwardsRecognition;
