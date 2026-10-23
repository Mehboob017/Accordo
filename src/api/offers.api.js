import { getAuthHeaders } from '@/api/wishlist.api';
import { SDL_BASE_URL } from '@/utils/constants';

const parseResponse = async (response, fallbackMessage) => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || fallbackMessage);
  }

  return payload;
};

const normalizeOfferItems = (items = []) => {
  const safeItems = Array.isArray(items) ? items : [];

  return safeItems
    .map((item) => {
      const variantUid = String(item?.variantUid || '').trim();
      const parsedQuantity = Number(item?.quantity ?? 1);
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

export const fetchAvailableOffers = async (payload = {}) => {
  const normalizedItems = normalizeOfferItems(payload?.items);
  const parsedCoinUsed = Number(payload?.coinUsed ?? 0);
  const coinUsed = Number.isFinite(parsedCoinUsed)
    ? Math.max(0, Math.floor(parsedCoinUsed))
    : 0;

  const response = await fetch(`${SDL_BASE_URL}/offers/available`, {
    method: 'POST',
    cache: 'no-store',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      items: normalizedItems,
      coinUsed,
    }),
  });

  const parsedPayload = await parseResponse(response, 'Failed to fetch offers');
  const offers = Array.isArray(parsedPayload?.data) ? parsedPayload.data : [];
  const parsedCount = Number(parsedPayload?.count);

  return {
    ...parsedPayload,
    count: Number.isFinite(parsedCount) ? parsedCount : offers.length,
    data: offers,
  };
};
