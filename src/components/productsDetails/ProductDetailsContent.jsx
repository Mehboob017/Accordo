'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { RiCopperCoinLine, RiFileCopyLine, RiCheckLine } from 'react-icons/ri';
import PdpProductInfo from './PdpProductInfo';
import PdpVariantSelector from './PdpVariantSelector';
import PdpCartActions from './PdpCartActions';
import ProductDetailAction from '@/components/productDetails/common/ProductDetailAction';
import styles from './ProductsDetailPage.module.scss';
import { getProductEarnedSdlCoins } from '@/utils/cart/cartUtils';
import { OFFER_TYPE_LABELS } from '@/utils/constants';


const formatDate = (value) => {
  if (!value) {
    return '';
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return parsedDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return '₹0';
  }

  return `₹${amount.toFixed(0)}`;
};

const getOfferTypeLabel = (offer = {}) => {
  const resolvedOfferType = String(offer?.offerType || '').trim().toUpperCase();

  if (resolvedOfferType && OFFER_TYPE_LABELS[resolvedOfferType]) {
    return OFFER_TYPE_LABELS[resolvedOfferType];
  }

  if (resolvedOfferType) {
    return resolvedOfferType.replaceAll('_', ' ');
  }

  return 'Offer';
};

const getOfferBenefit = (offer = {}) => {
  const rewardType = String(offer?.rewardType || '').trim().toUpperCase();
  const discountPercent = Number(offer?.discountPercent);
  const discountAmount = Number(offer?.discountAmount);
  const fixedPrice = Number(offer?.fixedPrice);
  const rewardQty = Number(offer?.rewardQty);

  if (rewardType === 'DISCOUNT_PERCENT' && Number.isFinite(discountPercent) && discountPercent > 0) {
    return `Get up to ${discountPercent}% off`;
  }

  if (rewardType === 'DISCOUNT_AMOUNT' && Number.isFinite(discountAmount) && discountAmount > 0) {
    return `Get up to ${formatCurrency(discountAmount)} off`;
  }

  if (rewardType === 'FIXED_PRICE' && Number.isFinite(fixedPrice) && fixedPrice > 0) {
    return `Get this at ${formatCurrency(fixedPrice)}`;
  }

  if (rewardType === 'FREE_PRODUCT' && Number.isFinite(rewardQty) && rewardQty > 0) {
    return `Get ${rewardQty} free product${rewardQty > 1 ? 's' : ''}`;
  }

  return 'Offer benefit available on eligible cart';
};

const getCouponCode = (coupon = {}) =>
  String(coupon?.name || coupon?.code || coupon?.couponCode || '').trim().toUpperCase();

const getCouponBenefitLabel = (coupon = {}) => {
  const discountType = String(coupon?.type || '').trim().toUpperCase();
  const discountValue = Number(coupon?.discountValue);
  const maxDiscountAmount = Number(coupon?.maxDiscountAmount);
  const minOrderAmount = Number(coupon?.minOrderAmount);

  const discountLabel =
    discountType === 'PERCENTAGE' && Number.isFinite(discountValue) && discountValue > 0
      ? `${discountValue}% off`
      : Number.isFinite(discountValue) && discountValue > 0
        ? `${formatCurrency(discountValue)} off`
        : 'Special discount';

  const maxLabel =
    Number.isFinite(maxDiscountAmount) && maxDiscountAmount > 0
      ? `up to ${formatCurrency(maxDiscountAmount)}`
      : '';

  const minLabel =
    Number.isFinite(minOrderAmount) && minOrderAmount > 0
      ? `on orders above ${formatCurrency(minOrderAmount)}`
      : '';

  return [discountLabel, maxLabel, minLabel].filter(Boolean).join(' ');
};

