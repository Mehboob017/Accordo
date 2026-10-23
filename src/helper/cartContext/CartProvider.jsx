'use client';

import React, { useContext, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import CartContext from '.';
import ThemeOptionContext from '../themeOptionsContext';
import UserContext from '../userContext';
import { ToastNotification } from '@/utils/customFunctions/ToastNotification';
import {
  CART_QUERY_KEY,
  useAddToCart,
  useCartQuery,
  useRemoveCartItems,
  useRemoveFromCart,
} from '@/utils/hooks/useCart';
import {
  getCartItemAvailableQuantity,
  getCartItemQuantity,
  groupCartItemsByCustomerType,
  isDoctorUser,
  partitionCartItemsByAccess,
} from '@/utils/cart/cartUtils';
import { usePathname } from 'next/navigation';
import { trackMetaEvent } from '@/utils/metaPixel';

const showServerToast = (type, payload, fallbackMessage) => {
  const message = payload?.message || fallbackMessage;

  if (message) {
    ToastNotification(type, message);
  }
};

const getProductId = (value) =>
  value?.product?.uid ?? value?.uid ?? value?.product_id ?? value?.id ?? null;

const getVariantId = (value) =>
  value?.selectedVariation?.uid ??
  value?.variation_id ??
  value?.variationId ??
  value?.uid ??
  null;

const showStockLimitToast = (availableQuantity) => {
  if (availableQuantity === 0) {
    ToastNotification('error', 'This item is out of stock.');
    return;
  }

  ToastNotification(
    'error',
    `Only ${availableQuantity} item${availableQuantity === 1 ? '' : 's'} available.`
  );
};

const CartProvider = ({ children }) => {
  const { setCartCanvas } = useContext(ThemeOptionContext);
  const { userData } = useContext(UserContext);
  // const pathname = usePathname();
  const queryClient = useQueryClient();

  // 1. Destructured isSuccess to act as our safety gate
  const { data: cart, isLoading, isSuccess } = useCartQuery();

  // useEffect(() => {
  //   queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
  // }, [pathname, queryClient]);
  // Cart invalidation is handled by mutations (add/remove/update).
  // No need to refetch on every route change.

  const cartValue = cart?.cartValue;
  const signupBonusCoins = cart?.resolvedRegistrationBonusCoins;
  const freeShippingThreshold = cart?.resolvedFreeShippingThreshold;
  const rawCartProducts = cart?.items ?? [];
  const isDoctor = isDoctorUser(userData);

  // 3. Gated heavy logic with isSuccess to prevent unnecessary re-renders
  const { eligibleItems, restrictedItems, outOfStockItems, hiddenItems } =
    useMemo(() => {
      if (!isSuccess) {
        return {
          eligibleItems: [],
          restrictedItems: [],
          outOfStockItems: [],
          hiddenItems: [],
        };
      }
      return partitionCartItemsByAccess(rawCartProducts, isDoctor);
    }, [isDoctor, rawCartProducts, isSuccess]);

  const groupedCartProducts = useMemo(() => {
    if (!isSuccess) return {};
    return groupCartItemsByCustomerType(eligibleItems);
  }, [eligibleItems, isSuccess]);

  const cartProducts = eligibleItems;

  const cartDisplayCount = useMemo(() => {
    if (!isSuccess) return 0;
    return [cartProducts, restrictedItems, outOfStockItems]
      .flat()
      .reduce((sum, item) => sum + getCartItemQuantity(item), 0);
  }, [cartProducts, restrictedItems, outOfStockItems, isSuccess]);

  const cartTotal = cartProducts.reduce(
    (sum, item) => sum + Number(item?.sub_total ?? 0),
    0
  );

  const cartSummary = {
    subtotal: cartTotal,
    totalItems: cartProducts.reduce(
      (sum, item) => sum + getCartItemQuantity(item),
      0
    ),
  };

  const cartMeta = {
    shippingCharge: Number(cart?.shippingCharge ?? 0),
    coinValue: Number(cart?.coinValue ?? 1),
    superCoins: Number(cart?.superCoins ?? 0),
    slabDiscountPercentage: Number(cart?.slabDiscountPercentage ?? 0),
    slabMinAmount: Number(cart?.slabMinAmount ?? 0),
    offerDiscountAmount: Number(cart?.offerDiscountAmount ?? 0),
    slabDiscountAmount: Number(cart?.slabDiscountAmount ?? 0),
    customer: cart?.customer ?? null,
  };

  const hasInvalidCartItems =
    restrictedItems.length > 0 ||
    outOfStockItems.length > 0 ||
    hiddenItems.length > 0;

  const addToCartMutation = useAddToCart({
    onError: (error) =>
      showServerToast('error', error, 'Failed to add item to cart'),
  });

  const removeFromCartMutation = useRemoveFromCart({
    onSuccess: (response) =>
      showServerToast('success', response, 'Item removed from cart'),
    onError: (error) =>
      showServerToast('error', error, 'Failed to remove item from cart'),
  });

  const removeCartItemsMutation = useRemoveCartItems({
    onSuccess: (response) =>
      showServerToast('success', response, 'Cart items removed'),
    onError: (error) =>
      showServerToast('error', error, 'Failed to remove cart items'),
  });

  const openCartCanvas = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setCartCanvas(true);
    }
  };

  // --- REFACTORED handleIncDec ---
  const handleIncDec = (
    qty,
    productObj,
    currentQty,
    setProductQty,
    setIsOpen,
    cloneVariation,
    shouldOpenCartCanvas = true
  ) => {
    const numericQty = Number(qty) || 0;
    const productUid = getProductId(productObj);
    const variantUid = getVariantId(cloneVariation);

    // console.log('--- [handleIncDec] FLOW INITIATED ---');
    // console.log('[handleIncDec] 1. Request:', {
    //   delta: numericQty,
    //   passedCurrentQty: currentQty,
    //   productUid,
    // });

    if (!numericQty || !productUid) {
      // console.warn('[handleIncDec] ❌ Aborted: Missing quantity or product ID');
      return;
    }

    // Check the actual truth source: The raw cart items
    const existingCartItem = rawCartProducts?.find(
      (item) =>
        String(item?.product_id ?? item?.productUid) === String(productUid) &&
        String(item?.variation_id ?? item?.variantUid ?? null) ===
        String(variantUid ?? null)
    );

    const actualCartQty = existingCartItem
      ? Number(existingCartItem?.quantity ?? existingCartItem?.qty ?? 0)
      : 0;

    // console.log('[handleIncDec] 2. Cart Verification:', {
    //   isInCart: !!existingCartItem,
    //   actualCartQty,
    // });

    // THE FIX: If the item isn't in the cart, force the starting quantity to 0.
    // If it is in the cart, trust the passed local UI state.
    const previousQty =
      actualCartQty === 0
        ? 0
        : Math.max(0, Number(currentQty ?? actualCartQty));

    // console.log('[handleIncDec] 3. Math Execution:', {
    //   previousQty,
    //   delta: numericQty,
    //   expectedResult: previousQty + numericQty,
    // });

    const syncLocalState = (quantity) => {
      // console.log(`[handleIncDec] -> Updating UI Local State to: ${quantity}`);
      if (typeof setProductQty === 'function') setProductQty(quantity);
      if (typeof setIsOpen === 'function') setIsOpen(quantity > 0);
    };

    // HANDLE ADDITION
    if (numericQty > 0) {
      const availableQuantity = getCartItemAvailableQuantity(
        cloneVariation || productObj
      );

      if (availableQuantity !== null && previousQty >= availableQuantity) {
        // console.warn(
        //   `[handleIncDec] ❌ Stock limit reached. Max: ${availableQuantity}`
        // );
        showStockLimitToast(availableQuantity);
        return;
      }

      // console.log('[handleIncDec] 4. Triggering AddToCart API...');
      addToCartMutation.mutate(
        { productUid, variantUid, count: Math.abs(numericQty) },
        {
          onSuccess: () => {
            const finalQty = previousQty + numericQty;

            syncLocalState(finalQty);
            // console.log(
            //   cloneVariation,
            //   productObj,
            //   {
            //     content_ids: [
            //       cloneVariation?.selectedVariation?.uid ||
            //       cloneVariation?.selectedVariation?.skuCode ||
            //       cloneVariation?.uid
            //     ].filter(Boolean),
            //     content_type: 'product',
            //     content_name:
            //       productObj?.product?.name ||
            //       productObj?.name ||
            //       '',
            //     value: Number(
            //       cloneVariation?.selectedVariation?.sale_price ?? cloneVariation?.selectedVariation?.disPrice ?? cloneVariation?.disPrice ?? cloneVariation?.mrp ?? 0
            //     ),
            //     currency: 'INR',
            //   }
            // )

            const itemQty = Math.abs(numericQty) || 1;
            const unitPrice = Number(
              cloneVariation?.selectedVariation?.sale_price ??
              cloneVariation?.selectedVariation?.disPrice ??
              cloneVariation?.disPrice ??
              cloneVariation?.mrp ??
              productObj?.product?.disPrice ??
              productObj?.product?.mrp ??
              0
            );
            const variantIdentifier =
              cloneVariation?.selectedVariation?.uid ||
              cloneVariation?.selectedVariation?.skuCode ||
              cloneVariation?.uid ||
              productUid;

            trackMetaEvent('AddToCart', {
              content_ids: [String(variantIdentifier)].filter(Boolean),
              content_type: 'product',
              content_name:
                productObj?.product?.name ||
                productObj?.name ||
                '',
              content_category:
                productObj?.product?.category?.name ||
                productObj?.category?.name ||
                undefined,
              value: unitPrice * itemQty,
              currency: 'INR',
              num_items: itemQty,
              contents: [
                {
                  id: String(variantIdentifier),
                  quantity: itemQty,
                  item_price: unitPrice,
                },
              ],
            });

            if (shouldOpenCartCanvas) openCartCanvas();
          },
          onError: (error) => {
            console.error('[handleIncDec] ❌ API Add Error:', error);
          },
        }
      );
      return;
    }

    // HANDLE SUBTRACTION
    // console.log('[handleIncDec] 4. Triggering RemoveFromCart API...');
    removeFromCartMutation.mutate(
      { productUid, variantUid, count: Math.abs(numericQty) },
      {
        onSuccess: () => {
          const finalQty = Math.max(0, previousQty + numericQty); // numericQty is negative here
          // console.log(
          //   `[handleIncDec] ✅ API Remove Success. Applying new qty: ${finalQty}`
          // );
          syncLocalState(finalQty);
        },
        onError: (error) => {
          console.error('[handleIncDec] ❌ API Remove Error:', error);
        },
      }
    );
  };

  const removeCart = (productId, cartId) => {
    const item = rawCartProducts.find(
      (entry) =>
        String(entry?.product_id) === String(productId) ||
        (cartId != null && String(entry?.id) === String(cartId))
    );

    if (!item) return;

    removeFromCartMutation.mutate({
      productUid: item.product_id,
      variantUid: item.variation_id ?? null,
      count: Number(item.quantity ?? 1),
    });
  };

  const updateCartQty = (productId, variationId, delta) => {
    const item = rawCartProducts.find(
      (entry) =>
        String(entry?.product_id) === String(productId) &&
        String(entry?.variation_id ?? '') === String(variationId ?? '')
    );

    if (!item) return;

    if (Number(delta) > 0) {
      const availableQuantity = getCartItemAvailableQuantity(item);

      if (
        availableQuantity !== null &&
        Number(item.quantity || 0) >= availableQuantity
      ) {
        showStockLimitToast(availableQuantity);
        return;
      }

      addToCartMutation.mutate({
        productUid: item.product_id,
        variantUid: item.variation_id ?? null,
        count: Number(delta),
      });
      return;
    }

    removeFromCartMutation.mutate({
      productUid: item.product_id,
      variantUid: item.variation_id ?? null,
      count: Math.abs(Number(delta)),
    });
  };

  const getTotal = (products) =>
    (products ?? cartProducts).reduce(
      (sum, item) => sum + Number(item?.sub_total ?? 0),
      0
    );

  const updateCheckoutItemQuantity = (item, delta) => {
    const productId = item?.product_id || item?.product?.id;
    const variationId = item?.variation_id || item?.variation?.id || null;

    if (!productId || !delta) return;

    updateCartQty(productId, variationId, delta);
  };

  const setCartProducts = (nextItems) => {
    const resolvedItems =
      typeof nextItems === 'function' ? nextItems(cartProducts) : nextItems;
    const safeItems = Array.isArray(resolvedItems) ? resolvedItems : [];
    const subtotal = safeItems.reduce(
      (sum, item) => sum + Number(item?.sub_total ?? 0),
      0
    );

    queryClient.setQueryData(CART_QUERY_KEY, (previous = {}) => ({
      ...previous,
      items: safeItems,
      total: subtotal,
      summary: {
        subtotal,
        totalItems: safeItems.reduce(
          (sum, item) => sum + getCartItemQuantity(item),
          0
        ),
      },
    }));
  };

  const setCartTotal = (nextTotal) => {
    queryClient.setQueryData(CART_QUERY_KEY, (previous = {}) => ({
      ...previous,
      total: Number(nextTotal || 0),
      summary: {
        ...(previous?.summary || {}),
        subtotal: Number(nextTotal || 0),
      },
    }));
  };

  const clearCart = () =>
    queryClient.setQueryData(CART_QUERY_KEY, {
      items: [],
      total: 0,
      summary: { subtotal: 0, totalItems: 0 },
    });

  return (
    <CartContext.Provider
      value={{
        cart,
        signupBonusCoins,
        freeShippingThreshold,
        cartProducts,
        rawCartProducts,
        restrictedCartProducts: restrictedItems,
        outOfStockCartProducts: outOfStockItems,
        hiddenCartProducts: hiddenItems,
        groupedCartProducts,
        cartMeta,
        cartDisplayCount,
        hasInvalidCartItems,
        cartTotal,
        cartValue,
        cartSummary,
        isLoading,
        addToCartMutation,
        removeFromCartMutation,
        removeCartItemsMutation,
        handleIncDec,
        removeCart,
        updateCartQty,
        updateCheckoutItemQuantity,
        getTotal,
        setCartProducts,
        setCartTotal,
        clearCart,
        openCartCanvas,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
