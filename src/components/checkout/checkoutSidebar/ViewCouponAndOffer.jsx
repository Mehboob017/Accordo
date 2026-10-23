import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import ResponsiveModal from '@/components/common/ResponsiveModal';
import {
  RiAddLine,
  RiArrowRightSLine,
  RiCheckLine,
  RiFileCopyLine,
  RiSubtractLine,
} from 'react-icons/ri';
import { ToastNotification } from '@/utils/customFunctions/ToastNotification';
import {
  normalizeCouponItemsFromCart,
  resolveAppliedCouponDiscountAmount,
  resolveAppliedCouponUid,
  resolveAppliedCouponIdentifier,
  useCoupons,
  useApplyCoupon,
} from '@/utils/hooks/useCoupons';
import { useOffers } from '@/utils/hooks/useOffers';
import styles from './ViewCouponAndOffer.module.scss';
import { placeHolderImage } from '@/data/CommonPath';
import Confetti from 'react-confetti-boom';
import { IoClose } from 'react-icons/io5';

const TAB_KEYS = {
  COUPONS: 'coupons',
  OFFERS: 'offers',
};
const EMPTY_ARRAY = [];
const clampRatio = (value) => Math.min(1, Math.max(0, value));

const formatCurrency = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return '₹0.00';
  }

  return `₹${amount.toFixed(2)}`;
};

