import { getAuthHeaders } from '@/api/wishlist.api';

const SDL_BASE_URL = process.env.SDL_BASE_URL || process.env.NEXT_PUBLIC_SDL_BASE_URL;


const parseResponse = async (response, fallbackMessage) => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || fallbackMessage);
  }

  return payload;
};

const normalizeCouponItems = (items = []) => {
  const safeItems = Array.isArray(items) ? items : [];

  return safeItems
    .map((item) => {
      const variantUid = String(item?.variantUid || '').trim();
      const parsedQuantity = Number(item?.quantity || 1);
      const quantity = Number.isFinite(parsedQuantity)
        ? Math.max(1, Math.floor(parsedQuantity))
        : 1;

      return {
        variantUid,
        quantity,
      };
    })
    .filter((item) => item.variantUid);
};

export const fetchCoupons = async (data = {}) => {
  const normalizedItems = normalizeCouponItems(data?.items);

  const response = await fetch(`${SDL_BASE_URL}/coupons/available`, {
    method: 'POST',
    cache: 'no-store',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      items: normalizedItems,
    }),
  });

  const payload = await parseResponse(response, 'Failed to fetch coupons');
  const coupons = Array.isArray(payload?.data) ? payload.data : [];
  const parsedCount = Number(payload?.count);

  return {
    ...payload,
    count: Number.isFinite(parsedCount) ? parsedCount : coupons.length,
    data: coupons,
  };
};

export const applyCoupon = async (payload = {}) => {
  const couponIdentifier = String(payload?.couponIdentifier || '').trim();
  const normalizedItems = normalizeCouponItems(payload?.items);
  const parsedCoinUsed = Number(payload?.coinUsed || 0);
  const coinUsed = Number.isFinite(parsedCoinUsed)
    ? Math.max(0, Math.floor(parsedCoinUsed))
    : 0;

  if (!couponIdentifier) {
    throw new Error('Coupon identifier is required');
  }

  if (!normalizedItems.length) {
    throw new Error('At least one valid cart item is required to apply coupon');
  }

  const response = await fetch(`${SDL_BASE_URL}/coupons/apply`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    credentials: 'include',
    body: JSON.stringify({
      couponIdentifier,
      coinUsed,
      items: normalizedItems,
    }),
  });

  return parseResponse(response, 'Failed to apply coupon');
};
