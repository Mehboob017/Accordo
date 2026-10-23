import React, { useContext, useEffect, useMemo, useState } from 'react';
import CartContext from '@/helper/cartContext';
import VariationModal from './variationModal/index';
import { RiAddLine, RiSubtractLine } from 'react-icons/ri';
import { useRouter } from 'next/navigation';
import { ToastNotification } from '@/utils/customFunctions/ToastNotification';
import { CUSTOMER_TYPES, getProductCustomerType } from '@/utils/cart/cartUtils';
import { setCheckoutRequest } from '@/api/checkout.api';
import { notifyProductAvailability } from '@/api/orders.api';
import { trackMetaEvent } from '@/utils/metaPixel';

const ProductBox1Cart = ({
  productObj,
  showBuyNow = true,
  shouldShowPricing = false,
  displayPrices,
  isDoctorProduct,
  isVerifiedDoctor
}) => {
  const {
    // cartProducts,
    rawCartProducts,
    handleIncDec,
    addToCartMutation,
    removeFromCartMutation,
  } = useContext(CartContext);
  const [variationModal, setVariationModal] = useState('');
  const [productQty, setProductQty] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const router = useRouter();
  const customerType = getProductCustomerType(productObj);
  const isRetailerProduct = customerType === CUSTOMER_TYPES.RETAILER;
  const isCartUpdating =
    Boolean(addToCartMutation?.isPending) ||
    Boolean(removeFromCartMutation?.isPending);
  const departmentName = productObj?.department?.name;
  const isBook = departmentName === "Books";

  const getVariantUid = (v) =>
    v?.uid ?? v?.id ?? v?.variation_id ?? v?.variationId ?? v?._id ?? null;

  const getStockQuantity = (item) => {
    const parsedQuantity = Number(
      item?.stockQty ??
      item?.variant?.stockQty ??
      item?.variation?.quantity ??
      item?.quantity
    );

    return Number.isFinite(parsedQuantity) ? Math.max(0, parsedQuantity) : null;
  };

  const hasStockQuantity = (...items) => {
    return items.some((item) => {
      const quantity = getStockQuantity(item);

      return quantity !== null && quantity >= 1;
    });
  };

  const modalVariations = Array.isArray(productObj?.variations)
    ? productObj.variations
    : [];
  const fallbackVariants = Array.isArray(productObj?.productVariants)
    ? productObj.productVariants
    : [];
  // Prefer `variations` since the modal itself also relies on it.
  const variantList =
    modalVariations.length > 0 ? modalVariations : fallbackVariants;

  const cartVariants = productObj?.productVariants ?? [];

  const singleVariant = cartVariants.length === 1 ? cartVariants[0] : null;

  const shouldUseVariationModal = useMemo(() => {
    if (!productObj) return false;
    // Classified products may still need the modal for ProductAttribute selection
    // when there are no `variations` available.
    if (productObj?.type === 'classified') {
      if (
        Array.isArray(productObj?.variations) &&
        productObj.variations.length > 0
      ) {
        return productObj.variations.length > 1;
      }
      return true;
    }

    // For normal variable products: open modal only when there are multiple variants.
    return (variantList?.length ?? 0) > 1;
  }, [productObj, variantList]);

  const productUid = productObj?.uid ?? null;
  const displayedVariantUid =
    !shouldUseVariationModal && singleVariant
      ? getVariantUid(singleVariant)
      : null;

  const getSelectedVariant = useMemo(() => {
    const items = rawCartProducts || [];

    if (!productUid) {
      return null;
    }

    if (shouldUseVariationModal) {
      return null;
    }

    return (
      items.find((elem) => {
        const cartProductUid = elem?.productUid ?? elem?.product_id;
        const cartVariantUid = elem?.variantUid ?? elem?.variation_id;

        if (String(cartProductUid) !== String(productUid)) {
          return false;
        }

        if (displayedVariantUid != null) {
          return String(cartVariantUid ?? '') === String(displayedVariantUid);
        }

        return true;
      }) ?? null
    );
  }, [
    displayedVariantUid,
    productUid,
    rawCartProducts,
    shouldUseVariationModal,
  ]);

  // 1. Find ALL cart items that match this Product UID
  const cartItemsForProduct = useMemo(() => {
    const items = rawCartProducts || [];
    if (!productUid) return [];
    return items.filter((elem) => {
      const cartProductUid = elem?.productUid ?? elem?.product_id;
      return String(cartProductUid) === String(productUid);
    });
  }, [rawCartProducts, productUid]);

  // 2. Identify the active variant in the cart (if any)
  const activeCartVariantUid =
    cartItemsForProduct[0]?.variantUid ?? cartItemsForProduct[0]?.variation_id;

  const activeVariantObject = useMemo(() => {
    if (singleVariant) return singleVariant;
    if (!activeCartVariantUid) return null;

    const allVariants = [
      ...(productObj?.variations || []),
      ...(productObj?.productVariants || []),
    ];
    return (
      allVariants.find(
        (v) => String(getVariantUid(v)) === String(activeCartVariantUid)
      ) || null
    );
  }, [singleVariant, activeCartVariantUid, productObj]);

  // 3. Build the cloneVariation so handleIncDec knows WHICH variant to target
  const cloneVariation = activeVariantObject
    ? {
      selectedVariation: activeVariantObject,
      variation_id: getVariantUid(activeVariantObject),
    }
    : null;

  // 4. Update maxAvailableQty to check the active variant
  const maxAvailableQty = useMemo(() => {
    const rawQuantity =
      cartItemsForProduct[0]?.variant?.stockQty ??
      cartItemsForProduct[0]?.variation?.quantity ??
      singleVariant?.stockQty ??
      singleVariant?.quantity ??
      activeVariantObject?.stockQty ??
      activeVariantObject?.quantity ??
      productObj?.stockQty ??
      productObj?.quantity;

    const parsedQuantity = Number(rawQuantity);
    return Number.isFinite(parsedQuantity) ? Math.max(0, parsedQuantity) : null;
  }, [cartItemsForProduct, singleVariant, activeVariantObject, productObj]);

  // const maxAvailableQty = useMemo(() => {
  //   const rawQuantity =
  //     getSelectedVariant?.variant?.stockQty ??
  //     getSelectedVariant?.variation?.quantity ??
  //     singleVariant?.stockQty ??
  //     singleVariant?.quantity ??
  //     productObj?.productVariants?.[0]?.stockQty ??
  //     productObj?.productVariants?.[0]?.quantity ??
  //     productObj?.stockQty ??
  //     productObj?.quantity;

  //   const parsedQuantity = Number(rawQuantity);

  //   return Number.isFinite(parsedQuantity) ? Math.max(0, parsedQuantity) : null;
  // }, [getSelectedVariant, singleVariant, productObj]);

  const selectedOrDefaultVariant =
    getSelectedVariant?.variant ??
    singleVariant ??
    productObj?.productVariants?.[0] ??
    null;
  // const cloneVariation = singleVariant
  //   ? {
  //       selectedVariation: singleVariant,
  //       variation_id: singleVariant.uid,
  //     }
  //   : null;
  const variantStockStatus =
    selectedOrDefaultVariant?.stock_status ?? productObj?.stock_status;
  const variantInStockFlag =
    selectedOrDefaultVariant?.inStockFlag ?? productObj?.inStockFlag;

  const isProductInStock =
    variantStockStatus === 'in_stock' ||
    variantInStockFlag === true ||
    hasStockQuantity(selectedOrDefaultVariant, productObj, ...variantList);

  useEffect(() => {
    if (cartItemsForProduct.length > 0) {
      // Sum the total quantity of this product across all selected variants
      const totalQty = cartItemsForProduct.reduce(
        (sum, item) => sum + Number(item?.qty ?? item?.quantity ?? 0),
        0
      );
      setProductQty(totalQty);
      setIsOpen(totalQty > 0);
    } else {
      setProductQty(0);
      setIsOpen(false);
    }
  }, [cartItemsForProduct]);

  // useEffect(() => {
  //   if (getSelectedVariant) {
  //     const qty = Number(
  //       getSelectedVariant?.qty ?? getSelectedVariant?.quantity ?? 0
  //     );

  //     setProductQty(qty);
  //     setIsOpen(qty > 0);
  //     return;
  //   }

  //   setProductQty(0);
  //   setIsOpen(false);
  // }, [getSelectedVariant]);

  const handleAddToCart = () => {
    if (isProductInStock) {
      if (shouldUseVariationModal) {
        setVariationModal(productObj?.uid);
      } else {
        handleIncDec(
          1,
          productObj,
          productQty,
          setProductQty,
          setIsOpen,
          cloneVariation
        );
      }
    }
  };

  const handleBuyNow = () => {
    if (isProductInStock) {
      if (shouldUseVariationModal) {
        setVariationModal(productObj?.uid);
      } else {
        const checkoutPayload = {
          productUid: productObj?.uid,
          variantUid: getVariantUid(selectedOrDefaultVariant),
          quantity: 1,
        };

        const itemPrice = Number(
          selectedOrDefaultVariant?.sale_price ??
          selectedOrDefaultVariant?.disPrice ??
          selectedOrDefaultVariant?.mrp ??
          productObj?.disPrice ??
          productObj?.mrp ??
          0
        );

        // console.log(
        //   {
        //     content_ids: [checkoutPayload.variantUid || checkoutPayload.productUid].filter(Boolean),
        //     content_type: 'product',
        //     value: itemPrice * checkoutPayload.quantity,
        //     currency: 'INR',
        //     num_items: checkoutPayload.quantity
        //   }
        // )

        trackMetaEvent('InitiateCheckout', {
          content_ids: [checkoutPayload.variantUid || checkoutPayload.productUid].filter(Boolean),
          content_type: 'product',
          value: itemPrice * checkoutPayload.quantity,
          currency: 'INR',
          num_items: checkoutPayload.quantity
        });

        setCheckoutRequest(checkoutPayload);
        router.push('/checkout');
      }
    }
  };

  const handleNotifyMe = async () => {
    const productUidForNotify = productObj?.uid ?? '';
    const variantUidForNotify = getVariantUid(selectedOrDefaultVariant) ?? '';

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

  const handleIncrease = () => {
    // Safety check: If multiple different variants are in the cart, open the modal
    if (shouldUseVariationModal && cartItemsForProduct.length > 1) {
      setVariationModal(productObj?.uid);
      return;
    }

    if (maxAvailableQty !== null && productQty >= maxAvailableQty) {
      ToastNotification(
        'error',
        maxAvailableQty === 0
          ? 'This item is out of stock.'
          : `Only ${maxAvailableQty} item${maxAvailableQty === 1 ? '' : 's'} available.`
      );
      return;
    }

    handleIncDec(
      1,
      productObj,
      productQty,
      setProductQty,
      setIsOpen,
      cloneVariation
    );
  };

  const handleDecrease = () => {
    // Safety check: If multiple different variants are in the cart, open the modal
    if (shouldUseVariationModal && cartItemsForProduct.length > 1) {
      setVariationModal(productObj?.uid);
      return;
    }

    handleIncDec(
      -1,
      productObj,
      productQty,
      setProductQty,
      setIsOpen,
      cloneVariation
    );
  };

  const handleViewDetails = () => {
    if (!productObj?.slug) {
      return;
    }

    router.push(`/products/${productObj.slug}`);
    router.refresh();
    // window.location.href = `/products/${productObj.slug}`;
  };

  // const handleIncrease = () => {
  //   if (maxAvailableQty !== null && productQty >= maxAvailableQty) {
  //     ToastNotification(
  //       'error',
  //       maxAvailableQty === 0
  //         ? 'This item is out of stock.'
  //         : `Only ${maxAvailableQty} item${maxAvailableQty === 1 ? '' : 's'} available.`
  //     );
  //     return;
  //   }

  //   handleIncDec(
  //     1,
  //     productObj,
  //     productQty,
  //     setProductQty,
  //     setIsOpen,
  //     cloneVariation
  //   );
  // };

  return (
    <>
      <div className="add-to-cart-box">
        {isRetailerProduct ? (
          <div className="dual-cart-buttons">
            <button
              className="btn-buy-now w-100 detail-btn"
              onClick={handleViewDetails}
            >
              <span className="label-full">View Details</span>
              <span className="label-short">Details</span>
            </button>
          </div>
        ) : !isProductInStock ? (
          <div className="dual-cart-buttons out-of-stock-buttons">
            <button className="btn-out-of-stock" disabled>
              Out of Stock
            </button>
            <button
              className="btn-notify-me btn-primary"
              onClick={handleNotifyMe}
              disabled={isNotifying}
            >
              {isNotifying ? 'Submitting...' : 'Notify Me'}
            </button>
          </div>
        ) : (
          <div className="dual-cart-buttons">
            {showBuyNow && (
              <button
                className="btn-buy-now"
                onClick={handleBuyNow}
                disabled={isCartUpdating}
              >
                <span className="label-full">
                  {isCartUpdating ? (
                    <span className="btn-spinner" />
                  ) : (
                    'Buy Now'
                  )}
                </span>

                <span className="label-short">
                  {isCartUpdating ? (
                    <span className="btn-spinner btn-spinner-sm" />
                  ) : (
                    'Buy'
                  )}
                </span>
              </button>
            )}

            {/* Add to Cart button OR Quantity controls */}
            {isOpen && !isBook && productQty >= 1 ? (
              <div
                className="qty-inline-box"
                style={{ opacity: isCartUpdating ? 0.6 : 1 }}
              >
                <button
                  type="button"
                  className="qty-btn qty-minus"
                  disabled={isCartUpdating}
                  onClick={handleDecrease}
                >
                  <RiSubtractLine />
                </button>
                <span className="qty-value">{productQty}</span>
                <button
                  type="button"
                  className="qty-btn qty-plus"
                  disabled={isCartUpdating}
                  onClick={handleIncrease}
                >
                  <RiAddLine />
                </button>
              </div>
            ) : (
              !isBook && <button
                className="btn-add-cart addcart-button"
                disabled={isCartUpdating}
                onClick={handleAddToCart}
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
            )}
          </div>
        )}
      </div>
      <VariationModal
        setVariationModal={setVariationModal}
        variationModal={variationModal}
        productObj={productObj}
        shouldShowPricing={shouldShowPricing}
        displayPrices={displayPrices}
        isDoctorProduct={isDoctorProduct}
        isVerifiedDoctor={isVerifiedDoctor}
      />
    </>
  );
};

export default ProductBox1Cart;
