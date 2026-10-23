import { getAuthHeaders } from '@/api/wishlist.api';
import { getCartItemCustomerType } from '@/utils/cart/cartUtils';

const SDL_BASE_URL = process.env.SDL_BASE_URL || process.env.NEXT_PUBLIC_SDL_BASE_URL;

const parseResponse = async (response, fallbackMessage) => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || fallbackMessage);
  }

  return payload;
};

const parseSuccessResponse = async (response, fallbackMessage) => {
  const payload = await parseResponse(response, fallbackMessage);

  if (payload?.success === false) {
    throw new Error(payload?.message || fallbackMessage);
  }

  return payload;
};

const normalizeCartItem = (item) => {
  const product = item?.product ?? {};
  const variant = item?.variant ?? null;
  const salePrice = Number(variant?.disPrice ?? variant?.mrp ?? 0);
  const listPrice = Number(variant?.mrp ?? salePrice);
  const stockQty = Number(variant?.stockQty ?? 0);
  const quantity = Number(item?.qty ?? 0);
  const inStockFlag = variant?.inStockFlag ?? false;

  return {
    id: item?.uid ?? null,
    product_id: item?.productUid ?? product?.uid ?? null,
    variation_id: item?.variantUid ?? variant?.uid ?? null,
    customerType: getCartItemCustomerType({ product }),
    quantity,
    sub_total: Number(salePrice * quantity),
    product: {
      id: product?.uid ?? null,
      name: product?.name ?? '',
      slug: product?.slug ?? null,
      product_thumbnail: product?.coverImage ?? null,
      customerType: product?.customerType ?? null,
      sale_price: salePrice,
      price: listPrice,
      inStockFlag,
      quantity: variant?.inStockFlag ? stockQty : 0,
      prescriptionRequired: Boolean(product?.prescriptionRequired),
    },
    variation: variant
      ? {
        id: variant?.uid ?? null,
        name: variant?.name ?? '',
        sale_price: salePrice,
        price: listPrice,
        coinsCount: variant?.coinsCount ?? null,
        inStockFlag,
        quantity: variant?.inStockFlag ? stockQty : 0,
        variation_image: variant?.coverImage ?? product?.coverImage ?? null,
      }
      : null,
  };
};

const normalizePreviewRequestPayload = (payload = {}) => {
  const parsedCoinUsed = Number(payload?.coinUsed ?? 0);
  const normalizedCoinUsed = Number.isFinite(parsedCoinUsed)
    ? Math.max(0, Math.floor(parsedCoinUsed))
    : 0;
  const normalizedPayload = {
    couponCode: String(payload?.couponCode || '').trim(),
    offerUid: String(payload?.offerUid || '').trim(),
    coinUsed: normalizedCoinUsed,
  };

  const buyNow = payload?.buyNow;

  if (buyNow && typeof buyNow === 'object') {
    const productUid = String(buyNow?.productUid || '').trim();
    const variantUid = String(buyNow?.variantUid || '').trim();
    const parsedQty = Number(buyNow?.qty ?? buyNow?.quantity ?? 1);
    const qty = Number.isFinite(parsedQty)
      ? Math.max(1, Math.floor(parsedQty))
      : 1;

    if (productUid && variantUid) {
      normalizedPayload.buyNow = {
        productUid,
        variantUid,
        qty,
      };
    }
  }

  return normalizedPayload;
};

