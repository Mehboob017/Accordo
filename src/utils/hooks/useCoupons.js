import { useMutation, useQuery } from '@tanstack/react-query';
import { applyCoupon, fetchCoupons } from '@/api/coupons.api';

export const normalizeCouponItemsFromCart = (cartItems = []) => {
  const safeItems = Array.isArray(cartItems) ? cartItems : [];

  return safeItems
    .map((item) => {
      const variantUid =
        item?.variation_id ||
        item?.variation?.id ||
        item?.variation?.uid ||
        item?.variantUid ||
        '';
      const parsedQuantity = Number(item?.quantity || 1);
      const quantity = Number.isFinite(parsedQuantity)
        ? Math.max(1, Math.floor(parsedQuantity))
        : 1;

      return {
        variantUid: String(variantUid || '').trim(),
        quantity,
      };
    })
    .filter((item) => item.variantUid);
};

export const resolveAppliedCouponIdentifier = (
  response = {},
  fallbackIdentifier = ''
) => {
  const candidates = [
    response?.data?.couponIdentifier,
    response?.data?.coupon?.name,
    response?.data?.coupon?.code,
    response?.couponIdentifier,
    fallbackIdentifier,
  ];

  const resolvedIdentifier = candidates.find(
    (value) => typeof value === 'string' && value.trim()
  );

  return resolvedIdentifier ? resolvedIdentifier.trim() : '';
};

export const resolveAppliedCouponUid = (response = {}, fallbackUid = '') => {
  const candidates = [
    response?.data?.couponUid,
    response?.data?.coupon?.uid,
    response?.data?.uid,
    response?.couponUid,
    fallbackUid,
  ];

  const resolvedUid = candidates.find(
    (value) => typeof value === 'string' && value.trim()
  );

  return resolvedUid ? resolvedUid.trim() : '';
};

export const resolveAppliedCouponDiscountAmount = (
  response = {},
  fallbackAmount = 0
) => {
  const candidates = [
    response?.data?.couponDiscountAmount,
    response?.couponDiscountAmount,
    fallbackAmount,
  ];

  const resolvedValue = candidates.find((value) => Number.isFinite(Number(value)));

  if (!Number.isFinite(Number(resolvedValue))) {
    return 0;
  }

  return Math.max(0, Number(resolvedValue));
};

export const useCoupons = (params = {}, options = {}) => {
  const normalizedItems = normalizeCouponItemsFromCart(params?.items);

  return useQuery({
    queryKey: ['coupons', 'available', normalizedItems],
    queryFn: () => fetchCoupons({ items: normalizedItems }),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    ...options,
  });
};

export const useApplyCoupon = (options = {}) => {
  return useMutation({
    mutationKey: ['coupons', 'apply'],
    mutationFn: (payload) => applyCoupon(payload),
    ...options,
  });
};
