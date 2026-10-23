'use client';

import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  RiAddLine,
  RiSubtractLine,
  RiMapPinLine,
  RiCloseLine,
  RiSearchLine,
} from 'react-icons/ri';
import CartContext from '@/helper/cartContext';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import { useRouter } from 'next/navigation';
import ProductAdditionalInfoAccordion from '@/components/productDetails/common/ProductAdditionalInfoAccordion';
import { setCheckoutRequest } from '@/api/checkout.api';
import { checkDeliveryPincode } from '@/api/delivery.api';
import { notifyProductAvailability } from '@/api/orders.api';
import { CUSTOMER_TYPES, getProductCustomerType } from '@/utils/cart/cartUtils';
import { ToastNotification } from '@/utils/customFunctions/ToastNotification';
import { useCartPreview } from '@/utils/hooks/useCart';
import { trackMetaEvent } from '@/utils/metaPixel';

const ProductDetailAction = ({
  productState,
  setProductState,
  extraOption,
}) => {
  const router = useRouter();
  const {
    cartValue,
    rawCartProducts,
    handleIncDec,
    freeShippingThreshold,
    addToCartMutation,
    removeFromCartMutation,
  } = useContext(CartContext);
  const themeCtx = useContext(ThemeOptionContext);
  const { data: cartPreviewInfo, isFetching, isSuccess } = useCartPreview();
  const themeOption = themeCtx?.themeOption;
  const setCartCanvas = themeCtx?.setCartCanvas;
  const payableBeforeDelivery =
    cartPreviewInfo?.data?.pricing?.payableBeforeDelivery;
  const payableAmount = cartPreviewInfo?.data?.pricing?.payableAmount;

  const [productQty, setProductQty] = useState(productState?.productQty || 1);
  const [isOpen, setIsOpen] = useState(false);
  const [isFreeShippingUnlocked, setIsFreeShippingUnlocked] = useState(false);
  const [pincode, setPincode] = useState('');
  const [deliveryError, setDeliveryError] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState('idle'); // idle | success | error
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);

  const product = productState?.product || {};
  const selectedVariation = productState?.selectedVariation;
  const customerType = getProductCustomerType(product);
  const isRetailerProduct = customerType === CUSTOMER_TYPES.RETAILER;
  const departmentName = productState?.product?.department?.name;
  const isBook = departmentName === 'Books';

  const cartCount = Math.max(0, Number(cartValue || 0));

  // CartContext expects product.id — provide uid as id (matches PdpCartActions / ShowProduct)
  const cartCompatibleProduct = useMemo(
    () => (product?.uid ? { ...product, id: product.uid } : product),
    [product]
  );

  // Build cart-compatible state for CartContext (variation needs id, sale_price, price, product_id)
  const cartCompatibleState = useMemo(() => {
    const cartVariation = selectedVariation
      ? {
        ...selectedVariation,
        id: selectedVariation.uid,
        sale_price:
          selectedVariation.disPrice ?? selectedVariation.sale_price,
        price: selectedVariation.mrp ?? selectedVariation.price,
        product_id: product?.uid ?? product?.id,
      }
      : null;
    return {
      ...productState,
      product: cartCompatibleProduct,
      selectedVariation: cartVariation,
      variation_id: selectedVariation?.uid ?? null,
    };
  }, [
    productState,
    cartCompatibleProduct,
    selectedVariation,
    product?.uid,
    product?.id,
  ]);

  const isDeliverySuccess = deliveryStatus === 'success';
  const isDeliveryError = deliveryStatus === 'error';
  const isCartUpdating =
    Boolean(addToCartMutation?.isPending) ||
    Boolean(removeFromCartMutation?.isPending);

  const getSelectedVariationId = (variation) =>
    variation?.uid ??
    variation?.id ??
    variation?.variation_id ??
    variation?.variationId ??
    null;

  const selectedVariationId = getSelectedVariationId(
    productState?.selectedVariation
  );

  const cartLineForProduct = useMemo(() => {
    if (!rawCartProducts?.length || !product?.uid) return null;

    const byProduct = (item) =>
      String(item?.product_id ?? item?.productUid) === String(product.uid);

    if (selectedVariationId) {
      return (
        rawCartProducts.find(
          (item) =>
            byProduct(item) &&
            String(item?.variation_id ?? item?.variantUid) ===
            String(selectedVariationId)
        ) ?? null
      );
    }

    return (
      rawCartProducts.find(
        (item) => byProduct(item) && !(item?.variation_id ?? item?.variantUid)
      ) ?? null
    );
  }, [rawCartProducts, product?.uid, selectedVariationId]);

  const resolvedStockQuantity = Number(
    cartLineForProduct?.variant?.stockQty ??
    cartLineForProduct?.variation?.quantity ??
    selectedVariation?.stockQty ??
    selectedVariation?.quantity ??
    product?.productVariants?.[0]?.stockQty ??
    product?.productVariants?.[0]?.quantity ??
    product?.quantity
  );

  const hasStockQuantity =
    Number.isFinite(resolvedStockQuantity) && resolvedStockQuantity >= 1;

  const hasInStockFlag = Boolean(
    selectedVariation?.inStockFlag ??
    product.productVariants?.[0]?.inStockFlag ??
    false
  );

  const isOutOfStock = !(hasInStockFlag || hasStockQuantity);

  const cartStyle = useMemo(() => {
    return themeOption?.general?.cart_style
      ? themeOption?.general?.cart_style
      : 'cart_sidebar';
  }, [themeOption]);

  useEffect(() => {
    if (cartLineForProduct) {
      const qty = Number(
        cartLineForProduct.qty ?? cartLineForProduct.quantity ?? 1
      );

      setProductQty(qty);
      setIsOpen(qty > 0);

      setProductState((prev) => ({
        ...prev,
        productQty: qty,
      }));
    } else {
      setIsOpen(false);
      setProductQty(1);

      setProductState((prev) => ({
        ...prev,
        productQty: 1,
      }));
    }
  }, [cartLineForProduct, selectedVariationId, setProductState]);

  // --- UPDATED LOGIC HERE ---
  const handleAddToCart = () => {
    if (isOutOfStock) return;

    const qtyToAdd = productQty > 0 ? productQty : 1;

    handleIncDec(
      qtyToAdd, // delta (add 1)
      cartCompatibleProduct, // product object
      0, // currentQty
      () => setProductQty(qtyToAdd), // INTERCEPTOR: Force state to exactly 1, ignoring provider math bugs
      setIsOpen,
      cartCompatibleState,
      false
    );
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const nextQty = productQty > 0 ? productQty : 1;
    setIsBuyingNow(true);

    const checkoutPayload = {
      productUid: productState?.product?.uid,
      variantUid:
        productState?.selectedVariation?.uid ??
        product?.productVariants?.[0]?.uid,
      quantity: nextQty,
    };

    const itemPrice = Number(
      productState?.selectedVariation?.sale_price ??
      productState?.selectedVariation?.disPrice ??
      productState?.selectedVariation?.mrp ??
      product?.disPrice ??
      product?.mrp ??
      0
    );

    trackMetaEvent('InitiateCheckout', {
      content_ids: [checkoutPayload.variantUid || checkoutPayload.productUid].filter(Boolean),
      content_type: 'product',
      value: itemPrice * checkoutPayload.quantity,
      currency: 'INR',
      num_items: checkoutPayload.quantity
    });

    setCheckoutRequest(checkoutPayload);
    router.push('/checkout');
  };

  const handleViewCart = () => {
    if (cartStyle === 'cart_sidebar' && typeof setCartCanvas === 'function') {
      setCartCanvas(true);
      return;
    }
    router.push('/cart');
  };

  const handlePromoClick = () => {
    setIsFreeShippingUnlocked(true);
  };

  const handleNotifyMe = async () => {
    const productUidForNotify = product?.uid ?? product?.id;
    const variantUidForNotify =
      selectedVariation?.uid ?? product?.productVariants?.[0]?.uid;

    if (!productUidForNotify || !variantUidForNotify) {
      ToastNotification(
        'error',
        'Unable to notify for this product right now.'
      );
      return;
    }

    setIsNotifying(true);

    try {
      const response = await notifyProductAvailability({
        productUid: productUidForNotify,
        variantUid: variantUidForNotify,
      });

      ToastNotification(
        'success',
        response?.message ||
        'Thanks! We will notify you when this product is back in stock.'
      );
    } catch (error) {
      ToastNotification(
        'error',
        error?.message || 'Unable to register notification request right now.'
      );
    } finally {
      setIsNotifying(false);
    }
  };

  const handleQtyChange = (delta) => {
    const nextQty = Math.max(1, (productQty || 1) + delta);
    handleIncDec(
      delta,
      cartCompatibleProduct,
      productQty, // Subsequent clicks correctly pass the truthy current quantity
      setProductQty,
      setIsOpen,
      cartCompatibleState,
      false
    );
  };

  const applyPincodeResult = (trimmed, message) => {
    setDeliveryError('');
    setDeliveryStatus('success');
    setPincode(trimmed);
    setDeliveryMessage(message);
  };

  const applyPincodeError = (trimmed, message) => {
    setDeliveryError('');
    setDeliveryStatus('error');
    setPincode(trimmed);
    setDeliveryMessage(message);
  };

  const resetPincodeCheck = () => {
    setDeliveryError('');
    setDeliveryStatus('idle');
    setDeliveryMessage('');
  };

  const handleCheckPincode = async (event) => {
    event.preventDefault();
    const trimmed = (pincode || '').trim();
    const selectedVariationForDelivery =
      selectedVariation ?? product?.productVariants?.[0];

    if (!/^\d{6}$/.test(trimmed)) {
      setDeliveryError('Please enter a valid 6-digit pincode.');
      return;
    }

    setIsCheckingPincode(true);

    try {
      const response = await checkDeliveryPincode({
        pincode: trimmed,
        selectedVariation: selectedVariationForDelivery,
      });

      if (response?.success && response?.serviceable) {
        const deliveryEstimate = response?.expectedDeliveryDate;

        if (!deliveryEstimate) {
          applyPincodeError(trimmed, 'Sorry We Do Not Deliver Here');
          return;
        }

        if (
          typeof deliveryEstimate === 'string' &&
          deliveryEstimate.toLowerCase().includes('days')
        ) {
          applyPincodeResult(trimmed, `Delivery in ${deliveryEstimate}`);
          return;
        }

        const extraDeliveryDays = 4;
        let baseDate = new Date(deliveryEstimate);

        if (isNaN(baseDate.getTime())) {
          baseDate = new Date();
        }

        baseDate.setDate(baseDate.getDate() + extraDeliveryDays);

        const formattedDate = baseDate.toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        });

        applyPincodeResult(trimmed, `Delivery By ${formattedDate}`);
        return;
      }

      applyPincodeError(trimmed, 'Sorry We Do Not Deliver Here');
    } catch (error) {
      setDeliveryStatus('idle');
      setDeliveryError(error?.message || 'Unable to check delivery right now.');
    } finally {
      setIsCheckingPincode(false);
    }
  };

  return (
    <>
      {!isOutOfStock && (
        <>
          <div
            className={`delivery-checker-card${isDeliverySuccess ? ' delivery-checker-card--success' : ''
              }${isDeliveryError ? ' delivery-checker-card--error' : ''}`}
          >
            {deliveryStatus === 'idle' ? (
              <>
                <div className="delivery-checker-card__header">
                  <h2 className="mb-1">Check Delivery Availability</h2>
                  <p className="mb-0">
                    Enter your pincode to check serviceability
                  </p>
                </div>

                <form
                  className="delivery-checker-card__form"
                  onSubmit={handleCheckPincode}
                >
                  <div className="pincode-input-wrapper">
                    <RiMapPinLine
                      className="pincode-input-icon"
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      maxLength={6}
                      inputMode="numeric"
                      pattern="\d*"
                      className="pincode-input"
                      placeholder="Enter your pincode"
                      value={pincode}
                      disabled={isCheckingPincode}
                      onChange={(e) => setPincode(e.target.value)}
                    />
                    {pincode && (
                      <button
                        type="button"
                        className="pincode-clear-btn"
                        aria-label="Clear pincode"
                        disabled={isCheckingPincode}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setPincode('')}
                      >
                        <RiCloseLine />
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="delivery-checker-card__check-btn"
                    disabled={isCheckingPincode}
                  >
                    {isCheckingPincode ? 'Checking...' : 'Check'}
                  </button>
                </form>

                {deliveryError && (
                  <p className="delivery-checker-card__helper delivery-checker-card__helper--error mb-0">
                    {deliveryError}
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="delivery-checker-card__header">
                  <h4 className="mb-0">
                    {isDeliverySuccess
                      ? `Estimated Delivery To ${pincode}`
                      : 'Oops!'}
                  </h4>
                </div>

                <div className="delivery-checker-card__result">
                  <div
                    className="delivery-checker-card__result-left d-flex align-items-center"
                    style={{ gap: '12px' }}
                  >
                    <RiSearchLine
                      className={isDeliverySuccess ? 'success' : 'failure'}
                      style={{ fontSize: '1.5rem' }}
                    />
                    <div className="delivery-checker-card__result-text">
                      <p className="delivery-checker-card__delivery-date fw-bold mb-0">
                        {deliveryMessage}
                      </p>
                      <p
                        className="delivery-checker-card__delivery-area text-muted mb-0"
                        style={{ fontSize: '0.9em' }}
                      >
                        {pincode}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="delivery-checker-card__change-btn"
                    onClick={resetPincodeCheck}
                  >
                    Change
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}

      <ProductAdditionalInfoAccordion product={product} />

      {isRetailerProduct ? (
        <div className="mobile-product-action-buttons d-lg-none">
          {/* <div className="add-to-cart-box">
            <div className="fs-6 fst-italic text-content">
              <strong>Disclaimer:</strong>{" "}Prescription medicines are displayed for information only. Currently, Online purchase is not available. Please consult a registered medical practitioner before use.
            </div>
          </div> */}
          <div className="add-to-cart-box">
            <div className="fs-6 fst-italic text-content">
              Available to purchase in retail store only,{' '}
              <a
                href="/find-the-store"
                className="theme-color text-decoration-underline"
              >
                click here
              </a>{' '}
              to find retail stores in your area.
            </div>
          </div>
        </div>
      ) : isOutOfStock ? (
        <div className="mobile-product-action-buttons dynamic-checkout d-lg-none">
          <div className="add-to-cart-box">
            <div className="dual-cart-buttons out-of-stock-buttons">
              <button type="button" className="btn-out-of-stock" disabled>
                Out of Stock
              </button>
              <button
                type="button"
                className="btn-notify-me btn-primary"
                onClick={handleNotifyMe}
                disabled={isNotifying}
              >
                {isNotifying ? 'Submitting...' : 'Notify Me'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mobile-cart-promo d-lg-none">
            <div className="mobile-cart-promo__inner">
              {cartCount > 0 && (
                <div className="mobile-cart-promo__view-cart-card">
                  <div className="mobile-cart-promo__view-cart-left">
                    <div className="mobile-cart-promo__thumbnail">
                      <img
                        src={rawCartProducts[0]?.product?.product_thumbnail}
                        alt="product image"
                      />
                    </div>
                    <div className="mobile-cart-promo__view-cart-text">
                      <p className="mobile-cart-promo__view-cart-title mb-0">
                        {cartCount} Item • ₹{payableAmount}
                      </p>
                      <p className="mobile-cart-promo__view-cart-subtitle mb-0">
                        Proceed to complete the payment
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="mobile-cart-promo__view-cart-btn"
                    onClick={handleViewCart}
                  >
                    View Cart
                  </button>
                </div>
              )}

              {payableBeforeDelivery < freeShippingThreshold && (
                <button type="button" className="mobile-cart-promo__banner">
                  <span className="mobile-cart-promo__icon">
                    <img src="/assets/images/gifs/offer.gif" alt="" />
                  </span>
                  <p className="mobile-cart-promo__text mb-0">
                    {`Add items worth ₹${freeShippingThreshold} to get FREE DELIVERY`}
                  </p>
                </button>
              )}
            </div>
          </div>

          <div className="mobile-product-action-buttons dynamic-checkout d-lg-none">
            <div className="add-to-cart-box">
              <div className="dual-cart-buttons">
                <button
                  type="button"
                  className="btn-buy-now"
                  onClick={handleBuyNow}
                  disabled={isCartUpdating || isBuyingNow}
                >
                  <span className="label-full">
                    {isBuyingNow ? <span className="btn-spinner" /> : 'Buy Now'}
                  </span>

                  <span className="label-short">
                    {isBuyingNow ? (
                      <span className="btn-spinner btn-spinner-sm" />
                    ) : (
                      'Buy'
                    )}
                  </span>
                </button>
                {isOpen && !isBook && productQty >= 1 ? (
                  <div
                    className="qty-inline-box"
                    style={{ opacity: isCartUpdating ? 0.6 : 1 }}
                  >
                    <button
                      type="button"
                      className="qty-btn qty-minus"
                      onClick={() => handleQtyChange(-1)}
                      disabled={isCartUpdating}
                    >
                      <RiSubtractLine />
                    </button>
                    <span className="qty-value">{productQty}</span>
                    <button
                      type="button"
                      className="qty-btn qty-plus"
                      onClick={() => handleQtyChange(1)}
                      disabled={isCartUpdating}
                    >
                      <RiAddLine />
                    </button>
                  </div>
                ) : (
                  !isBook && (
                    <button
                      type="button"
                      className="btn-add-cart addcart-button"
                      onClick={handleAddToCart}
                      disabled={isCartUpdating || isBuyingNow}
                    >
                      <span className="label-full">
                        {isCartUpdating ? (
                          <span className="btn-spinner" />
                        ) : (
                          'Add to Cart'
                        )}
                      </span>

                      <span className="label-short">
                        {isCartUpdating ? (
                          <span className="btn-spinner btn-spinner-sm" />
                        ) : (
                          'Add'
                        )}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ProductDetailAction;