const formatDate = (value) => {
  if (!value) {
    return '';
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return parsedDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getCouponCode = (coupon = {}) => String(coupon?.name || '').trim();

const getCouponDiscountLabel = (coupon = {}) => {
  const discountPercent = Number(
    coupon?.discountPercent ?? coupon?.discount_percent
  );
  const discountAmount = Number(
    coupon?.discountAmount ?? coupon?.discount_amount
  );
  const fixedPrice = Number(coupon?.fixedPrice ?? coupon?.fixed_price);
  const previewDiscount = Number(
    coupon?.previewDiscountAmount ?? coupon?.preview_discount_amount
  );

  if (Number.isFinite(discountPercent) && discountPercent > 0) {
    return `Up to ${discountPercent}% off`;
  }

  if (Number.isFinite(discountAmount) && discountAmount > 0) {
    return `Save up to ${formatCurrency(discountAmount)}`;
  }

  if (Number.isFinite(fixedPrice) && fixedPrice > 0) {
    return `Special price ${formatCurrency(fixedPrice)}`;
  }

  if (Number.isFinite(previewDiscount) && previewDiscount > 0) {
    return `Save up to ${formatCurrency(previewDiscount)}`;
  }

  return 'Special savings available';
};

const getOfferBenefit = (offer = {}) => {
  const rewardType = String(offer?.rewardType || '')
    .trim()
    .toUpperCase();
  const discountPercent = Number(offer?.discountPercent);
  const discountAmount = Number(offer?.discountAmount);
  const fixedPrice = Number(offer?.fixedPrice);
  const previewDiscountAmount = Number(offer?.previewDiscountAmount);
  const rewardQty = Number(offer?.rewardQty);

  if (
    rewardType === 'DISCOUNT_PERCENT' &&
    Number.isFinite(discountPercent) &&
    discountPercent > 0
  ) {
    return `Get up to ${discountPercent}% off`;
  }

  if (
    rewardType === 'DISCOUNT_AMOUNT' &&
    Number.isFinite(discountAmount) &&
    discountAmount > 0
  ) {
    return `Get up to ${formatCurrency(discountAmount)} off`;
  }

  if (
    rewardType === 'FIXED_PRICE' &&
    Number.isFinite(fixedPrice) &&
    fixedPrice > 0
  ) {
    return `Get this at ${formatCurrency(fixedPrice)}`;
  }

  if (rewardType === 'FREE_PRODUCT') {
    if (Number.isFinite(rewardQty) && rewardQty > 0) {
      return `Get ${rewardQty} free product${rewardQty > 1 ? 's' : ''}`;
    }

    return 'Get a free product reward';
  }

  if (Number.isFinite(previewDiscountAmount) && previewDiscountAmount > 0) {
    return `Estimated saving ${formatCurrency(previewDiscountAmount)}`;
  }

  return 'Offer benefit available on eligible cart';
};

const getOfferConditions = (offer = {}) => {
  const minQty = Number(offer?.minQty);
  const minCartValue = Number(offer?.minCartValue);
  const conditions = [];

  if (Number.isFinite(minQty) && minQty > 0) {
    conditions.push(`Min ${minQty} item${minQty > 1 ? 's' : ''}`);
  }

  if (Number.isFinite(minCartValue) && minCartValue > 0) {
    conditions.push(`Cart value ${formatCurrency(minCartValue)}+`);
  }

  if (!conditions.length) {
    return 'No minimum conditions';
  }

  return conditions.join(' • ');
};

const getFreeProductOptionLabel = (option = {}) => {
  const productName = String(option?.productName || '').trim();
  const variantName = String(option?.variantName || '').trim();

  if (productName && variantName) {
    return `${productName} (${variantName})`;
  }

  return productName || variantName || '';
};

const resolveFreeProductImage = (option = {}) => {
  const image = String(option?.productImage || '').trim();
  return image || placeHolderImage;
};

const getFreeOptionVariantUid = (option = {}) =>
  String(option?.variantUid || '').trim();

export default function ViewCouponAndOffer({
  appliedCoupon = '',
  appliedCouponUid = '',
  appliedOffer = null,
  appliedOfferUid = '',
  previewDiscounts = null,
  cartItems = [],
  coinUsed = 0,
  isAuthenticated = false,
  onRequireLogin,
  onApplyCoupon,
  onRemoveCoupon,
  onApplyOffer,
  onRemoveOffer,
  onFreeItemsChange,
  onCouponApplyingChange,
  showSelectedFreeProducts = true,
  isLoading = false,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(TAB_KEYS.OFFERS);
  const [couponInput, setCouponInput] = useState('');
  const [copiedCouponCode, setCopiedCouponCode] = useState('');
  const [modalErrorMessage, setModalErrorMessage] = useState('');
  const [expandedCouponKeys, setExpandedCouponKeys] = useState(new Set());
  const [expandedOfferKeys, setExpandedOfferKeys] = useState(new Set());
  const [showCouponPulse, setShowCouponPulse] = useState(false);
  const [showOfferPulse, setShowOfferPulse] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiBurstKey, setConfettiBurstKey] = useState(0);
  const [confettiPlacement, setConfettiPlacement] = useState({
    originX: 0.5,
    originY: 0.2,
    style: {
      width: '100vw',
      height: '100vh',
      transform: 'translate3d(0, 0, 0)',
    },
  });
  const [dismissedAutoOfferUid, setDismissedAutoOfferUid] = useState('');
  const [selectedFreeVariantUids, setSelectedFreeVariantUids] = useState([]);
  const [selectedFreeOptionCache, setSelectedFreeOptionCache] = useState({});
  const previousCouponRef = useRef('');
  const previousOfferUidRef = useRef('');
  const copyTimerRef = useRef(null);
  const confettiTimerRef = useRef(null);
  const rootRef = useRef(null);
  const onFreeItemsChangeRef = useRef(onFreeItemsChange);
  const lastFreeItemsSignatureRef = useRef('');
  const applyCouponMutation = useApplyCoupon();
  const normalizedItems = useMemo(
    () => normalizeCouponItemsFromCart(cartItems),
    [cartItems]
  );
  const shouldFetchListData = isModalOpen && normalizedItems.length > 0;
  const {
    data: couponsResponse,
    isLoading: isCouponsLoading,
    isFetching: isCouponsFetching,
    error: couponsError,
  } = useCoupons(
    { items: normalizedItems },
    {
      enabled: shouldFetchListData,
      keepPreviousData: true,
    }
  );
  const {
    data: offersResponse,
    isLoading: isOffersLoading,
    isFetching: isOffersFetching,
    error: offersError,
  } = useOffers(
    {
      items: normalizedItems,
      coinUsed,
    },
    {
      enabled: shouldFetchListData,
      keepPreviousData: true,
    }
  );

  const isActionLoading = applyCouponMutation.isPending;
  const isCouponListLoading = isCouponsLoading || isCouponsFetching;
  const isOfferListLoading = isOffersLoading || isOffersFetching;
  const resolvedAppliedCouponUid = String(appliedCouponUid || '').trim();
  const resolvedAppliedCouponCode = resolvedAppliedCouponUid
    ? String(appliedCoupon || '')
      .trim()
      .toUpperCase()
    : '';
  const availableCoupons = Array.isArray(couponsResponse?.data)
    ? couponsResponse.data
    : [];
  const availableOffers = (
    Array.isArray(offersResponse?.data) ? offersResponse.data : []
  ).filter((offer) => Boolean(offer?.isApplicable));
  const explicitOfferUid = String(appliedOfferUid || '').trim();
  const previewOfferUid = String(appliedOffer?.uid || '').trim();
  const isAutoAppliedOffer = !explicitOfferUid && Boolean(previewOfferUid);
  const resolvedOfferUid =
    explicitOfferUid ||
    (isAutoAppliedOffer && dismissedAutoOfferUid !== previewOfferUid
      ? previewOfferUid
      : '');
  const hasAppliedOffer = Boolean(resolvedOfferUid);
  const fallbackAppliedOffer =
    availableOffers.find(
      (offer) => String(offer?.uid || '').trim() === resolvedOfferUid
    ) || null;
  const resolvedAppliedOffer =
    hasAppliedOffer && previewOfferUid === resolvedOfferUid
      ? appliedOffer
      : fallbackAppliedOffer;
  const offerName = String(resolvedAppliedOffer?.name || '').trim();
  const offerDiscountAmount = Number(
    hasAppliedOffer
      ? (resolvedAppliedOffer?.discountAmount ??
        resolvedAppliedOffer?.previewDiscountAmount ??
        0)
      : 0
  );
  const cartValueFreeOffers = Array.isArray(
    previewDiscounts?.cartValueFreeOffers
  )
    ? previewDiscounts.cartValueFreeOffers
    : [];

  const matchedCartValueFreeOffer = useMemo(() => {
    if (!cartValueFreeOffers.length || !resolvedOfferUid) {
      return null;
    }

    const matchedOffer = cartValueFreeOffers.find(
      (entry) => String(entry?.offerUid || '').trim() === resolvedOfferUid
    );

    return matchedOffer || null;
  }, [cartValueFreeOffers, resolvedOfferUid]);

  const remainingFreeProductQty = Number(
    matchedCartValueFreeOffer?.remainingRewardQty ?? 0
  );
  const appliedOfferHasPendingFreeSelection =
    Boolean(resolvedAppliedOffer?.pendingFreeProductSelection) ||
    remainingFreeProductQty > 0;
  const freeProductSelectionNote = String(
    matchedCartValueFreeOffer?.validationNote || ''
  ).trim();
  const freeProductOptions = Array.isArray(
    matchedCartValueFreeOffer?.freeProductOptions
  )
    ? matchedCartValueFreeOffer.freeProductOptions
    : EMPTY_ARRAY;

  const freeProductSelectionLimit = useMemo(() => {
    const parsedRewardQty = Number(matchedCartValueFreeOffer?.rewardQty);

    if (Number.isFinite(parsedRewardQty) && parsedRewardQty > 0) {
      return Math.floor(parsedRewardQty);
    }

    const parsedRemainingQty = Number(
      matchedCartValueFreeOffer?.remainingRewardQty
    );

    if (Number.isFinite(parsedRemainingQty) && parsedRemainingQty > 0) {
      return Math.floor(parsedRemainingQty);
    }

    return 0;
  }, [
    matchedCartValueFreeOffer?.remainingRewardQty,
    matchedCartValueFreeOffer?.rewardQty,
  ]);

  useEffect(() => {
    setSelectedFreeVariantUids((currentUids) => {
      const maxSelection = Math.max(
        0,
        Math.floor(freeProductSelectionLimit || 0)
      );
      return maxSelection > 0
        ? currentUids.slice(0, maxSelection)
        : currentUids;
    });
  }, [freeProductSelectionLimit]);

  useEffect(() => {
    if (!selectedFreeVariantUids.length || !freeProductOptions.length) {
      return;
    }

    setSelectedFreeOptionCache((currentCache) => {
      let hasChanges = false;
      const nextCache = { ...currentCache };

      selectedFreeVariantUids.forEach((uid) => {
        if (nextCache[uid]) {
          return;
        }

        const matchedOption = freeProductOptions.find(
          (option) => getFreeOptionVariantUid(option) === uid
        );

        if (matchedOption) {
          nextCache[uid] = matchedOption;
          hasChanges = true;
        }
      });

      return hasChanges ? nextCache : currentCache;
    });
  }, [freeProductOptions, selectedFreeVariantUids]);

  const selectedFreeProducts = useMemo(
    () =>
      selectedFreeVariantUids
        .map((variantUid) => {
          const liveOption = freeProductOptions.find(
            (option) => getFreeOptionVariantUid(option) === variantUid
          );
          const cachedOption = selectedFreeOptionCache?.[variantUid] || null;
          const option = liveOption || cachedOption;

          if (!option) {
            return null;
          }

          return {
            ...option,
            variantUid,
            quantity: 1,
          };
        })
        .filter(Boolean),
    [freeProductOptions, selectedFreeOptionCache, selectedFreeVariantUids]
  );

  const selectedFreeProductCount = useMemo(
    () =>
      selectedFreeProducts.reduce(
        (total, item) => total + Number(item?.quantity || 0),
        0
      ),
    [selectedFreeProducts]
  );

  const remainingSelectableFreeProductCount =
    freeProductSelectionLimit > 0
      ? Math.max(0, freeProductSelectionLimit - selectedFreeProductCount)
      : Math.max(0, Math.floor(remainingFreeProductQty || 0));

  useEffect(() => {
    onFreeItemsChangeRef.current = onFreeItemsChange;
  }, [onFreeItemsChange]);

  const freeItemsPayload = useMemo(() => {
    if (!hasAppliedOffer) {
      return EMPTY_ARRAY;
    }

    return selectedFreeProducts
      .map((item) => ({
        variantUid: getFreeOptionVariantUid(item),
        quantity: 1,
        productUid: String(item?.productUid || '').trim(),
        productName: String(item?.productName || '').trim(),
        variantName: String(item?.variantName || '').trim(),
        productImage: String(item?.productImage || '').trim(),
        slug: String(item?.slug || '').trim(),
        payableAmount: 0,
      }))
      .filter((item) => Boolean(item?.variantUid));
  }, [hasAppliedOffer, selectedFreeProducts]);

  useEffect(() => {
    const payloadSignature = JSON.stringify(freeItemsPayload);

    if (payloadSignature === lastFreeItemsSignatureRef.current) {
      return;
    }

    lastFreeItemsSignatureRef.current = payloadSignature;

    if (typeof onFreeItemsChangeRef.current === 'function') {
      onFreeItemsChangeRef.current(freeItemsPayload);
    }
  }, [freeItemsPayload]);

  useEffect(() => {
    const updateConfettiPlacement = () => {
      if (!rootRef.current || typeof window === 'undefined') {
        return;
      }

      const rect = rootRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth || 1;
      const viewportHeight = window.innerHeight || 1;
      const originX = clampRatio(
        (rect.left + rect.width * 0.5) / viewportWidth
      );
      const originY = clampRatio((rect.top + 8) / viewportHeight);

      setConfettiPlacement({
        originX,
        originY,
        style: {
          width: `${viewportWidth}px`,
          height: `${viewportHeight}px`,
          transform: `translate3d(${-rect.left}px, ${-rect.top}px, 0)`,
        },
      });
    };

    updateConfettiPlacement();
    window.addEventListener('resize', updateConfettiPlacement);
    window.addEventListener('scroll', updateConfettiPlacement, {
      passive: true,
    });

    return () => {
      window.removeEventListener('resize', updateConfettiPlacement);
      window.removeEventListener('scroll', updateConfettiPlacement);

      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }

      if (confettiTimerRef.current) {
        clearTimeout(confettiTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    onCouponApplyingChange &&
      onCouponApplyingChange(applyCouponMutation.isPending);
  }, [applyCouponMutation.isPending, onCouponApplyingChange]);

  useEffect(() => {
    return () => {
      onCouponApplyingChange && onCouponApplyingChange(false);
    };
  }, [onCouponApplyingChange]);

  useEffect(() => {
    const previousCoupon = String(previousCouponRef.current || '').trim();
    const hasAppliedCoupon = Boolean(appliedCoupon);

    if (hasAppliedCoupon && previousCoupon !== appliedCoupon) {
      setShowCouponPulse(true);
      triggerConfetti();

      const timer = setTimeout(() => {
        setShowCouponPulse(false);
      }, 1400);

      previousCouponRef.current = appliedCoupon;
      return () => clearTimeout(timer);
    }

    previousCouponRef.current = appliedCoupon;
  }, [appliedCoupon]);

  useEffect(() => {
    if (!previewOfferUid) {
      setDismissedAutoOfferUid('');
      return;
    }

    if (dismissedAutoOfferUid && dismissedAutoOfferUid !== previewOfferUid) {
      setDismissedAutoOfferUid('');
    }
  }, [previewOfferUid, dismissedAutoOfferUid]);

  useEffect(() => {
    const previousOfferUid = String(previousOfferUidRef.current || '').trim();
    const hasOffer = Boolean(resolvedOfferUid);

    if (hasOffer && previousOfferUid !== resolvedOfferUid) {
      setShowOfferPulse(true);
      triggerConfetti();

      const timer = setTimeout(() => {
        setShowOfferPulse(false);
      }, 1400);

      previousOfferUidRef.current = resolvedOfferUid;
      return () => clearTimeout(timer);
    }

    previousOfferUidRef.current = resolvedOfferUid;
  }, [resolvedOfferUid]);

  useEffect(() => {
    setSelectedFreeVariantUids([]);
    setSelectedFreeOptionCache({});
  }, [resolvedOfferUid]);

  const getDefaultTab = (offers, coupons) => {
    if (offers > 0 && coupons > 0) return TAB_KEYS.OFFERS;
    if (offers === 0 && coupons > 0) return TAB_KEYS.COUPONS;
    if (coupons === 0 && offers > 0) return TAB_KEYS.OFFERS;
    return TAB_KEYS.OFFERS;
  };

  const triggerConfetti = () => {
    if (rootRef.current && typeof window !== 'undefined') {
      const rect = rootRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth || 1;
      const viewportHeight = window.innerHeight || 1;
      const originX = clampRatio(
        (rect.left + rect.width * 0.5) / viewportWidth
      );
      const originY = clampRatio((rect.top + 8) / viewportHeight);

      setConfettiPlacement({
        originX,
        originY,
        style: {
          width: `${viewportWidth}px`,
          height: `${viewportHeight}px`,
          transform: `translate3d(${-rect.left}px, ${-rect.top}px, 0)`,
        },
      });
    }

    setConfettiBurstKey((currentKey) => currentKey + 1);
    setShowConfetti(true);

    if (confettiTimerRef.current) {
      clearTimeout(confettiTimerRef.current);
    }

    confettiTimerRef.current = setTimeout(() => {
      setShowConfetti(false);
    }, 1800);
  };

  const hasInitializedTab = useRef(false);

  useEffect(() => {
    if (!isModalOpen || hasInitializedTab.current) {
      return;
    }

    if (isCouponListLoading || isOfferListLoading) {
      return;
    }

    const offersCount = availableOffers.length;
    const couponsCount = availableCoupons.length;

    setActiveTab(getDefaultTab(offersCount, couponsCount));
    hasInitializedTab.current = true;
  }, [
    isModalOpen,
    isCouponListLoading,
    isOfferListLoading,
    availableOffers.length,
    availableCoupons.length,
  ]);

  // console.log(availableCoupons);

  useEffect(() => {
    if (isModalOpen) {
      return;
    }

    hasInitializedTab.current = false;
  }, [isModalOpen]);

  const handleApplyCoupon = async (couponData) => {
    if (!isAuthenticated) {
      onRequireLogin && onRequireLogin();
      ToastNotification('info', 'Please login to apply coupons.');
      return false;
    }

    const isObjectPayload =
      couponData &&
      typeof couponData === 'object' &&
      !Array.isArray(couponData);
    const requestedCouponIdentifier = String(
      isObjectPayload ? couponData?.couponIdentifier : couponData || ''
    ).trim();
    const requestedCouponUid = String(
      isObjectPayload ? couponData?.couponUid : ''
    ).trim();
    const requestedCouponDiscountAmount = Number(
      isObjectPayload ? couponData?.couponDiscountAmount : 0
    );

    if (!requestedCouponIdentifier || isActionLoading) {
      return false;
    }

    if (!normalizedItems.length) {
      const message = 'No valid cart items found for coupon application.';
      setModalErrorMessage(message);
      ToastNotification('error', message);
      return false;
    }

    try {
      setModalErrorMessage('');

      const response = await applyCouponMutation.mutateAsync({
        couponIdentifier: requestedCouponIdentifier,
        coinUsed,
        items: normalizedItems,
      });

      const resolvedCouponIdentifier = resolveAppliedCouponIdentifier(
        response,
        requestedCouponIdentifier
      );
      const resolvedCouponUid = resolveAppliedCouponUid(
        response,
        requestedCouponUid
      );
      const resolvedCouponDiscountAmount = resolveAppliedCouponDiscountAmount(
        response,
        requestedCouponDiscountAmount
      );

      onApplyCoupon &&
        onApplyCoupon({
          couponIdentifier: resolvedCouponIdentifier,
          couponUid: resolvedCouponUid,
          couponDiscountAmount: resolvedCouponDiscountAmount,
        });

      ToastNotification(
        'success',
        response?.message || 'Coupon applied successfully.'
      );

      setCouponInput('');
      setModalErrorMessage('');
      setIsModalOpen(false);

      return true;
    } catch (error) {
      const message = error?.message || 'Unable to apply coupon.';
      setModalErrorMessage(message);
      ToastNotification('error', message);
      return false;
    }
  };

  const handleRemoveCoupon = () => {
    if (isActionLoading) {
      return;
    }

    setModalErrorMessage('');
    if (onRemoveCoupon) onRemoveCoupon();
  };

  const handleRemoveOffer = () => {
    if (isActionLoading) {
      return;
    }

    setSelectedFreeVariantUids([]);
    setSelectedFreeOptionCache({});
    setModalErrorMessage('');
    setDismissedAutoOfferUid(resolvedOfferUid);
    onRemoveOffer && onRemoveOffer();
  };

  const handleViewAllCoupons = () => {
    if (isActionLoading) return;

    if (!isAuthenticated) {
      onRequireLogin && onRequireLogin();
      return;
    }

    setActiveTab(hasAppliedOffer ? TAB_KEYS.OFFERS : TAB_KEYS.COUPONS);
    setModalErrorMessage('');
    setIsModalOpen(true);
  };

  const handleCouponInputChange = (event) => {
    setCouponInput(String(event?.target?.value || '').toUpperCase());
  };

  const handleApplyTypedCoupon = () => {
    if (isActionLoading) {
      return;
    }

    const couponIdentifier = String(couponInput || '')
      .trim()
      .toUpperCase();

    if (!couponIdentifier) {
      setModalErrorMessage('Coupon code is required.');
      return;
    }

    if (!/^[A-Z0-9_-]+$/.test(couponIdentifier)) {
      setModalErrorMessage(
        'Invalid coupon format. Use letters, numbers, _ or -.'
      );
      return;
    }

    handleApplyCoupon({ couponIdentifier });
  };

  const handleApplyCouponCard = (coupon = {}) => {
    const couponIdentifier = getCouponCode(coupon);
    const couponUid = String(coupon?.uid || '').trim();

    if (!couponIdentifier) {
      return;
    }

    handleApplyCoupon({
      couponIdentifier,
      couponUid,
    });
  };

  const toggleCouponDetails = (couponKey) => {
    setExpandedCouponKeys((currentSet) => {
      const nextSet = new Set(currentSet);

      if (nextSet.has(couponKey)) {
        nextSet.delete(couponKey);
      } else {
        nextSet.add(couponKey);
      }

      return nextSet;
    });
  };

  const toggleOfferDetails = (offerKey) => {
    setExpandedOfferKeys((currentSet) => {
      const nextSet = new Set(currentSet);

      if (nextSet.has(offerKey)) {
        nextSet.delete(offerKey);
      } else {
        nextSet.add(offerKey);
      }

      return nextSet;
    });
  };

  const copyToClipboard = async (value) => {
    if (typeof window === 'undefined' || !value) {
      return false;
    }

    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }

    const helperTextarea = document.createElement('textarea');
    helperTextarea.value = value;
    helperTextarea.setAttribute('readonly', '');
    helperTextarea.style.position = 'absolute';
    helperTextarea.style.left = '-9999px';
    document.body.appendChild(helperTextarea);
    helperTextarea.select();
    const didCopy = document.execCommand('copy');
    document.body.removeChild(helperTextarea);
    return didCopy;
  };

  const handleCopyCouponCode = async (couponCode) => {
    if (!couponCode || isActionLoading) {
      return;
    }

    try {
      const didCopy = await copyToClipboard(couponCode);

      if (!didCopy) {
        throw new Error('Copy failed');
      }

      setCopiedCouponCode(couponCode);
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }

      copyTimerRef.current = setTimeout(() => {
        setCopiedCouponCode('');
      }, 1200);

      ToastNotification('success', 'Coupon code copied.');
    } catch (error) {
      ToastNotification('error', 'Unable to copy coupon code.');
    }
  };

  const handleApplyOffer = (offer = {}) => {
    if (isActionLoading) {
      return;
    }

    if (!isAuthenticated) {
      onRequireLogin && onRequireLogin();
      ToastNotification('info', 'Please login to apply offers.');
      return;
    }

    const nextOfferUid = String(offer?.uid || '').trim();

    if (!nextOfferUid) {
      return;
    }

    setDismissedAutoOfferUid('');
    setSelectedFreeVariantUids([]);
    setSelectedFreeOptionCache({});
    setModalErrorMessage('');
    onApplyOffer && onApplyOffer({ offerUid: nextOfferUid, offer });
    setIsModalOpen(false);
    ToastNotification('success', 'Offer applied. Cart totals are updating.');
  };

  const handleAddFreeProduct = (option = {}) => {
    if (!isAuthenticated) {
      onRequireLogin && onRequireLogin();
      ToastNotification('info', 'Please login to select free products.');
      return;
    }

    if (isLoading) {
      return;
    }

    const variantUid = getFreeOptionVariantUid(option);

    if (!variantUid) {
      ToastNotification('error', 'Unable to add this free product.');
      return;
    }

    if (selectedFreeVariantUids.includes(variantUid)) {
      return;
    }

    if (
      freeProductSelectionLimit > 0 &&
      selectedFreeProductCount >= freeProductSelectionLimit
    ) {
      ToastNotification(
        'info',
        `You can select only ${freeProductSelectionLimit} free product${freeProductSelectionLimit > 1 ? 's' : ''}.`
      );
      return;
    }

    setSelectedFreeOptionCache((currentCache) => ({
      ...currentCache,
      [variantUid]: option,
    }));

    setSelectedFreeVariantUids((currentUids) => [...currentUids, variantUid]);
  };

  const handleRemoveFreeProduct = (option = {}) => {
    if (isLoading) {
      return;
    }

    const variantUid = getFreeOptionVariantUid(option);

    if (!variantUid) {
      ToastNotification('error', 'Unable to remove this free product.');
      return;
    }

    setSelectedFreeOptionCache((currentCache) => {
      if (!currentCache?.[variantUid]) {
        return currentCache;
      }

      const nextCache = { ...currentCache };
      delete nextCache[variantUid];
      return nextCache;
    });

    setSelectedFreeVariantUids((currentUids) =>
      currentUids.filter((uid) => uid !== variantUid)
    );
  };

  const resolvedCouponErrorMessage = useMemo(() => {
    if (activeTab !== TAB_KEYS.COUPONS) return '';

    return (
      modalErrorMessage ||
      (couponsError?.message
        ? `Unable to load coupons: ${couponsError.message}`
        : '')
    );
  }, [modalErrorMessage, couponsError, activeTab]);

  const resolvedOfferErrorMessage = useMemo(() => {
    if (activeTab !== TAB_KEYS.OFFERS) return '';

    return (
      modalErrorMessage || // This is rarely used for offers, but kept for safety
      (offersError?.message
        ? `Unable to load offers: ${offersError.message}`
        : '')
    );
  }, [modalErrorMessage, offersError, activeTab]);

  const renderCouponSkeleton = () =>
    Array.from({ length: 3 }).map((_, index) => (
      <div key={`coupon-skeleton-${index}`} className={styles.skeletonCard}>
        <div className={styles.skeletonLineLarge} />
        <div className={styles.skeletonLineMedium} />
        <div className={styles.skeletonLineSmall} />
      </div>
    ));

  const renderOfferSkeleton = () =>
    Array.from({ length: 3 }).map((_, index) => (
      <div key={`offer-skeleton-${index}`} className={styles.skeletonCard}>
        <div className={styles.skeletonLineLarge} />
        <div className={styles.skeletonLineMedium} />
        <div className={styles.skeletonLineSmall} />
      </div>
    ));

  return (
    <div className={styles.root} ref={rootRef}>
      {showConfetti && (
        <div className={styles.confettiLayer} aria-hidden="true">
          <Confetti
            key={confettiBurstKey}
            mode="boom"
            x={confettiPlacement.originX}
            y={confettiPlacement.originY}
            particleCount={150}
            shapeSize={7}
            spreadDeg={70}
            launchSpeed={0.5}
            effectCount={1}
            opacityDeltaMultiplier={1.9}
            colors={['#22c55e', '#84cc16', '#facc15', '#fefefe', '#10b981']}
            style={confettiPlacement.style}
          />
        </div>
      )}

      {hasAppliedOffer && (
        <div
          className={`${styles.appliedCard} ${styles.offerCard} ${showOfferPulse ? styles.pulse : ''}`}
        >
          <div className={styles.appliedCardLeft}>
            <div className={styles.appliedBadge}>
              {appliedOfferHasPendingFreeSelection
                ? 'Offer Applied - Action Needed'
                : 'Offer Applied'}
            </div>
            <div className={styles.appliedTitle}>{offerName || ''}</div>
            {/* <p className={styles.cardSubMeta}>{appliedOfferTypeLabel}</p> */}
            {offerDiscountAmount > 0 && (
              <p className={styles.appliedSubTitle}>
                You saved {formatCurrency(offerDiscountAmount)}
              </p>
            )}
            {appliedOfferHasPendingFreeSelection && (
              <div className={styles.pendingSelectionBlock}>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={handleRemoveOffer}
                  disabled={isActionLoading}
                >
                  <IoClose />
                </button>
                <div
                  className={`${styles.freeOptionRail} hide-scrollbar`}
                  data-lenis-prevent
                >
                  {freeProductOptions.map((option, optionIndex) => {
                    const variantUid = getFreeOptionVariantUid(option);

                    const isSelected =
                      selectedFreeVariantUids.includes(variantUid);

                    const canAddMoreSelection =
                      freeProductSelectionLimit <= 0 ||
                      selectedFreeProductCount < freeProductSelectionLimit;

                    const isDisabled =
                      isLoading || (!isSelected && !canAddMoreSelection);

                    return (
                      <div
                        key={String(option?.variantUid || optionIndex)}
                        className={styles.freeOptionCard}
                      >
                        <div className={styles.freeOptionMainRow}>
                          <div className={styles.freeOptionThumbWrap}>
                            <Image
                              src={resolveFreeProductImage(option)}
                              alt={getFreeProductOptionLabel(option)}
                              width={48}
                              height={48}
                              className={styles.freeOptionThumb}
                              unoptimized
                            />
                          </div>

                          <div className={styles.freeOptionInfo}>
                            <p className={styles.freeOptionTitle}>
                              {String(option?.productName || '').trim() ||
                                'Free product'}
                            </p>

                            <p className={styles.freeOptionMeta}>
                              {String(option?.variantName || '').trim()}
                            </p>

                            <p className={styles.freeOptionPriceLine}>
                              <span className={styles.freeOptionFreePrice}>
                                Free
                              </span>

                              {Number(option?.disPrice) > 0 && (
                                <del>{formatCurrency(option?.disPrice)}</del>
                              )}
                            </p>
                          </div>

                          {/* Single Toggle Button */}
                          <button
                            type="button"
                            className={`${styles.freeOptionToggleButton} ${isSelected ? styles.selected : ''
                              }`}
                            disabled={isDisabled}
                            onClick={() => {
                              if (isSelected) {
                                handleRemoveFreeProduct(option);
                              } else {
                                handleAddFreeProduct(option);
                              }
                            }}
                          >
                            {isSelected ? (
                              <>
                                <RiSubtractLine />
                                Remove
                              </>
                            ) : (
                              <>
                                <RiAddLine />
                                Add
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showSelectedFreeProducts && selectedFreeProducts.length > 0 && (
        <div className={styles.selectedFreeProductsBlock}>
          <div className={styles.selectedFreeProductsHeader}>
            Selected free products ({selectedFreeProductCount}
            {freeProductSelectionLimit > 0
              ? `/${freeProductSelectionLimit}`
              : ''}
            )
          </div>
          <div className={styles.selectedFreeProductsList}>
            {selectedFreeProducts.map((item, index) => (
              <div
                key={String(item?.variantUid || index)}
                className={styles.selectedFreeProductRow}
              >
                <div className={styles.selectedFreeProductMain}>
                  <div className={styles.selectedFreeThumbWrap}>
                    <Image
                      src={resolveFreeProductImage(item)}
                      alt={getFreeProductOptionLabel(item)}
                      width={40}
                      height={40}
                      className={styles.selectedFreeThumb}
                      unoptimized
                    />
                  </div>

                  <div className={styles.selectedFreeInfo}>
                    <p className={styles.selectedFreeTitle}>
                      {String(item?.productName || '').trim() || 'Free product'}
                    </p>
                    <p className={styles.selectedFreeMeta}>
                      {String(item?.variantName || '').trim()} • Qty:{' '}
                      {Number(item?.quantity || 0)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className={`${styles.freeOptionActionButton} ${styles.freeOptionRemoveButton}`}
                  onClick={() => handleRemoveFreeProduct(item)}
                  disabled={isLoading}
                >
                  <RiSubtractLine />
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.section}>
        {!appliedCoupon && (
          <button
            type="button"
            onClick={handleViewAllCoupons}
            className={styles.triggerButton}
            disabled={isActionLoading}
          >
            <span className={styles.triggerLabel}>View Offers & Coupons</span>
            <RiArrowRightSLine className={styles.triggerArrow} />
          </button>
        )}

        {appliedCoupon && (
          <div
            className={`${styles.appliedCard} ${showCouponPulse ? styles.pulse : ''}`}
          >
            <div className={styles.appliedCardLeft}>
              <div className={styles.appliedTitle}>Coupon Applied</div>
              <p className={styles.appliedCode}>COUPON : {appliedCoupon}</p>
            </div>
            <button
              type="button"
              onClick={handleRemoveCoupon}
              className={styles.removeButton}
              disabled={isActionLoading}
            >
              <IoClose />
            </button>
          </div>
        )}

        {appliedCoupon && (
          <button
            type="button"
            onClick={handleViewAllCoupons}
            className={styles.viewAllButton}
            disabled={isActionLoading}
          >
            <span>VIEW ALL COUPONS & OFFERS</span>
            <RiArrowRightSLine />
          </button>
        )}
      </div>

      <ResponsiveModal
        modal={isModalOpen}
        setModal={setIsModalOpen}
        classes={{
          modalClass: 'theme-modal view-modal coupon-modal modal-md',
          modalHeaderClass: 'justify-content-between',
          title: 'Apply Offers & Coupons',
        }}
        backdrop="static"
      >
        <div className={styles.modalBody}>
          <div
            className={`${styles.tabs} ${activeTab === TAB_KEYS.COUPONS
              ? styles.couponsActive
              : styles.offersActive
              }`}
          >
            <span className={styles.tabIndicator} aria-hidden="true" />
            <button
              type="button"
              className={`${styles.tabButton} ${activeTab === TAB_KEYS.OFFERS ? styles.tabButtonActive : ''
                }`}
              onClick={() => {
                setActiveTab(TAB_KEYS.OFFERS);
                setModalErrorMessage('');
              }}
            >
              Offers
            </button>
            <button
              type="button"
              className={`${styles.tabButton} ${activeTab === TAB_KEYS.COUPONS ? styles.tabButtonActive : ''
                }`}
              onClick={() => {
                setActiveTab(TAB_KEYS.COUPONS);
                setModalErrorMessage('');
              }}
            >
              Coupons
            </button>
          </div>

          <div key={activeTab} className={styles.tabContent}>
            {activeTab === TAB_KEYS.COUPONS && (
              <div className={styles.panel}>
                <div>
                  <div className={styles.inputRow}>
                    <input
                      type="text"
                      className={styles.input}
                      value={couponInput}
                      onChange={handleCouponInputChange}
                      placeholder="Enter coupon code"
                      disabled={isActionLoading}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          handleApplyTypedCoupon();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className={styles.primaryButton}
                      onClick={handleApplyTypedCoupon}
                      disabled={isActionLoading}
                    >
                      {applyCouponMutation.isPending ? 'Applying...' : 'Apply'}
                    </button>
                  </div>

                  {resolvedCouponErrorMessage && (
                    <p className={styles.errorText}>
                      {resolvedCouponErrorMessage}
                    </p>
                  )}
                </div>

                <div className={`${styles.listWrapper} hide-scrollbar`}>
                  {isCouponListLoading && renderCouponSkeleton()}

                  {!isCouponListLoading && !availableCoupons.length && (
                    <div className={styles.emptyState}>
                      No coupons available right now.
                    </div>
                  )}

                  {!isCouponListLoading &&
                    availableCoupons.map((coupon, index) => {
                      const couponCode = getCouponCode(coupon);
                      const couponKey = String(
                        coupon?.uid || couponCode || index
                      );
                      const couponName = String(
                        coupon?.name || couponCode
                      ).trim();
                      const validTill = formatDate(
                        coupon?.validTo || coupon?.expiresAt
                      );
                      const couponDescription = String(
                        coupon?.shortDescription || coupon?.description || ''
                      ).trim();
                      const couponTerms = String(
                        coupon?.termsAndConditions || ''
                      ).trim();
                      const hasExpandableDetails = Boolean(couponTerms);
                      const isExpanded = expandedCouponKeys.has(couponKey);
                      const normalizedCouponUid = String(
                        coupon?.uid || ''
                      ).trim();
                      const normalizedCouponCode = couponCode.toUpperCase();
                      const isApplied = Boolean(
                        resolvedAppliedCouponUid &&
                        (normalizedCouponUid
                          ? normalizedCouponUid === resolvedAppliedCouponUid
                          : normalizedCouponCode === resolvedAppliedCouponCode)
                      );

                      return (
                        <div key={couponKey} className={styles.listCard}>
                          <div className={styles.cardTopRow}>
                            <h6 className={styles.cardTitle}>{couponName}</h6>
                            {isApplied && (
                              <span className={styles.inlineAppliedBadge}>
                                <RiCheckLine /> Applied
                              </span>
                            )}
                          </div>
                          {couponDescription && (
                            <div className={styles.cardTopRow}>
                              <p className={styles.couponDetailsLine}>
                                <span className={styles.couponDetailsLabel}>
                                </span>
                                {couponDescription}
                              </p>
                            </div>
                          )}

                          {/* <p className={styles.cardMeta}>
                            {getCouponDiscountLabel(coupon)}
                          </p> */}

                          {hasExpandableDetails && isExpanded && (
                            <div className={styles.couponDetailsBlock}>
                              <p className={styles.couponDetailsLine}>
                                <span className={styles.couponDetailsLabel}>
                                  Terms & Conditions:
                                </span>

                                <span
                                  className="hide-scrollbar"
                                  style={{
                                    display: 'block',
                                    maxHeight: '100px',
                                    overflowY: 'auto',
                                  }}
                                  dangerouslySetInnerHTML={{
                                    __html: couponTerms,
                                  }}
                                />
                              </p>
                            </div>
                          )}

                          {hasExpandableDetails && (
                            <button
                              type="button"
                              className={styles.couponMoreButton}
                              onClick={() => toggleCouponDetails(couponKey)}
                            >
                              {isExpanded ? '-LESS' : '+MORE'}
                            </button>
                          )}

                          {couponName && (
                            <div className={styles.cardFooter}>
                              {/* <span className={styles.codePill}>
                                {couponName}
                              </span> */}
                              <div className={styles.cardActions}>
                                <button
                                  type="button"
                                  className={styles.secondaryButton}
                                  onClick={() =>
                                    handleCopyCouponCode(couponName)
                                  }
                                  disabled={!couponName}
                                >
                                  <RiFileCopyLine />
                                  Copy
                                </button>
                                <button
                                  type="button"
                                  className={styles.primaryButtonSmall}
                                  onClick={() => handleApplyCouponCard(coupon)}
                                  disabled={isApplied}
                                >
                                  {isApplied ? 'Applied' : 'Apply'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {activeTab === TAB_KEYS.OFFERS && (
              <div className={styles.panel}>
                {resolvedOfferErrorMessage && (
                  <p className={styles.errorText}>
                    {resolvedOfferErrorMessage}
                  </p>
                )}

                <div className={`${styles.listWrapper} hide-scrollbar`}>
                  {isOfferListLoading && renderOfferSkeleton()}

                  {!isOfferListLoading && !availableOffers.length && (
                    <div className={styles.emptyState}>
                      No applicable offers for the current cart.
                    </div>
                  )}

                  {!isOfferListLoading &&
                    availableOffers.map((offer, index) => {
                      const currentOfferUid = String(offer?.uid || '').trim();
                      const offerKey = currentOfferUid || `offer-${index}`;
                      const isApplied = Boolean(
                        currentOfferUid && currentOfferUid === resolvedOfferUid
                      );
                      const validTill = formatDate(offer?.validTo);
                      const offerDescription = String(
                        offer?.description || ''
                      ).trim();
                      const offerTerms = String(
                        offer?.termsAndConditions || ''
                      ).trim();
                      const hasExpandableDetails = Boolean(offerTerms);
                      const isExpanded = expandedOfferKeys.has(offerKey);
                      const pendingSelectionEntry = cartValueFreeOffers.find(
                        (entry) =>
                          String(entry?.offerUid || '').trim() ===
                          currentOfferUid
                      );
                      const pendingSelectionCount = Number(
                        pendingSelectionEntry?.remainingRewardQty ?? 0
                      );
                      const hasPendingSelection =
                        pendingSelectionCount > 0 ||
                        (isApplied &&
                          Boolean(
                            resolvedAppliedOffer?.pendingFreeProductSelection
                          ));

                      return (
                        <div key={offerKey} className={styles.offerTicket}>
                          <div
                            className={`${styles.offerTicketCard} ${isApplied ? styles.offerTicketCardApplied : ''
                              }`}
                          >
                            <div className={styles.offerTicketMainRow}>
                              <div
                                aria-hidden="true"
                                className={styles.offerTicketStrip}
                              />

                              <div className={styles.offerTicketContent}>
                                <div className={styles.offerTicketTextBlock}>
                                  <p className={styles.offerTicketTitle}>
                                    {offer?.name || ''}
                                  </p>
                                  {offerDescription && (
                                    <p
                                      className={styles.offerTicketDescription}
                                    >
                                      {offerDescription}
                                    </p>
                                  )}
                                  {/* {hasPendingSelection && (
                                    <p className={styles.offerTicketPendingText}>
                                      Select{' '}
                                      {Math.max(
                                        1,
                                        Math.floor(pendingSelectionCount || 1)
                                      )}{' '}
                                      more free item
                                      {Math.max(
                                        1,
                                        Math.floor(pendingSelectionCount || 1)
                                      ) > 1
                                        ? 's'
                                        : ''}
                                      .
                                    </p>
                                  )} */}
                                </div>

                                <div className={styles.offerTicketMetaRow}>
                                  <div className={styles.offerTicketCodeWrap}>
                                    <span
                                      className={styles.offerTicketValidity}
                                    >
                                      {validTill
                                        ? `Valid till ${validTill}`
                                        : getOfferConditions(offer)}
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    className={`${styles.offerApplyButton} ${isApplied
                                      ? styles.offerApplyButtonApplied
                                      : ''
                                      }`}
                                    onClick={() => handleApplyOffer(offer)}
                                    disabled={isActionLoading || isApplied}
                                  >
                                    {isApplied ? (
                                      <>
                                        <RiCheckLine /> Applied
                                      </>
                                    ) : (
                                      'Apply'
                                    )}
                                  </button>
                                </div>

                                {hasExpandableDetails && !isExpanded && (
                                  <button
                                    type="button"
                                    className={styles.offerToggleButton}
                                    onClick={() => toggleOfferDetails(offerKey)}
                                    aria-expanded={false}
                                  >
                                    <span>+ More</span>
                                    <RiArrowRightSLine
                                      className={styles.offerToggleIcon}
                                    />
                                  </button>
                                )}
                              </div>
                            </div>

                            {hasExpandableDetails && (
                              <div
                                className={`${styles.offerAccordion} ${isExpanded ? styles.offerAccordionOpen : ''
                                  }`}
                              >
                                <div className={styles.offerAccordionInner}>
                                  <div className={styles.offerAccordionLabel}>
                                    Terms & Conditions
                                  </div>
                                  <div
                                    className={`${styles.offerAccordionText} hide-scrollbar`}
                                    dangerouslySetInnerHTML={{
                                      __html: offerTerms,
                                    }}
                                  />
                                  <button
                                    type="button"
                                    className={`${styles.offerToggleButton} ${styles.offerToggleButtonExpanded}`}
                                    onClick={() => toggleOfferDetails(offerKey)}
                                    aria-expanded={isExpanded}
                                  >
                                    <span>- Less</span>
                                    <RiArrowRightSLine
                                      className={`${styles.offerToggleIcon} ${styles.offerToggleIconOpen}`}
                                    />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      </ResponsiveModal>
    </div>
  );
}
