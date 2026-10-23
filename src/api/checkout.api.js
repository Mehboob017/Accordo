import { getAuthHeaders } from '@/api/wishlist.api';

const SDL_BASE_URL = process.env.SDL_BASE_URL || process.env.NEXT_PUBLIC_SDL_BASE_URL;

export const CHECKOUT_REQUEST_STORAGE_KEY = 'checkout-request';

const hasUsableValue = (value) => value !== undefined && value !== null && value !== '';

const pickFirstUsableValue = (values = []) => {
  for (const value of values) {
    if (hasUsableValue(value)) {
      return value;
    }
  }

  return null;
};

const pickUidFromEntity = (entity) => {
  if (!entity || typeof entity !== 'object') {
    return null;
  }

  return pickFirstUsableValue([
    entity?.uid,
    entity?.id,
    entity?.productUid,
    entity?.variantUid,
    entity?.product_id,
    entity?.variation_id,
  ]);
};

const resolveCheckoutProductUid = (params = {}) =>
  pickFirstUsableValue([
    params?.productUid,
    params?.product_id,
    params?.productId,
    pickUidFromEntity(params?.product),
    params?.uid,
    params?.id,
  ]);

const resolveCheckoutVariantUid = (params = {}) =>
  pickFirstUsableValue([
    params?.variantUid,
    params?.variation_id,
    params?.variationId,
    params?.variantId,
    pickUidFromEntity(params?.variant),
    pickUidFromEntity(params?.selectedVariation),
  ]);

const normalizeCheckoutQuantity = (quantity) => {
  const parsedQuantity = Number(quantity);

  if (Number.isFinite(parsedQuantity) && parsedQuantity > 0) {
    return Math.max(1, Math.floor(parsedQuantity));
  }

  return 1;
};

const resolveBooleanFlag = (...values) => {
  for (const value of values) {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      if (value === 1) {
        return true;
      }

      if (value === 0) {
        return false;
      }
    }

    if (typeof value === 'string') {
      const normalizedValue = value.trim().toLowerCase();

      if (normalizedValue === 'true' || normalizedValue === '1') {
        return true;
      }

      if (normalizedValue === 'false' || normalizedValue === '0') {
        return false;
      }
    }
  }

  return false;
};

export const setCheckoutRequest = (params = {}) => {
  if (typeof window === 'undefined') {
    return;
  }

  const productUid = resolveCheckoutProductUid(params);
  const variantUid = resolveCheckoutVariantUid(params);
  const quantity = normalizeCheckoutQuantity(params?.quantity);

  if (!productUid || !variantUid) {
    console.warn('[BuyNowDebug][CheckoutAPI] Clearing checkout request (missing productUid/variantUid):', {
      productUid,
      variantUid,
      quantity: params?.quantity,
      sourcePayload: params,
    });
    sessionStorage.removeItem(CHECKOUT_REQUEST_STORAGE_KEY);
    return;
  }

  const normalizedPayload = {
    productUid,
    variantUid,
    quantity,
  };

  sessionStorage.setItem(
    CHECKOUT_REQUEST_STORAGE_KEY,
    JSON.stringify(normalizedPayload)
  );
};

export const getCheckoutRequest = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedValue = sessionStorage.getItem(CHECKOUT_REQUEST_STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(storedValue);

    const productUid = resolveCheckoutProductUid(parsedValue);
    const variantUid = resolveCheckoutVariantUid(parsedValue);

    if (!productUid || !variantUid) {
      console.warn('[BuyNowDebug][CheckoutAPI] Invalid checkout request found in storage:', parsedValue);
      return null;
    }

    const normalizedPayload = {
      productUid,
      variantUid,
      quantity: normalizeCheckoutQuantity(parsedValue.quantity),
    };

    return normalizedPayload;
  } catch (error) {
    console.error('[BuyNowDebug][CheckoutAPI] Failed to parse checkout request:', error);
    return null;
  }
};

export const clearCheckoutRequest = () => {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.removeItem(CHECKOUT_REQUEST_STORAGE_KEY);
};

const parseResponse = async (response, fallbackMessage) => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || fallbackMessage);
  }

  return payload;
};

