import { useQuery } from '@tanstack/react-query';
import { fetchAvailableOffers } from '@/api/offers.api';
import { normalizeCouponItemsFromCart } from '@/utils/hooks/useCoupons';

export const useOffers = (params = {}, options = {}) => {
  const normalizedItems = normalizeCouponItemsFromCart(params?.items);
  const parsedCoinUsed = Number(params?.coinUsed ?? 0);
  const coinUsed = Number.isFinite(parsedCoinUsed)
    ? Math.max(0, Math.floor(parsedCoinUsed))
    : 0;

  return useQuery({
    queryKey: ['offers', 'available', normalizedItems, coinUsed],
    queryFn: () =>
      fetchAvailableOffers({
        items: normalizedItems,
        coinUsed,
      }),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...options,
  });
};