const ProductDetailsContent = ({
  productState,
  setProductState,
  availableOffers = [],
  availableCoupons = [],
  // --- New Props Received from ProductsDetailPage ---
  isDoctorProduct,
  isVerifiedDoctor
}) => {
  const product = productState?.product || {};
  const selectedVariation = productState?.selectedVariation;
  const superCoins = getProductEarnedSdlCoins({
    selectedVariation,
    product,
  });
  const [copiedIndex, setCopiedIndex] = useState(null);
  const copyResetTimerRef = useRef(null);

  const resolvedOffers = useMemo(() => {
    if (Array.isArray(availableOffers) && availableOffers.length > 0) {
      return availableOffers;
    }

    return Array.isArray(product?.availableOffers) ? product.availableOffers : [];
  }, [availableOffers, product?.availableOffers]);

  const resolvedCoupons = useMemo(() => {
    if (Array.isArray(availableCoupons) && availableCoupons.length > 0) {
      return availableCoupons;
    }

    return Array.isArray(product?.availableCoupons) ? product.availableCoupons : [];
  }, [availableCoupons, product?.availableCoupons]);

  useEffect(() => {
    return () => {
      if (copyResetTimerRef.current) {
        clearTimeout(copyResetTimerRef.current);
      }
    };
  }, []);

  const handleCopyCode = (code, index) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard || !code) {
      return;
    }

    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopiedIndex(index);
        if (copyResetTimerRef.current) {
          clearTimeout(copyResetTimerRef.current);
        }

        copyResetTimerRef.current = setTimeout(() => {
          setCopiedIndex((prev) => (prev === index ? null : prev));
        }, 2000);
      })
      .catch(() => { });
  };

  return (
    <div className={`right-box-contain ${styles['pdp-right-box']}`}>
      {/* ── Top meta: SKU / stock / wishlist / share / name / tags / price / description */}
      <PdpProductInfo
        productState={productState}
        // Pass to child component
        isDoctorProduct={isDoctorProduct}
        isVerifiedDoctor={isVerifiedDoctor}
      />

      {/* ── Availability: size / weight variants */}
      {/* Wrapped in Suspense to prevent useSearchParams() inside PdpVariantSelector
           from bubbling up to the layout-level Suspense boundary (loading.jsx),
           which is what causes the parent loader to flash again. */}
      {/* {product?.productVariants?.length > 1 && ( */}
      <Suspense fallback={null}>
        <PdpVariantSelector
          productState={productState}
          setProductState={setProductState}
          // Pass to child component (used in the mapped variant buttons)
          isDoctorProduct={isDoctorProduct}
          isVerifiedDoctor={isVerifiedDoctor}
        />
      </Suspense>
      {/* )} */}

      {/* ── SDL Coins earned */}
      {superCoins > 0 && (
        <div className="variation-coin-inline">
          <span className="variation-coin-inline__text">
            Earn{' '}
            <RiCopperCoinLine
              size={14}
              className="variation-coin-inline__icon"
            />{' '}
            <strong>{superCoins} SDL Points</strong>
          </span>
        </div>
      )}

      {/* ── Cart actions: Buy Now / Add to Cart / delivery checker */}
      <PdpCartActions
        productState={productState}
        setProductState={setProductState}
        // Optional: Pass down if PdpCartActions also renders pricing
        isDoctorProduct={isDoctorProduct}
        isVerifiedDoctor={isVerifiedDoctor}
      />

      {/* ── Trust badges */}
      <div className={styles['trust-badges']}>
        <div className={styles['trust-badge-item']}>
          <img
            src={'/assets/images/product/features/siddhantik_ayurved_sdl.svg'}
            alt="ISO Certified"
            className={styles['trust-badge-icon']}
          />
        </div>
        <div className={styles['trust-badge-item']}>
          <img
            src={'/assets/images/product/features/legacy_sdl.svg'}
            alt="Free Delivery"
            className={styles['trust-badge-icon']}
          />
        </div>
        <div className={styles['trust-badge-item']}>
          <img
            src={'/assets/images/product/features/standard_sdl.svg'}
            alt="ISO Certified"
            className={styles['trust-badge-icon']}
          />
        </div>
        <div className={styles['trust-badge-item']}>
          <img
            src={'/assets/images/product/features/pan_india.svg'}
            alt="Cash on Delivery"
            className={styles['trust-badge-icon']}
          />
        </div>
        <div className={styles['trust-badge-item']}>
          <img
            src={'/assets/images/product/features/secure_payment_sdl.svg'}
            alt="100% Ayurvedic"
            className={styles['trust-badge-icon']}
          />
        </div>


      </div>

      {resolvedOffers.length > 0 && (
        <div className={styles['available-offers']}>
          <h5 className={styles['offers-heading']}>Available Offers</h5>

          <div className={styles['offers-list'] + ' hide-scrollbar'} data-lenis-prevent>
            {resolvedOffers.map((offer, index) => {
              const offerId = String(offer?.uid || index);
              const validTill = formatDate(offer?.validTo);
              const offerTypeLabel = getOfferTypeLabel(offer);

              return (
                <div key={offerId} className={styles['offer-card-ticket']}>
                  <div className={styles['offer-card']}>
                    <img
                      src="/assets/images/product/coupons/coupon-accent.png"
                      draggable={false}
                      alt="Offer Accent"
                      aria-hidden="true"
                      className={styles['offer-card-strip']}
                    />
                    <div className={styles['offer-card-content']}>
                      <p className={styles['offer-description']}>
                        {offer?.name || 'Offer'}
                      </p>
                      <p className={styles['offer-benefit']}>
                        {getOfferBenefit(offer)}
                      </p>

                      {/* <div className={styles['offer-code-label']}>
                        <span>{offerTypeLabel}</span>
                        <span className={styles['offer-validity']}>
                          {validTill ? `Valid till ${validTill}` : 'Auto applied at checkout'}
                        </span>
                      </div> */}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {resolvedCoupons.length > 0 && (
        <div className={`${styles['available-offers']} ${styles['available-coupons']}`}>
          <h5 className={styles['offers-heading']}>Available Coupons</h5>

          <div className={styles['offers-list'] + ' hide-scrollbar'} data-lenis-prevent>
            {resolvedCoupons.map((coupon, index) => {
              const couponId = String(coupon?.uid || index);
              const couponCode = getCouponCode(coupon);
              const validTill = formatDate(coupon?.validTo);
              const couponCopyKey = `coupon-${couponId}`;

              return (
                <div key={couponId} className={styles['offer-card-ticket']}>
                  <div className={`${styles['offer-card']} ${styles['coupon-card']}`}>
                    <img
                      src="/assets/images/product/coupons/coupon-accent.png"
                      draggable={false}
                      alt="Coupon Accent"
                      aria-hidden="true"
                      className={styles['offer-card-strip']}
                    />
                    <div className={styles['offer-card-content']}>
                      <p className={styles['offer-description']}>
                        {getCouponBenefitLabel(coupon)}
                      </p>

                      {/* <p className={styles['coupon-note']}>
                        {String(coupon?.shortDescription || coupon?.termsAndConditions || 'Use this coupon at checkout.').trim()}
                      </p> */}

                      <div className={styles['offer-code-label']}>
                        <span className={styles['coupon-code-pill']}>
                          {couponCode || ''}
                        </span>

                        <button
                          type="button"
                          className={styles['offer-copy-btn']}
                          title="Copy code"
                          onClick={() => handleCopyCode(couponCode, couponCopyKey)}
                          disabled={!couponCode}
                        >
                          {copiedIndex === couponCopyKey ? (
                            <RiCheckLine size={14} />
                          ) : (
                            <RiFileCopyLine size={14} />
                          )}
                          {copiedIndex === couponCopyKey && (
                            <div className={styles['offer-copy-wrapper']}>
                              <span className={styles['offer-tooltip']}>Copied!</span>
                            </div>
                          )}
                        </button>
                      </div>

                      {/* {validTill && (
                        <p className={styles['offer-validity-row']}>
                          Valid till {validTill}
                        </p>
                      )} */}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ProductDetailAction
        productState={productState}
        setProductState={setProductState}
      />
    </div>
  );
};

export default ProductDetailsContent;