'use client';

import { useEffect, useMemo, useRef } from 'react';
import Slider from 'react-slick';
import ProductBox1 from '@/components/common/productBox/productBox1/ProductBox1';
import { normalizeProductForCard } from '@/utils/fallbackProducts';
import styles from './TrendingProductsSlider.module.scss';
import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';

const Arrow = ({ className, onClick, direction }) => {
  return (
    <button
      type="button"
      className={`${className} ${styles['trend-arrow']} ${styles[`trend-arrow-${direction}`]}`}
      onClick={onClick}
      aria-label={direction === 'next' ? 'Next products' : 'Previous products'}
    >
      {direction === 'next' ? <RiArrowRightSLine size={24} /> : <RiArrowLeftSLine size={24} />}
    </button>
  );
};

const TrendingProductsSlider = ({ products = [] }) => {
  const sliderContainerRef = useRef(null);
  const normalizedProducts = useMemo(
    () => products.map((product) => normalizeProductForCard(product)).filter(Boolean),
    [products]
  );

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
  }, [normalizedProducts]);

  if (!normalizedProducts.length) return null;

  const settings = {
    dots: false,
    infinite: normalizedProducts.length > 2,
    speed: 450,
    slidesToShow: 5,
    slidesToScroll: 1,
    // adaptiveHeight: false,
    // centerPadding: 50,
    arrows: normalizedProducts.length > 1,
    // variableWidth: false,
    // swipeToSlide: true,

    nextArrow: <Arrow direction="next" />,
    prevArrow: <Arrow direction="prev" />,
    responsive: [
      {
        breakpoint: 1640,
        settings: {
          slidesToShow: 4,
          infinite: normalizedProducts.length > 1,
        },
      },
      {
        breakpoint: 1440,
        settings: {
          slidesToShow: 4,
          infinite: normalizedProducts.length > 1,
        },
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          infinite: normalizedProducts.length > 1,
        },
      },
      // {
      //   breakpoint: 992,
      //   settings: {
      //     slidesToShow: 3,
      //     infinite: normalizedProducts.length > 1,
      //   },
      // },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 2,
          infinite: normalizedProducts.length > 1,
        },
      },
      // {
      //   breakpoint: 768,
      //   settings: {
      //     slidesToShow: 2,
      //     infinite: normalizedProducts.length > 1,
      //   },
      // },
      // {
      //   breakpoint: 576,
      //   settings: {
      //     variableWidth: true,  
      //     slidesToShow: 2,
      //     infinite: normalizedProducts.length > 1,
      //   },
      // },
    ],
  };

  return (
    <div className={styles['trending-wrapper']}>
      <h2 className={styles['trending-title']}>Related Products</h2>
      <div ref={sliderContainerRef} className={styles['slider-shell']}>
        <Slider {...settings}>
          {normalizedProducts.map((product, i) => (
            <div className={styles['slide-item']} key={product.uid || product.id || i}>
              <ProductBox1
                imgUrl={product?.product_thumbnail}
                productDetail={product}
                classObj={{ productBoxClass: 'product-box-3' }}
              />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default TrendingProductsSlider;