const normalizePreviewCartItem = (item = {}) => {
  const product = item?.product ?? {};
  const variant = item?.variant ?? {};
  const pricing = item?.pricing ?? {};
  const quantity = Number(item?.qty ?? pricing?.quantity ?? 0);
  const salePrice = Number(
    pricing?.snapPrice ?? variant?.disPrice ?? variant?.mrp ?? 0
  );
  const listPrice = Number(pricing?.snapMrp ?? variant?.mrp ?? salePrice);
  const stockQty = Number(variant?.stockQty ?? 0);
  const inStockFlag = variant?.inStockFlag !== false;

  return {
    id: item?.cartUid ?? null,
    cartUid: item?.cartUid ?? null,
    product_id: product?.uid ?? null,
    variation_id: variant?.uid ?? null,
    customerType: getCartItemCustomerType({ product }),
    quantity,
    sub_total: Number(pricing?.subTotal ?? 0),
    corrected: Boolean(item?.corrected),
    pricing: {
      snapMrp: Number(pricing?.snapMrp ?? listPrice),
      snapPrice: Number(pricing?.snapPrice ?? salePrice),
      quantity,
      subTotal: Number(pricing?.subTotal ?? 0),
      slabDiscountAmount: Number(pricing?.slabDiscountAmount ?? 0),
      offerDiscountAmount: Number(pricing?.offerDiscountAmount ?? 0),
      discountCodeAmount: Number(pricing?.discountCodeAmount ?? 0),
      coinDiscount: Number(pricing?.coinDiscount ?? 0),
      payableAmount: Number(pricing?.payableAmount ?? 0),
      coinEarned: Number(pricing?.coinEarned ?? 0),
    },
    product: {
      id: product?.uid ?? null,
      uid: product?.uid ?? null,
      name: product?.name ?? '',
      slug: product?.slug ?? null,
      product_thumbnail: product?.coverImage ?? null,
      customerType: product?.customerType ?? null,
      sale_price: salePrice,
      price: listPrice,
      inStockFlag,
      quantity: inStockFlag ? stockQty : 0,
      prescriptionRequired: Boolean(product?.prescriptionRequired),
    },
    variation: {
      id: variant?.uid ?? null,
      uid: variant?.uid ?? null,
      name: variant?.name ?? '',
      slug: variant?.slug ?? null,
      sale_price: salePrice,
      price: listPrice,
      coinsCount: variant?.coinsCount ?? null,
      inStockFlag,
      quantity: inStockFlag ? stockQty : 0,
      variation_image: product?.coverImage ?? null,
    },
  };
};

const normalizePreviewPricingSummary = ({ data = {}, buyableItems = [] }) => {
  const pricing = data?.pricing ?? {};
  const config = data?.config ?? {};
  const superCoins = data?.superCoins ?? {};
  const slabDiscountPercentage = Number(
    data?.discounts?.slab?.discountPercent ??
    data?.customer?.slab?.discountPercent ??
    0
  );
  const coinValue = Number(superCoins?.coinValue ?? 1);
  const maxUsableDiscountAmount = Number(superCoins?.maxUsable ?? 0);
  const normalizedCoinValue =
    Number.isFinite(coinValue) && coinValue > 0 ? coinValue : 1;
  const normalizedMaxUsableDiscountAmount = Number.isFinite(
    maxUsableDiscountAmount
  )
    ? Math.max(0, maxUsableDiscountAmount)
    : 0;
  const totalItems = (Array.isArray(buyableItems) ? buyableItems : []).reduce(
    (sum, item) => sum + Number(item?.quantity ?? 0),
    0
  );

  return {
    subtotal: Number(pricing?.cartSubtotal ?? 0),
    cartSubtotalExGst: Number(pricing?.cartSubtotalExGst ?? 0),
    totalItems,
    mrp: Number(pricing?.totalMrp ?? 0),
    itemTotal: Number(pricing?.totalMrp ?? 0),
    discountedPrice: Number(pricing?.cartSubtotal ?? 0),
    totalGst: Number(pricing?.totalGst ?? 0),
    productDiscount: Number(pricing?.discountOnMrp ?? 0),
    slabDiscountPercentage: Number.isFinite(slabDiscountPercentage)
      ? Math.max(0, slabDiscountPercentage)
      : 0,
    slabDiscount: Number(pricing?.slabDiscount ?? 0),
    offerDiscount: Number(pricing?.offerDiscount ?? 0),
    couponDiscount: Number(pricing?.couponDiscount ?? 0),
    shippingCharge: Number(pricing?.shippingCharges ?? config?.shippingCharges ?? 0),
    deliveryCharge: 0,
    superCoinDiscount: Number(pricing?.coinDiscount ?? 0),
    earnableSdlCoins: Number(superCoins?.earnableOnOrder ?? 0),
    userSdlCoins: Number(superCoins?.available ?? 0),
    coinValue: normalizedCoinValue,
    availableCoinDiscount: normalizedMaxUsableDiscountAmount,
    maxSuperCoinDiscount: normalizedMaxUsableDiscountAmount,
    canApplySuperCoins: normalizedMaxUsableDiscountAmount > 0,
    freeShippingThreshold: Number(config?.freeShippingThreshold ?? 0),
    grandTotalBeforeRoundOff: Number(
      pricing?.payableAmountExact ?? pricing?.payableAmount ?? 0
    ),
    payableBeforeDelivery: Number(pricing?.payableBeforeDelivery ?? 0),
    roundOffAmount: Number(pricing?.roundingAmount ?? 0),
    grandTotal: Number(pricing?.payableAmount ?? 0),
    appliedCoupon: String(
      data?.discounts?.coupon?.couponCode ??
      data?.discounts?.coupon?.code ??
      ''
    )
      .trim()
      .toUpperCase(),
  };
};

