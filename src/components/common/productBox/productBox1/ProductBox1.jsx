'use client';

import React, { useMemo, useContext, useId } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CartContext from '@/helper/cartContext';
import { RiStarFill, RiInformationLine } from 'react-icons/ri';
import { UncontrolledTooltip } from 'reactstrap';
import ProductBox1Cart from './ProductBox1Cart';
import ProductBadge from './ProductBagde';
import { ModifyString } from '@/utils/customFunctions/ModifyString';
import AddToWishlistNew from '../AddToWishlistNew';
import {
  convertToRupees,
  formatReviewCount,
  getProductImageUrl,
  getOptimizedCdnImageUrl,
} from '@/utils/helpers';
import useImagePreload from '@/utils/hooks/useImagePreload';
import { brandLogo } from '../../../../data/CommonPath';
import { useUser } from '@/utils/hooks/useUser';


const ProductBox1 = ({
  imgUrl,
  productDetail,
  isClose,
  addAction = true,
  showBuyNow = true,
  classObj,
  onRemoveClick,
}) => {
  const reviewTooltipId = useId().replace(/:/g, '');
  const { isAuthenticated, userData } = useUser();
  const { cart } = useContext(CartContext) || {};
  const currentTheme = cart?.theme || productDetail?.theme;

  // console.log("product box 1 ", productDetail);
  // console.log("UserData ", userData);

  const displayPrices = useMemo(() => {
    const variations = productDetail?.variations;
    if (
      productDetail?.type === 'classified' &&
      Array.isArray(variations) &&
      variations.length > 0
    ) {
      const inStock = variations.filter((v) => v.stock_status === 'in_stock');
      const pool = inStock.length > 0 ? inStock : variations;
      const cheapest = pool.reduce((min, v) => {
        const p = v.sale_price ?? v.price ?? Infinity;
        const mp = min.sale_price ?? min.price ?? Infinity;
        return p < mp ? v : min;
      }, pool[0]);
      return {
        salePrice: cheapest.sale_price ?? cheapest.price,
        price: cheapest.price,
        discount: cheapest.discount ?? productDetail?.discount,
      };
    }

    // console.log(productDetail?.discount);

    return {
      salePrice: productDetail?.sale_price,
      price: productDetail?.price,
      discount: productDetail?.discount,
    };
  }, [productDetail]);

  const productCustomerType = productDetail?.customerType;

  const isDoctorProduct = productCustomerType === 'doctor';
  const isVerifiedDoctor = isAuthenticated && userData?.isDoctor === true;

  // Pricing access condition helper
  const shouldShowPricing = useMemo(() => {
    // Non-doctor products: always show pricing
    if (!isDoctorProduct) return true;

    // Doctor products: only show pricing if logged in AND is a doctor
    return isAuthenticated && userData?.isDoctor === true;
  }, [isDoctorProduct, isAuthenticated, userData?.isDoctor]);

  // Get rating and review count from product data
  const ratingData = useMemo(() => {
    return {
      rating: Number(productDetail?.rating ?? 0),
      reviewCount: Number(
        productDetail?.reviewCount ??
        productDetail?.rating_count ??
        productDetail?.reviews_count ??
        0
      ),
    };
  }, [productDetail]);

  const productHref = useMemo(() => {
    return productDetail?.slug
      ? `/products/${productDetail.slug}?productVariant=${productDetail?.productVariants?.[0]?.slug || ''}`
      : '/collections';
  }, [productDetail?.slug]);

  const imageSource = useMemo(() => {
    const rawUrl =
      getProductImageUrl(imgUrl) ||
      getProductImageUrl(productDetail?.product_thumbnail);
    return getOptimizedCdnImageUrl(rawUrl, 400, 400, 95);
  }, [imgUrl, productDetail?.product_thumbnail]);

  const {
    resolvedSrc,
    isLoaded: isImageLoaded,
    isError: isImageError,
  } = useImagePreload(imageSource, {
    fallbackSrc: '',
  });

  return (
    <div
      className={`product-box d-flex flex-column h-100 ${classObj?.productBoxClass} p-0`}
    >
      <ProductBadge productDetail={productDetail} />
      <div className="product-image">
        <a
          className="d-block h-100 w-100 product-image-link"
          href={productHref}
        >
          {/* console.log(currentTheme?.type) &&  */}
          {(currentTheme?.type === "Website") && currentTheme?.image && (
            <Image src={currentTheme.image} style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              zIndex: '3',
              left: '0',
              top: '0',
            }} alt={currentTheme?.imageAlt || "event theme"} width={500} height={500} />
          )}
          <span
            className={`product-image-shell ${isImageLoaded ? 'is-loaded' : 'is-loading'} ${isImageError ? 'is-error' : ''}`}
            aria-busy={!isImageLoaded}
          >
            {!isImageLoaded && !isImageError ? (
              <span className="product-image-skeleton" aria-hidden="true" />
            ) : null}

            {isImageLoaded ? (
              <img
                src={resolvedSrc}
                alt={
                  productDetail?.name || 'Product image'
                }
                className="img-fluid h-100 product-image-preloaded"
                draggable={false}
                height={400}
                width={400}
                loading="lazy"
                decoding="async"
              />
            ) : null}

            {isImageError ? (
              <span className="product-image-fallback-text">
                Image unavailable
              </span>
            ) : null}
          </span>
        </a>
        <AddToWishlistNew
          productObj={productDetail}
          isActive={isClose}
          onRemoveClick={onRemoveClick}
        />
      </div>
      <div className="product-detail">
        <div className="product-detail--wrapper">
          <h3 style={{ fontSize: 'inherit' }}>
            <Link title={productDetail?.name} href={productHref} prefetch={false} className="name">
              {productDetail?.name}
            </Link>
          </h3>
          <div className="product-detail-bottom">
            {productDetail?.stock_status && (
              <>
                <div className="meta-1">
                  <div className="">
                    {productDetail?.unit && productDetail?.weight ? (
                      <h6 className="unit">
                        {productDetail?.weight}
                        {productDetail?.unit}
                      </h6>
                    ) : null}
                    <span
                      className={`${productDetail?.stock_status === 'out_of_stock' ? 'out_of_stock-color' : 'in_stock-color'}`}
                    >
                      {ModifyString(productDetail.stock_status, false, '_')}
                    </span>
                  </div>
                  {ratingData.rating > 0 && (
                    <div className="">
                      <div className="rating-section">
                        <span className="stars">
                          <RiStarFill size={14} />
                        </span>
                        <span className="review-count">
                          <span className="count">
                            {ratingData.rating.toFixed(1)}
                          </span>{' '}
                          ({formatReviewCount(ratingData.reviewCount)})
                        </span>
                        <span
                          id={reviewTooltipId}
                          className="d-inline-flex align-items-center"
                          style={{
                            cursor: 'pointer',
                            color: 'var(--9e9e9e)',
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <RiInformationLine size={14} className="" />
                        </span>
                        <UncontrolledTooltip
                          placement="top"
                          target={reviewTooltipId}
                          style={{ fontSize: 12 }}
                        >
                          Average Rating Across Marketplaces & SDL India
                        </UncontrolledTooltip>
                      </div>
                    </div>
                  )}
                </div>

                <div className="price-row">
                  {isDoctorProduct &&
                    !(isAuthenticated && userData?.isDoctor === true) ? (
                    // CASE 1: Restricted Doctor Product
                    // (It's a doctor product, but user is NOT an authenticated doctor)
                    // -> Show ONLY MRP inside disc-price
                    <div className="disc-price">
                      <span
                        style={{
                          fontSize: 14,
                          color: '#6f6f6f',
                          lineHeight: 1,
                        }}
                      >
                        M.R.P.
                      </span>{' '}
                      {convertToRupees(displayPrices.price)}
                    </div>
                  ) : // CASE 2: Authorized Viewer
                    // (Either a regular product OR a logged-in doctor viewing a doctor product)
                    displayPrices.salePrice === displayPrices.price ? (
                      // 2A: Sale price and MRP are the same -> Only show one price
                      <div className="disc-price">
                        <span
                          style={{
                            fontSize: 14,
                            color: '#6f6f6f',
                            lineHeight: 1,
                          }}
                        >
                          M.R.P.
                        </span>{' '}
                        {convertToRupees(displayPrices.salePrice)}
                      </div>
                    ) : (
                      // 2B: Sale price is different from MRP -> Show both + conditional discount
                      <>
                        <div className="disc-price">
                          {convertToRupees(displayPrices.salePrice)}
                        </div>

                        <div className="selling-price">
                          <span
                            style={{
                              fontSize: 14,
                              color: '#6f6f6f',
                              lineHeight: 1,
                            }}
                          >
                            M.R.P.
                          </span>{' '}
                          {convertToRupees(displayPrices.price)}
                        </div>

                        {displayPrices.discount > 0 && (
                          <div className="percent-off">
                            {displayPrices.discount}% Off
                          </div>
                        )}
                      </>
                    )}
                </div>
              </>
            )}

            {addAction && (
              <ProductBox1Cart
                productObj={productDetail}
                showBuyNow={showBuyNow}
                shouldShowPricing={shouldShowPricing}
                displayPrices={displayPrices}
                isDoctorProduct={isDoctorProduct}
                isVerifiedDoctor={isVerifiedDoctor}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductBox1;
