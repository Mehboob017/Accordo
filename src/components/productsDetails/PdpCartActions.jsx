'use client';

import { useContext, useEffect, useMemo, useState } from 'react';
import { RiAddLine, RiSubtractLine } from 'react-icons/ri';
import Btn from '@/elements/buttons/Btn';
import CartContext from '@/helper/cartContext';
import { useRouter } from 'next/navigation';
import ResponsiveModal from '@/components/common/ResponsiveModal';
import { setCheckoutRequest } from '@/api/checkout.api';
import { ToastNotification } from '@/utils/customFunctions/ToastNotification';
import { CUSTOMER_TYPES, getProductCustomerType } from '@/utils/cart/cartUtils';
import { trackMetaEvent } from '@/utils/metaPixel';

/**
 * Cart actions panel for the new PDP (/products/[slug]).
 * Consumes raw camelCase API fields — does NOT rely on normalizeProduct output.
 *
 * When calling CartContext functions, a minimal cart-compatible product object
 * is constructed (adding id: product.uid) so existing cart infrastructure works.
 */
const PdpCartActions = ({ productState, setProductState }) => {
  const router = useRouter();
  const {
    cartProducts,
    rawCartProducts,
    handleIncDec,
    addToCartMutation,
    removeFromCartMutation,
  } = useContext(CartContext);

  const [productQty, setProductQty] = useState(productState?.productQty || 1);
  const [isOpen, setIsOpen] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const product = productState?.product || {};
  const selectedVariation = productState?.selectedVariation;
  const customerType = getProductCustomerType(product);
  const isRetailerProduct = customerType === CUSTOMER_TYPES.RETAILER;
  const isCartUpdating =
    Boolean(addToCartMutation?.isPending) ||
    Boolean(removeFromCartMutation?.isPending);
  const departmentName = productState?.product?.department?.name;
  const isBook = departmentName === 'Books';

  // console.log('productState', productState)

  // CartContext expects product.id — provide uid as id
  const cartCompatibleProduct = useMemo(
    () => ({ ...product, id: product.uid }),
    [product]
  );

  const getSelectedVariationId = (variation) =>
    variation?.uid ??
    variation?.id ??
    variation?.variation_id ??
    variation?.variationId ??
    null;

  // For cart lookups, variation id is usually `uid` in raw data
  const selectedVariationId = getSelectedVariationId(selectedVariation);

  const cartLineForProduct = useMemo(() => {
    if (!rawCartProducts?.length || !product.uid) return null;

    const byProduct = (item) =>
      String(item?.product_id) === String(product.uid);

    // If a variation is selected, only treat that exact variation as "in cart".
    if (selectedVariationId) {
      return (
        rawCartProducts.find(
          (item) =>
            byProduct(item) &&
            String(item?.variation_id) === String(selectedVariationId)
        ) ?? null
      );
    }

    // No variation selected: only match non-variant cart lines.
    return (
      rawCartProducts.find((item) => byProduct(item) && !item?.variation_id) ??
      null
    );
  }, [rawCartProducts, product.uid, selectedVariationId]);

  const maxAvailableQty = useMemo(() => {
    const rawQuantity =
      cartLineForProduct?.variation?.quantity ??
      cartLineForProduct?.product?.quantity ??
      selectedVariation?.stockQty ??
      selectedVariation?.quantity ??
      product?.productVariants?.[0]?.stockQty ??
      product?.productVariants?.[0]?.quantity ??
      product?.quantity;
    const parsedQuantity = Number(rawQuantity);

    return Number.isFinite(parsedQuantity) ? Math.max(0, parsedQuantity) : null;
  }, [cartLineForProduct, selectedVariation, product]);

  const hasStockQuantity =
    Number.isFinite(Number(maxAvailableQty)) && Number(maxAvailableQty) >= 1;
  const hasInStockFlag = Boolean(
    selectedVariation?.inStockFlag ??
    product.productVariants?.[0]?.inStockFlag ??
    false
  );
  const isOutOfStock = !(hasInStockFlag || hasStockQuantity);

  useEffect(() => {
    if (cartLineForProduct) {
      setProductQty(cartLineForProduct.quantity || 1);
      setIsOpen(true);
      setProductState((prev) => ({
        ...prev,
        productQty: cartLineForProduct.quantity || 1,
      }));
    } else {
      setIsOpen(false);
      setProductQty(1);
      setProductState((prev) => ({ ...prev, productQty: 1 }));
    }
  }, [cartLineForProduct, selectedVariationId, setProductState]);

  // Build cart-compatible productState for CartContext calls
  const cartCompatibleState = useMemo(() => {
    const cartVariation = selectedVariation
      ? {
        ...selectedVariation,
        id: selectedVariation.uid,
        sale_price: selectedVariation.disPrice,
        price: selectedVariation.mrp,
      }
      : null;
    return {
      ...productState,
      product: cartCompatibleProduct,
      selectedVariation: cartVariation,
    };
  }, [productState, cartCompatibleProduct, selectedVariation]);

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    if (maxAvailableQty !== null && productQty > maxAvailableQty) {
      // console.log({
      //   maxAvailableQty,
      //   productQty,
      // });
      ToastNotification(
        'error',
        maxAvailableQty === 0
          ? 'This item is out of stock.'
          : `Only ${maxAvailableQty} item${maxAvailableQty === 1 ? '' : 's'} available.`
      );
      return;
    }

    const nextQty = productQty > 0 ? productQty : 1;
    handleIncDec(
      1,
      cartCompatibleProduct,
      nextQty,
      setProductQty,
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
      productUid: product.uid,
      variantUid: selectedVariationId ?? product.productVariants?.[0]?.uid,
      quantity: nextQty,
    };

    const itemPrice = Number(
      cartCompatibleState?.selectedVariation?.sale_price ??
      cartCompatibleState?.selectedVariation?.disPrice ??
      cartCompatibleState?.selectedVariation?.mrp ??
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

  const handleQtyChange = (delta) => {
    if (
      delta > 0 &&
      maxAvailableQty !== null &&
      productQty >= maxAvailableQty
    ) {
      ToastNotification(
        'error',
        maxAvailableQty === 0
          ? 'This item is out of stock.'
          : `Only ${maxAvailableQty} item${maxAvailableQty === 1 ? '' : 's'} available.`
      );
      return;
    }

    const nextQty = Math.max(1, (productQty || 1) + delta);
    handleIncDec(
      delta,
      cartCompatibleProduct,
      productQty,
      setProductQty,
      setIsOpen,
      cartCompatibleState,
      false
    );
  };

  return (
    <>
      <div className="add-to-cart-box d-none d-lg-flex">
        {isRetailerProduct ? (
          <div className="fs-6 fst-italic text-content w-100">
            Available to purchase in retail store only,{' '}
            <a
              href="/find-the-store"
              className="theme-color text-decoration-underline"
            >
              click here
            </a>{' '}
            to find retail stores in your area.
          </div>
        ) : isOutOfStock ? (
          <Btn className="btn-out-of-stock w-100" disabled>
            Out of Stock
          </Btn>
        ) : (
          <div className="dual-cart-buttons dynamic-checkout d-none d-lg-flex">
            <Btn
              className="btn-buy-now btn btn-md scroll-button"
              onClick={handleBuyNow}
              // title={isBuyingNow ? 'Loading...' : 'Buy Now'}
              disabled={isCartUpdating || isBuyingNow}
            >
              {isBuyingNow ? <span className="btn-spinner" /> : 'Buy Now'}
            </Btn>

            {isOpen && !isBook && productQty >= 1 ? (
              <div
                className="qty-inline-box"
                style={{ opacity: isCartUpdating ? 0.6 : 1 }}
              >
                <Btn
                  type="button"
                  className="qty-btn qty-minus"
                  onClick={() => handleQtyChange(-1)}
                  disabled={isCartUpdating}
                >
                  <RiSubtractLine />
                </Btn>
                <span className="qty-value">{productQty}</span>
                <Btn
                  type="button"
                  className="qty-btn qty-plus"
                  onClick={() => handleQtyChange(1)}
                  disabled={isCartUpdating}
                >
                  <RiAddLine />
                </Btn>
              </div>
            ) : (
              !isBook && (
                <Btn
                  color="primary"
                  className="btn-add-cart addcart-button shimmer"
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
                </Btn>
              )
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default PdpCartActions;