export const fetchCart = async () => {
  const response = await fetch(`${SDL_BASE_URL}/cart?platform=web`, {
    method: 'GET',
    cache: 'no-store',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  const payload = await parseResponse(response, 'Failed to fetch cart');
  const data = payload?.data ?? {};
  // console.log(data);

  const resolvedSlabDiscountPercentage = Number(
    data?.customer?.slab?.discountPercent ?? 0
  );
  const resolvedSlabMinAmount = Number(
    data?.customer?.slab?.minAmount ??
    data?.slab_min_amount ??
    data?.slabMinAmount ??
    0
  );
  const items = Array.isArray(data?.items) ? data.items.map(normalizeCartItem) : [];
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item?.sub_total ?? 0),
    0
  );
  const totalItems = items.reduce(
    (sum, item) => sum + Number(item?.quantity ?? 0),
    0
  );
  const resolvedCartValue = data?.cartCount ?? null;
  const resolvedCoinValue = Number(
    data?.coin_value ?? 0
  );
  const resolvedSuperCoins = Number(
    data?.superCoins ?? 0
  );
  const resolvedShippingCharge = Number(
    data?.shipping_charges ?? 0
  );
  const resolvedRegistrationBonusCoins = Number(
    data?.REGISTRATION_BONUS_COINS ?? 0
  );
  const resolvedFreeShippingThreshold = Number(
    data?.freeThreshold ?? 0
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
    items,
    resolvedRegistrationBonusCoins,
    resolvedFreeShippingThreshold,
    total: Number(subtotal ?? 0),
    summary: {
      subtotal: Number(subtotal ?? 0),
      totalItems: Number(totalItems ?? 0),
    },
    shippingCharge: Number.isFinite(resolvedShippingCharge) ? resolvedShippingCharge : 0,
    coinValue: Number.isFinite(resolvedCoinValue) ? resolvedCoinValue : 0,
    superCoins: Number.isFinite(resolvedSuperCoins) ? resolvedSuperCoins : 0,
    cartValue: resolvedCartValue,
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
    customer: data?.customer ?? null,
    theme: data?.theme ?? null,
  };
};

export const fetchCartPreview = async (payload = {}) => {
  const body = normalizePreviewRequestPayload(payload);
  const response = await fetch(`${SDL_BASE_URL}/preview?platform=web`, {
    method: 'POST',
    cache: 'no-store',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
  });

  const parsedResponse = await parseSuccessResponse(
    response,
    'Failed to load cart preview'
  );
  const data = parsedResponse?.data ?? {};
  const buyableItems = Array.isArray(data?.items?.buyable)
    ? data.items.buyable.map(normalizePreviewCartItem)
    : [];
  const outOfStockItems = Array.isArray(data?.items?.outOfStock)
    ? data.items.outOfStock.map(normalizePreviewCartItem)
    : [];
  const unavailableItems = Array.isArray(data?.items?.unavailable)
    ? data.items.unavailable.map(normalizePreviewCartItem)
    : [];

  return {
    ...parsedResponse,
    request: body,
    data: {
      ...data,
      items: {
        buyable: buyableItems,
        outOfStock: outOfStockItems,
        unavailable: unavailableItems,
      },
      summary: normalizePreviewPricingSummary({
        data,
        buyableItems,
      }),
    },
  };
};

export const addToCart = async ({ productUid, variantUid }) => {
  if (!productUid || !variantUid) {
    throw new Error('productUid and variantUid are required');
  }

  const response = await fetch(`${SDL_BASE_URL}/add-to-cart?platform=web`, {
    method: 'POST',
    cache: 'no-store',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      productUid,
      ...(variantUid ? { variantUid } : {}),
    }),
  });

  return parseResponse(response, 'Failed to add item to cart');
};

export const removeFromCart = async ({ productUid, variantUid }) => {
  if (!productUid || !variantUid) {
    throw new Error('productUid and variantUid are required');
  }

  const response = await fetch(`${SDL_BASE_URL}/remove-from-cart?platform=web`, {
    method: 'POST',
    cache: 'no-store',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      productUid,
      ...(variantUid ? { variantUid } : {}),
    }),
  });

  return parseResponse(response, 'Failed to remove item from cart');
};

export const removeCartItems = async ({ productUids = [] }) => {
  const normalizedProductUids = Array.from(
    new Set((Array.isArray(productUids) ? productUids : []).filter(Boolean))
  );

  if (normalizedProductUids.length === 0) {
    throw new Error('productUids are required');
  }

  const response = await fetch(`${SDL_BASE_URL}/remove-cart-items?platform=web`, {
    method: 'POST',
    cache: 'no-store',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ productUids: normalizedProductUids }),
  });

  return parseResponse(response, 'Failed to remove restricted cart items');
};