const normalizeCheckoutItem = (data = {}, params = {}) => {
  const product = data?.product ?? {};
  const variant = data?.variant ?? {};
  const salePrice = Number(variant?.disPrice ?? variant?.mrp ?? 0);
  const mrp = Number(variant?.mrp ?? salePrice);
  const stockQty = Number(variant?.stockQty ?? 0);
  const inStockFlag = variant?.inStockFlag !== false;
  const quantity = normalizeCheckoutQuantity(params?.quantity);
  const prescriptionRequired = resolveBooleanFlag(
    product?.prescriptionRequired,
    product?.prescription_required,
    product?.isPrescriptionRequired,
    product?.requiresPrescription,
    variant?.prescriptionRequired,
    variant?.prescription_required,
    data?.prescriptionRequired,
    data?.prescription_required
  );

  return {
    id: `${product?.uid || 'product'}-${variant?.uid || 'variant'}`,
    product_id: product?.uid ?? null,
    variation_id: variant?.uid ?? null,
    name: product?.name ?? variant?.name ?? 'Product',
    slug: product?.slug ?? variant?.slug ?? null,
    image: product?.coverImage ?? null,
    price: mrp,
    sale_price: salePrice,
    quantity,
    sub_total: salePrice * quantity,
    customerType: product?.customerType ?? 'doctorAndConsumer',
    product: {
      id: product?.uid ?? null,
      uid: product?.uid ?? null,
      name: product?.name ?? variant?.name ?? 'Product',
      slug: product?.slug ?? variant?.slug ?? null,
      product_thumbnail: product?.coverImage ?? null,
      customerType: product?.customerType ?? 'doctorAndConsumer',
      coinsCount: product?.coinsCount ?? null,
      sale_price: salePrice,
      price: mrp,
      inStockFlag,
      quantity: stockQty,
      prescriptionRequired,
    },
    variation: {
      id: variant?.uid ?? null,
      uid: variant?.uid ?? null,
      name: variant?.name ?? product?.name ?? 'Variant',
      slug: variant?.slug ?? product?.slug ?? null,
      coinsCount: variant?.coinsCount ?? null,
      sale_price: salePrice,
      price: mrp,
      inStockFlag,
      quantity: stockQty,
      variation_image: product?.coverImage ?? null,
      status: variant?.status ?? true,
    },
  };
};

export const fetchCheckout = async (params = {}) => {
  const productUid = resolveCheckoutProductUid(params);
  const variantUid = resolveCheckoutVariantUid(params);

  if (!productUid || !variantUid) {
    throw new Error('Missing checkout product or variant.');
  }

  const response = await fetch(`${SDL_BASE_URL}/checkout`, {
    method: 'POST',
    cache: 'no-store',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      productUid,
      variantUid,
    }),
  });

  const payload = await parseResponse(response, 'Failed to load checkout item');
  const data = payload?.data ?? {};
  const resolvedCoinValue = Number(
    data?.coin_value ?? data?.coinValue ?? data?.coinvalue ?? 1
  );
  const resolvedSuperCoins = Number(
    data?.superCoins ?? data?.super_coins ?? data?.supercoins ?? 0
  );
  const resolvedSlabDiscountPercentage = Number(
    data?.customer?.slab?.discountPercent ?? data?.slabDiscountPercentage ?? 0
  );
  const resolvedSlabMinAmount = Number(
    data?.customer?.slab?.minAmount ??
      data?.slab_min_amount ??
      data?.slabMinAmount ??
      0
  );
  const resolvedOfferDiscountAmount = Number(
    data?.offer_discount_amount ??
      data?.offerDiscountAmount ??
      data?.offer_discount ??
      data?.offerDiscount ??
      0
  );
  const resolvedSlabDiscountAmount = Number(
    data?.slab_discount_amount ??
      data?.slabDiscountAmount ??
      data?.slab_discount ??
      data?.slabDiscount ??
      0
  );

  return {
    ...payload,
    data: {
      ...data,
      checkoutItem: normalizeCheckoutItem(data, params),
      freeShippingThreshold: Number(data?.free_shipping_threshold ?? 500),
      shippingCharge: Number(data?.shipping_charges ?? 50),
      coinValue: Number.isFinite(resolvedCoinValue) ? resolvedCoinValue : 1,
      superCoins: Number.isFinite(resolvedSuperCoins) ? resolvedSuperCoins : 0,
      slabDiscountPercentage: Number.isFinite(resolvedSlabDiscountPercentage)
        ? Math.max(0, resolvedSlabDiscountPercentage)
        : 0,
      slabMinAmount: Number.isFinite(resolvedSlabMinAmount)
        ? Math.max(0, resolvedSlabMinAmount)
        : 0,
      offerDiscountAmount: Number.isFinite(resolvedOfferDiscountAmount)
        ? Math.max(0, resolvedOfferDiscountAmount)
        : 0,
      slabDiscountAmount: Number.isFinite(resolvedSlabDiscountAmount)
        ? Math.max(0, resolvedSlabDiscountAmount)
        : 0,
    },
  };
};

export const placeOrder = async (payload) => {
  // console.log('Placing order with payload:', payload);
  
  const response = await fetch(`${SDL_BASE_URL}/orders`, {
    method: 'POST',
    cache: 'no-store',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  const parsedResponse = await parseResponse(response, 'Failed to place order');

  clearCheckoutRequest();

  return parsedResponse;
};

export const verifyOrderPayment = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  trxUid,
}) => {
  const response = await fetch(`${SDL_BASE_URL}/orders/verify-payment`, {
    method: 'POST',
    cache: 'no-store',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      trxUid,
    }),
  });

  return parseResponse(response, 'Payment verification failed');
};