import { getCartItemEarnedSdlCoins } from '@/utils/cart/cartUtils';

export const normalizeCouponCode = (couponCode = '') =>
  String(couponCode || '').trim().toUpperCase();

const clampDiscountAmount = (amount, baseAmount) => {
  const normalizedBaseAmount = Math.max(0, Number(baseAmount) || 0);
  const normalizedAmount = Number(amount);

  if (!Number.isFinite(normalizedAmount)) {
    return 0;
  }

  return Math.max(0, Math.min(normalizedAmount, normalizedBaseAmount));
};

export const getUserSdlCoins = (userData, fallback = 0) => {
  const candidates = [
    userData?.sdl_coins,
    userData?.sdlCoins
  ];

  const found = candidates.find((value) => Number.isFinite(Number(value)));
  const parsed = Number(found);

  if (Number.isFinite(parsed) && parsed >= 0) {
    return Math.floor(parsed);
  }

  return fallback;
};

export const getEffectiveSdlCoins = (metaCoins, userData, fallback = 0) => {
  // console.log({ metaCoins, userData});
  
  const normalizedMetaCoins = Math.max(0, Number(metaCoins) || 0);
  const normalizedUserCoins = Math.max(0, Number(getUserSdlCoins(userData, fallback)) || 0);
  
  return Math.max(normalizedMetaCoins, normalizedUserCoins);
};

export const calculateCheckoutBill = ({
  cartProducts = [],
  appliedCoupon = '',
  slabMinAmount = 0,
  slabDiscountAmount,
  offerDiscountAmount,
  couponDiscountAmount,
  isSuperCoinsApplied = false,
  userSdlCoins = 0,
  coinValue,
  freeShippingThreshold,
  shippingCharge,
  slabDiscountPercentage = 0,
}) => {
  const safeProducts = Array.isArray(cartProducts) ? cartProducts : [];

  const mrpTotal = safeProducts.reduce((sum, item) => {
    const price = item?.variation?.price || item?.product?.price || 0;
    return sum + Number(price) * Number(item?.quantity || 1);
  }, 0);

  const discountedTotal = safeProducts.reduce((sum, item) => {
    const salePrice = item?.variation?.sale_price || item?.product?.sale_price || 0;
    return sum + Number(salePrice) * Number(item?.quantity || 1);
  }, 0);
  
  const earnableSdlCoins = safeProducts.reduce(
    (sum, item) => sum + getCartItemEarnedSdlCoins(item),
    0
  );

  const productDiscount = Math.max(0, mrpTotal - discountedTotal);
  const parsedSlabDiscountAmount = Number(slabDiscountAmount);
  const hasServerSlabDiscount =
    Number.isFinite(parsedSlabDiscountAmount) && parsedSlabDiscountAmount > 0;
  const hasServerOfferDiscount = Number.isFinite(Number(offerDiscountAmount));
  const hasServerCouponDiscount = Number.isFinite(Number(couponDiscountAmount));

  const slabDiscountBase = Math.max(0, discountedTotal);
  const normalizedSlabMinAmount = Math.max(0, Number(slabMinAmount) || 0);
  const normalizedSlabDiscountPercentage = Math.max(
    0,
    Number(slabDiscountPercentage) || 0
  );
  const isSlabEligible = slabDiscountBase > normalizedSlabMinAmount;

  // Pricing sequence: slab => offers => coupons => super coins.
  const slabDiscount = isSlabEligible
    ? hasServerSlabDiscount
      ? clampDiscountAmount(slabDiscountAmount, slabDiscountBase)
      : clampDiscountAmount(
        Number(
          ((slabDiscountBase * normalizedSlabDiscountPercentage) / 100).toFixed(2)
        ),
        slabDiscountBase
      )
    : 0;
  const discountedPriceAfterSlab = Math.max(0, slabDiscountBase - slabDiscount);

  const offerDiscount = hasServerOfferDiscount
    ? clampDiscountAmount(offerDiscountAmount, discountedPriceAfterSlab)
    : 0;
  const discountedPriceAfterOffers = Math.max(
    0,
    discountedPriceAfterSlab - offerDiscount
  );

  const couponDiscount = hasServerCouponDiscount
    ? clampDiscountAmount(couponDiscountAmount, discountedPriceAfterOffers)
    : 0;
  const discountedPriceAfterCoupon = Math.max(
    0,
    discountedPriceAfterOffers - couponDiscount
  );

  const totalItems = safeProducts.reduce(
    (sum, item) => sum + Number(item?.quantity || 0),
    0
  );
  const normalizedCoinBalance = Math.max(0, Number(userSdlCoins) || 0);
  const normalizedCoinValue = Math.max(0, Number(coinValue) || 0);
  const availableCoinDiscount = Math.max(
    0,
    Number((normalizedCoinBalance * normalizedCoinValue).toFixed(2))
  );
  const resolvedShippingCharge =
    discountedTotal >= Number(freeShippingThreshold || 0)
      ? 0
      : Number(shippingCharge || 0);
  const deliveryCharge = 0;
  const maxSuperCoinDiscount = Math.min(
    availableCoinDiscount,
    discountedPriceAfterCoupon
  );
  const canApplySuperCoins =
    totalItems >= 1 && availableCoinDiscount > 0 && maxSuperCoinDiscount > 0;
  const superCoinDiscount = isSuperCoinsApplied && canApplySuperCoins
    ? maxSuperCoinDiscount
    : 0;

  const grandTotalBeforeRoundOff = Number(
    Math.max(
      0,
      discountedPriceAfterCoupon -
        superCoinDiscount +
        resolvedShippingCharge +
        deliveryCharge
    ).toFixed(2)
  );
  const grandTotalDecimalPart =
    grandTotalBeforeRoundOff - Math.floor(grandTotalBeforeRoundOff);
  const roundedGrandTotal =
    grandTotalDecimalPart >= 0.5
      ? Math.ceil(grandTotalBeforeRoundOff)
      : Math.floor(grandTotalBeforeRoundOff);
  const roundOffAmount = Number(
    (roundedGrandTotal - grandTotalBeforeRoundOff).toFixed(2)
  );

  const grandTotal = Math.max(
    0,
    roundedGrandTotal
  );

  return {
    subtotal: Number(discountedTotal.toFixed(2)),
    totalItems,
    mrp: Number(mrpTotal.toFixed(2)),
    itemTotal: Number(mrpTotal.toFixed(2)),
    discountedPrice: Number(discountedTotal.toFixed(2)),
    productDiscount: Number(productDiscount.toFixed(2)),
    slabDiscountPercentage: Number(normalizedSlabDiscountPercentage.toFixed(2)),
    slabDiscount: Number(slabDiscount.toFixed(2)),
    offerDiscount: Number(offerDiscount.toFixed(2)),
    couponDiscount: Number(couponDiscount.toFixed(2)),
    shippingCharge: Number(resolvedShippingCharge.toFixed(2)),
    deliveryCharge: Number(deliveryCharge.toFixed(2)),
    superCoinDiscount: Number(superCoinDiscount.toFixed(2)),
    earnableSdlCoins,
    userSdlCoins: normalizedCoinBalance,
    coinValue: normalizedCoinValue,
    availableCoinDiscount,
    maxSuperCoinDiscount: Number(maxSuperCoinDiscount.toFixed(2)),
    canApplySuperCoins,
    freeShippingThreshold: Number(freeShippingThreshold || 0),
    grandTotalBeforeRoundOff,
    roundOffAmount,
    grandTotal: Number(grandTotal.toFixed(2)),
    appliedCoupon: normalizeCouponCode(appliedCoupon),
  };
};
