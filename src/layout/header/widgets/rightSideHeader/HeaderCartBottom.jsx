import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Input, InputGroup } from 'reactstrap';
import { RiShoppingCartLine, RiAddLine, RiSubtractLine } from 'react-icons/ri';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import CartVariationModal from './CartVariationModal';
import AlternativeProductList from './AlternativeProductList';
import CartContext from '@/helper/cartContext';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import ViewCouponAndOffer from '@/components/checkout/checkoutSidebar/ViewCouponAndOffer';
import CheckoutOrderSummary from '@/components/checkout/checkoutSidebar/CheckoutOrderSummary';
import { placeHolderImage } from '@/data/CommonPath';
import Btn from '@/elements/buttons/Btn';
import SuperCoinsCard from '@/components/checkout/checkoutSidebar/SuperCoinsCard';
import EarnSdlCoinsBanner from '@/components/checkout/checkoutSidebar/EarnSdlCoinsBanner';
import UserContext from '@/helper/userContext';
import CustomModal from '@/components/common/CustomModal';
import OtpLoginModal from '@/components/auth/login/OtpLoginModal';
import { ToastNotification } from '@/utils/customFunctions/ToastNotification';
import { useAddToWishlist } from '@/utils/hooks/useWishlist';
import { useCartPreview, useRemoveFromCart } from '@/utils/hooks/useCart';
import {
  POST_LOGIN_ACTIONS,
  storePendingPostLoginAction,
} from '@/utils/postLoginAction';
import GstInvoiceCard from '@/components/checkout/checkoutSidebar/GstInvoiceCard';
import ResponsiveModal from '@/components/common/ResponsiveModal';
import GstInvoiceForm from '@/components/checkout/checkoutSidebar/GstInvoiceForm';
import {
  getCartItemProductUid,
  groupCartItemsByCustomerType,
} from '@/utils/cart/cartUtils';
import PrescriptionConsent from '@/components/cart/PrescriptionConsent';
import SettingContext from '@/helper/settingContext';

const getImageUrl = (...sources) => {
  for (const source of sources) {
    if (!source) continue;
    if (typeof source === 'string' && source.trim()) return source;
    if (typeof source === 'object') {
      if (
        typeof source.original_url === 'string' &&
        source.original_url.trim()
      ) {
        return source.original_url;
      }
      if (typeof source.url === 'string' && source.url.trim())
        return source.url;
      if (typeof source.src === 'string' && source.src.trim())
        return source.src;
    }
  }
  return placeHolderImage;
};

const getItemMaxQuantity = (item) => {
  const parsedQuantity = Number(
    item?.variant?.stockQty ??
    item?.variation?.quantity ??
    item?.product?.stockQty ??
    item?.product?.quantity
  );

  return Number.isFinite(parsedQuantity) ? Math.max(0, parsedQuantity) : null;
};

const getItemIdentifiers = (item) => ({
  productUid:
    item?.product_id || item?.product?.id || item?.product?.uid || null,
  variantUid:
    item?.variation_id ||
    item?.variation?.id ||
    item?.variant?.id ||
    item?.variant?.uid ||
    null,
});

const getStockLimitMessage = (availableQuantity) => {
  if (availableQuantity === 0) {
    return 'This item is out of stock.';
  }

  return `Only ${availableQuantity} item${availableQuantity === 1 ? '' : 's'} available.`;
};

const DEFAULT_PRESCRIPTION_STATE = {
  isDoctor: false,
  requiredItemCount: 0,
  isPrescriptionRequired: false,
  uploadedCount: 0,
  uploadedFiles: [],
  isValid: true,
  requirementError: '',
  localError: '',
  error: '',
  isHydrating: false,
};

const HeaderCartBottom = ({
  modal,
  setModal,
  shippingFreeAmt,
  shippingCal,
  onCheckoutDataChange,
  selectedAddress,
}) => {
  const { convertCurrency } = useContext(SettingContext);
  const onCheckoutDataChangeRef = useRef(onCheckoutDataChange);
  const lastCheckoutPayloadSignatureRef = useRef('');
  const coinAppliedSelectionSignatureRef = useRef('');
  const prevCartRefreshKeyRef = useRef(null);
  const [isSuperCoinsApplied, setIsSuperCoinsApplied] = useState(false);
  const [coinResetHighlightSignal, setCoinResetHighlightSignal] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [appliedCouponUid, setAppliedCouponUid] = useState('');
  const [appliedOfferUid, setAppliedOfferUid] = useState('');
  const [appliedCouponDiscountAmount, setAppliedCouponDiscountAmount] =
    useState(0);
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const { setCartCanvas, cartCanvas } = useContext(ThemeOptionContext);
  const [selectedVariation, setSelectedVariation] = useState('');
  const [removePromptOpen, setRemovePromptOpen] = useState(false);
  const [pendingRemovalItem, setPendingRemovalItem] = useState(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [isGstInvoiceModalOpen, setIsGstInvoiceModalOpen] = useState(false);
  const [isGstInvoiceSelected, setIsGstInvoiceSelected] = useState(false);
  const [gstBillingAddressUid, setGstBillingAddressUid] = useState('');
  const [selectedCoinUsedAmount, setSelectedCoinUsedAmount] = useState(0);
  const [selectedFreeItems, setSelectedFreeItems] = useState([]);
  const [prescriptionState, setPrescriptionState] = useState(
    DEFAULT_PRESCRIPTION_STATE
  );
  const { rawCartProducts, removeCartItemsMutation, updateCartQty } =
    useContext(CartContext);
  const { userData, isAuthenticated } = useContext(UserContext);
  const router = useRouter();
  const addToWishlistMutation = useAddToWishlist();
  const removeFromCartMutation = useRemoveFromCart();

  const coinUsedForPreview = useMemo(() => {
    if (!isSuperCoinsApplied) {
      return 0;
    }

    return Math.max(0, Math.floor(Number(selectedCoinUsedAmount || 0)));
  }, [isSuperCoinsApplied, selectedCoinUsedAmount]);

  const cartPreviewRefreshKey = useMemo(
    () =>
      (Array.isArray(rawCartProducts) ? rawCartProducts : [])
        .map((item) =>
          [
            String(item?.product_id || ''),
            String(item?.variation_id || ''),
            String(item?.quantity || 0),
          ].join(':')
        )
        .sort()
        .join('|'),
    [rawCartProducts]
  );

  const {
    data: cartPreviewResponse,
    isLoading: isCartPreviewLoading,
    isFetching: isCartPreviewFetching,
  } = useCartPreview(
    {
      couponCode: appliedCoupon,
      offerUid: appliedOfferUid,
      coinUsed: coinUsedForPreview,
    },
    {
      enabled: Boolean(cartCanvas),
      keepPreviousData: true,
    },
    cartPreviewRefreshKey
  );

  const previewMaxUsableCoins = useMemo(() => {
    const resolvedCount = Number(
      cartPreviewResponse?.data?.superCoins?.maxUsable ?? 0
    );

    return Number.isFinite(resolvedCount)
      ? Math.max(0, Math.floor(resolvedCount))
      : 0;
  }, [cartPreviewResponse?.data?.superCoins?.maxUsable]);

  const previewData = cartPreviewResponse?.data;
  const previewAppliedOffer = previewData?.discounts?.offer ?? null;
  const previewAppliedCoupon = previewData?.discounts?.coupon ?? null;
  const previewAppliedCouponCode = String(
    previewAppliedCoupon?.code || ''
  ).trim();
  const previewAppliedCouponUid = String(
    previewAppliedCoupon?.uid || ''
  ).trim();
  const previewBuyableProducts = previewData?.items?.buyable ?? [];
  const previewOutOfStockProducts = previewData?.items?.outOfStock ?? [];
  const previewUnavailableProducts = previewData?.items?.unavailable ?? [];

  const cartProducts = previewBuyableProducts;
  const restrictedCartProducts = previewUnavailableProducts;
  const outOfStockCartProducts = previewOutOfStockProducts;
  const hiddenCartProducts = [];
  const groupedCartProducts = useMemo(
    () => groupCartItemsByCustomerType(cartProducts),
    [cartProducts]
  );
  const hasInvalidCartItems =
    restrictedCartProducts.length > 0 ||
    outOfStockCartProducts.length > 0 ||
    hiddenCartProducts.length > 0;

  const hasRenderableCartItems = cartProducts?.length > 0;
  const hasEligibleCartProducts = hasRenderableCartItems;
  const hasRestrictedItems = restrictedCartProducts?.length > 0;
  const hasOutOfStockItems = outOfStockCartProducts?.length > 0;
  const hasHiddenItems = hiddenCartProducts?.length > 0;
  const hasAnyCartContent =
    hasRenderableCartItems ||
    hasRestrictedItems ||
    hasOutOfStockItems ||
    hasHiddenItems;

  const billDetails = previewData?.summary || null;
  const resolvedCoinUsedCount = useMemo(() => {
    if (previewMaxUsableCoins <= 0) {
      return 0;
    }

    return previewMaxUsableCoins;
  }, [previewMaxUsableCoins]);
  const isCartPreviewBusy = isCartPreviewLoading || isCartPreviewFetching;

  useEffect(() => {
    if (!previewData?.summary) {
      return;
    }

    const resolvedCouponDiscount = Number(
      previewData?.summary?.couponDiscount ?? 0
    );

    if (!Number.isFinite(resolvedCouponDiscount)) {
      return;
    }

    setAppliedCouponDiscountAmount(Math.max(0, resolvedCouponDiscount));
  }, [previewData?.summary?.couponDiscount]);

  const couponCoinUsed = useMemo(() => {
    if (!isSuperCoinsApplied) {
      return 0;
    }

    return Math.max(0, Math.floor(Number(selectedCoinUsedAmount || 0)));
  }, [isSuperCoinsApplied, selectedCoinUsedAmount]);

  useEffect(() => {
    if (
      isSuperCoinsApplied &&
      billDetails &&
      billDetails?.canApplySuperCoins === false
    ) {
      setIsSuperCoinsApplied(false);
      setSelectedCoinUsedAmount(0);
    }
  }, [billDetails?.canApplySuperCoins, isSuperCoinsApplied]);

  useEffect(() => {
    if (prevCartRefreshKeyRef.current === null) {
      prevCartRefreshKeyRef.current = cartPreviewRefreshKey;
      return;
    }

    if (prevCartRefreshKeyRef.current === cartPreviewRefreshKey) {
      return;
    }

    prevCartRefreshKeyRef.current = cartPreviewRefreshKey;

    if (!isSuperCoinsApplied) {
      return;
    }

    setIsSuperCoinsApplied(false);
    setSelectedCoinUsedAmount(0);
    setCoinResetHighlightSignal((currentSignal) => currentSignal + 1);
  }, [cartPreviewRefreshKey, isSuperCoinsApplied]);

  useEffect(() => {
    if (!isSuperCoinsApplied) {
      return;
    }

    const currentSelectionSignature = `${appliedCoupon}|${appliedOfferUid}`;

    // Only enforce reset when coupon/offer selection changed after coin application.
    if (
      coinAppliedSelectionSignatureRef.current === currentSelectionSignature
    ) {
      return;
    }

    const normalizedSelectedCoinAmount = Math.max(
      0,
      Math.floor(Number(selectedCoinUsedAmount || 0))
    );

    if (normalizedSelectedCoinAmount === previewMaxUsableCoins) {
      return;
    }

    // Reset coin usage when preview max usable coins changes for a new coupon/offer selection.
    setIsSuperCoinsApplied(false);
    setSelectedCoinUsedAmount(0);
    setCoinResetHighlightSignal((currentSignal) => currentSignal + 1);
    coinAppliedSelectionSignatureRef.current = currentSelectionSignature;
  }, [
    appliedCoupon,
    appliedOfferUid,
    isSuperCoinsApplied,
    previewMaxUsableCoins,
    selectedCoinUsedAmount,
  ]);

  useEffect(() => {
    onCheckoutDataChangeRef.current = onCheckoutDataChange;
  }, [onCheckoutDataChange]);

  const checkoutDataPayload = useMemo(
    () => ({
      appliedCoupon: previewAppliedCouponCode,
      appliedCouponUid: previewAppliedCouponUid,
      appliedOfferUid,
      appliedCouponDiscountAmount,
      isSuperCoinsApplied,
      billDetails,
      isGstInvoiceSelected,
      gstBillingAddressUid,
      hasInvalidCartItems,
      prescriptionState,
      isPreviewLoading: isCartPreviewBusy,
      buyableItems: cartProducts,
      freeItems: selectedFreeItems,
    }),
    [
      previewAppliedCouponCode,
      previewAppliedCouponUid,
      appliedOfferUid,
      appliedCouponDiscountAmount,
      isSuperCoinsApplied,
      billDetails,
      isGstInvoiceSelected,
      gstBillingAddressUid,
      hasInvalidCartItems,
      prescriptionState,
      isCartPreviewBusy,
      cartProducts,
      selectedFreeItems,
    ]
  );

  useEffect(() => {
    const payloadSignature = JSON.stringify(checkoutDataPayload);

    if (payloadSignature === lastCheckoutPayloadSignatureRef.current) {
      return;
    }

    lastCheckoutPayloadSignatureRef.current = payloadSignature;

    if (typeof onCheckoutDataChangeRef.current === 'function') {
      onCheckoutDataChangeRef.current(checkoutDataPayload);
    }
  }, [checkoutDataPayload]);

  const handleApplyCoupon = (couponData) => {
    const isObjectPayload =
      couponData &&
      typeof couponData === 'object' &&
      !Array.isArray(couponData);
    const couponIdentifier = String(
      isObjectPayload ? couponData?.couponIdentifier : couponData || ''
    ).trim();
    const couponUid = String(
      isObjectPayload ? couponData?.couponUid : ''
    ).trim();

    // 1. Apply the coupon
    setAppliedCoupon(couponIdentifier);
    setAppliedCouponUid(couponUid);
    setAppliedCouponDiscountAmount(0);

    // 2. Remove any applied offer
    setAppliedOfferUid('');
    setSelectedFreeItems([]);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon('');
    setAppliedCouponUid('');
    setAppliedCouponDiscountAmount(0);
  };

  const handleApplyOffer = (offerData) => {
    const isObjectPayload =
      offerData && typeof offerData === 'object' && !Array.isArray(offerData);
    const nextOfferUid = String(
      isObjectPayload ? offerData?.offerUid || offerData?.uid : offerData || ''
    ).trim();

    // 1. Apply the offer
    setSelectedFreeItems([]);
    setAppliedOfferUid(nextOfferUid);

    // 2. Remove any applied coupon
    setAppliedCoupon('');
    setAppliedCouponUid('');
    setAppliedCouponDiscountAmount(0);
  };

  const handleRemoveOffer = () => {
    setAppliedOfferUid('');
    setSelectedFreeItems([]);
  };

  const handleSuperCoinsToggle = (nextApplied) => {
    const shouldApply = Boolean(nextApplied);
    const currentSelectionSignature = `${appliedCoupon}|${appliedOfferUid}`;

    if (!shouldApply) {
      setIsSuperCoinsApplied(false);
      setSelectedCoinUsedAmount(0);
      coinAppliedSelectionSignatureRef.current = currentSelectionSignature;
      return;
    }

    const resolvedCoinAmount = resolvedCoinUsedCount;

    setSelectedCoinUsedAmount(resolvedCoinAmount);
    setIsSuperCoinsApplied(true);
    coinAppliedSelectionSignatureRef.current = currentSelectionSignature;
  };

  const goToProductDetails = (productSlug) => {
    if (!productSlug) return;
    setCartCanvas(false);
    router.push(`/products/${productSlug}`);
  };

  const closeRemovePrompt = () => {
    if (removeFromCartMutation.isPending || addToWishlistMutation.isPending) {
      return;
    }

    setRemovePromptOpen(false);
    setPendingRemovalItem(null);
  };

  const handleDecrease = (item) => {
    if (Number(item?.qty ?? item?.quantity ?? 1) <= 1) {
      setPendingRemovalItem(item);
      setRemovePromptOpen(true);
      return;
    }

    const productId =
      item?.product_id || item?.product?.id || item?.product?.uid;
    const variationId =
      item?.variation_id ||
      item?.variation?.id ||
      item?.variant?.id ||
      item?.variant?.uid ||
      null;
    updateCartQty(productId, variationId, -1);
  };

  const handleIncrease = (item) => {
    const maxQuantity = getItemMaxQuantity(item);
    const quantity = Number(item?.qty ?? item?.quantity ?? 0);

    if (maxQuantity !== null && quantity >= maxQuantity) {
      ToastNotification('error', getStockLimitMessage(maxQuantity));
      return;
    }

    const productId =
      item?.product_id || item?.product?.id || item?.product?.uid;
    const variationId =
      item?.variation_id ||
      item?.variation?.id ||
      item?.variant?.id ||
      item?.variant?.uid ||
      null;
    updateCartQty(productId, variationId, 1);
  };

  const handleRemoveWithWishlistOption = async (addToWishlist) => {
    if (!pendingRemovalItem) {
      return;
    }

    const currentItem = pendingRemovalItem;
    const { productUid, variantUid } = getItemIdentifiers(currentItem);

    if (!productUid || !variantUid) {
      ToastNotification('error', 'Unable to update this cart item.');
      closeRemovePrompt();
      return;
    }

    try {
      await removeFromCartMutation.mutateAsync({
        productUid,
        variantUid,
        count: Number(currentItem?.qty ?? currentItem?.quantity ?? 1),
      });

      if (!addToWishlist) {
        ToastNotification('success', 'Item removed from cart.');
        closeRemovePrompt();
        return;
      }

      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('userToken');

        if (!token) {
          storePendingPostLoginAction({
            type: POST_LOGIN_ACTIONS.WISHLIST_PRODUCT,
            productId: productUid,
          });
          setLoginModalOpen(true);
          ToastNotification(
            'success',
            'Item removed from cart. Login to save it to your wishlist.'
          );
          closeRemovePrompt();
          return;
        }
      }

      await addToWishlistMutation.mutateAsync({
        productUid,
        add: true,
      });

      ToastNotification('success', 'Item moved to wishlist.');
      closeRemovePrompt();
    } catch (error) {
      ToastNotification(
        'error',
        error?.message || 'Failed to update this item. Please try again.'
      );
    }
  };

  const handleRemoveRestrictedProducts = async () => {
    const productUids = restrictedCartProducts
      .map(getCartItemProductUid)
      .filter(Boolean);

    if (!productUids.length) {
      return;
    }

    try {
      await removeCartItemsMutation.mutateAsync({ productUids });
    } catch (error) {
      ToastNotification(
        'error',
        error?.message || 'Failed to remove restricted products.'
      );
    }
  };

  const handleRemoveOutOfStockProducts = async () => {
    if (!outOfStockCartProducts?.length) {
      return;
    }

    try {
      await Promise.all(
        outOfStockCartProducts.map((item) =>
          removeFromCartMutation.mutateAsync({
            productUid:
              item?.product_id || item?.product?.id || item?.product?.uid,
            variantUid:
              item?.variation_id ||
              item?.variation?.id ||
              item?.variant?.id ||
              item?.variant?.uid ||
              null,
            count: Number(item?.qty ?? item?.quantity ?? 1),
          })
        )
      );
    } catch (error) {
      ToastNotification(
        'error',
        error?.message || 'Failed to remove out-of-stock products.'
      );
    }
  };

  const handleRemoveHiddenProducts = async () => {
    const productUids = hiddenCartProducts
      .map(getCartItemProductUid)
      .filter(Boolean);

    if (!productUids.length) {
      return;
    }

    try {
      await removeCartItemsMutation.mutateAsync({ productUids });
    } catch (error) {
      ToastNotification(
        'error',
        error?.message || 'Failed to remove retailer-only products.'
      );
    }
  };

  const renderCartItem = (item, index) => {
    const product = item?.product || {};
    const variation = item?.variation || item?.variant || {};
    const pricing = item?.pricing || {};
    // console.log('Rendering cart item with pricing:', pricing);

    const image = getImageUrl(
      variation?.variation_image,
      variation?.image,
      item?.image,
      item?.product_thumbnail,
      product?.coverImage,
      product?.product_thumbnail
    );

    const name = product?.name || 'Product';
    const salePrice = Number(
      pricing?.snapPrice ??
      variation?.disPrice ??
      variation?.sale_price ??
      product?.sale_price ??
      0
    );
    const mrp = Number(
      pricing?.snapMrp ??
      variation?.mrp ??
      variation?.price ??
      product?.price ??
      0
    );
    const quantity = Number(
      item?.qty ?? item?.quantity ?? pricing?.quantity ?? 1
    );
    const payableAmount = Number(
      pricing?.payableAmount ?? salePrice * quantity
    );
    const couponDiscountAmount = Number(pricing?.discountCodeAmount ?? 0);
    const offerDiscountAmount = Number(pricing?.offerDiscountAmount ?? 0);
    const coinDiscountAmount = Number(
      pricing?.coinDiscountAmount ?? pricing?.coinDiscount ?? 0
    );
    const slabDiscountAmount = Number(pricing?.slabDiscountAmount ?? 0);
    const totalDiscountAmount =
      Math.max(0, couponDiscountAmount) +
      Math.max(0, offerDiscountAmount) +
      Math.max(0, coinDiscountAmount) +
      Math.max(0, slabDiscountAmount);
    const mrpTotal = mrp * quantity;

    return (
      <li
        className="order-item d-flex gap-1"
        key={`${item?.cartUid || item?.id || item?.product_id || item?.product?.uid || index}`}
      >
        <div className="align-items-center d-flex flex-grow-1 gap-2 w-100">
          <div className="thumb">
            <Image
              src={image}
              alt={name}
              width={48}
              height={48}
              draggable={false}
              unoptimized
              onClick={() => goToProductDetails(product?.slug)}
              style={{
                cursor: product?.slug ? 'pointer' : 'default',
              }}
            />
          </div>

          <div className="info">
            <span
              className="name"
              role="button"
              tabIndex={0}
              onClick={() => goToProductDetails(product?.slug)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  goToProductDetails(product?.slug);
                }
              }}
              style={{
                cursor: product?.slug ? 'pointer' : 'default',
              }}
            >
              {name}
            </span>
            <span className="meta">{variation?.name || ''}</span>
            {totalDiscountAmount > 0 && (
              <span className="meta success fw-bold d-block">
                Discount - {convertCurrency(totalDiscountAmount)}
              </span>
            )}
          </div>
        </div>

        <div className="d-flex flex-column justify-content-end align-items-end gap-2">
          <div className="cart_qty">
            <InputGroup>
              <Btn
                type="button"
                className="btn qty-left-minus"
                onClick={() => handleDecrease(item)}
              >
                <RiSubtractLine />
              </Btn>
              <Input
                className="input-number qty-input"
                type="text"
                name="quantity"
                value={quantity}
                readOnly
              />
              <Btn
                type="button"
                className="btn qty-right-plus"
                onClick={() => handleIncrease(item)}
              >
                <RiAddLine />
              </Btn>
            </InputGroup>
          </div>

          <div className="d-flex flex-row price gap-1">
            {mrpTotal > payableAmount && <del>{convertCurrency(mrpTotal)}</del>}
            <span className="current">{convertCurrency(payableAmount)}</span>
          </div>
        </div>
      </li>
    );
  };

  const renderGroupedCartSection = (group) => (
    <div
      className="cart-product-group order-summary-section mb-3"
      key={group.key}
    >
      <ul className="order-items">{group.items.map(renderCartItem)}</ul>
    </div>
  );

  const renderFreeCartValueItem = (item, index) => {
    const image = getImageUrl(item?.productImage, item?.image);
    const name = String(item?.productName || '').trim() || 'Free product';
    const variantName = String(item?.variantName || '').trim();
    const quantity = Math.max(1, Math.floor(Number(item?.quantity || 1)));
    const productSlug = String(item?.slug || '').trim();

    return (
      <li
        className="order-item"
        key={`${item?.variantUid || item?.productUid || index}`}
      >
        <div className="thumb">
          <Image
            src={image}
            alt={name}
            width={48}
            height={48}
            draggable={false}
            unoptimized
            onClick={() => goToProductDetails(productSlug)}
            style={{
              cursor: productSlug ? 'pointer' : 'default',
            }}
          />
        </div>

        <div className="info">
          <span
            className="name"
            role="button"
            tabIndex={0}
            onClick={() => goToProductDetails(productSlug)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                goToProductDetails(productSlug);
              }
            }}
            style={{
              cursor: productSlug ? 'pointer' : 'default',
            }}
          >
            {name}
          </span>
          <span className="meta">{variantName}</span>
        </div>

        <div className="cart_qty">
          <InputGroup>
            <Input
              className="input-number qty-input"
              type="text"
              name="quantity"
              value={quantity}
              readOnly
            />
          </InputGroup>
        </div>

        <div className="price">
          <span
            className="current"
            style={{ color: 'var(--theme-color)', fontWeight: 700 }}
          >
            FREE
          </span>
        </div>
      </li>
    );
  };

  return (
    <>
      <div className="cart-body-content">
        {hasAnyCartContent && (
          <>
            {/* Products List - Similar to Checkout Page */}
            <div
              className="cart-products-list"
              style={{ padding: '0 16px 0px' }}
            >
              {/* show products that are doctor only and cannot be bought */}
              {hasRestrictedItems && (
                <div className="alternative-products2 my-3">
                  <AlternativeProductList
                    products={restrictedCartProducts}
                    onRemoveAll={handleRemoveRestrictedProducts}
                    isRemoving={removeCartItemsMutation.isPending}
                    title="You cannot purchase these items."
                    reason="Please create a Vaidya account to purchase these items."
                    removeAriaLabel="Remove restricted products"
                  />
                </div>
              )}

              {/* show products that could be bought but currently are out of stock */}
              {hasOutOfStockItems && (
                <div className="alternative-products2 my-3">
                  <AlternativeProductList
                    products={outOfStockCartProducts}
                    onRemoveAll={handleRemoveOutOfStockProducts}
                    isRemoving={removeFromCartMutation.isPending}
                    title="These items are out of stock currently"
                    reason="Remove these items from the cart for now, or try again when the selected variant is back in stock."
                    removeAriaLabel="Remove out-of-stock products"
                  />
                </div>
              )}

              {/* {hasHiddenItems && (
                <div className="alternative-products2 my-3">
                  <AlternativeProductList
                    products={hiddenCartProducts}
                    onRemoveAll={handleRemoveHiddenProducts}
                    isRemoving={removeCartItemsMutation.isPending}
                    title="Retailer-only products in cart"
                    reason="These items are not available for purchase from this cart. Remove them and continue from the product details page if needed."
                    removeAriaLabel="Remove retailer-only products"
                  />
                </div>
              )} */}

              {((groupedCartProducts?.length ?? 0) > 0 ||
                (selectedFreeItems?.length ?? 0) > 0) && (
                  <div className="cart-product-group order-summary-section mb-3">
                    {/* 1. Render standard grouped cart items */}
                    {groupedCartProducts?.length > 0 &&
                      groupedCartProducts.map((group) => (
                        <ul className="order-items" key={group.key}>
                          {group.items.map(renderCartItem)}
                        </ul>
                      ))}

                    {/* 2. Render free items inside the SAME wrapper */}
                    {selectedFreeItems?.length > 0 && (
                      <ul className="order-items">
                        {selectedFreeItems.map(renderFreeCartValueItem)}
                      </ul>
                    )}
                  </div>
                )}

              {/* {hiddenCartProducts?.length > 0 && (
                <div className="alert alert-warning py-2 px-3 mb-0">
                  Some retailer-only products are excluded from checkout.
                </div>
              )} */}
            </div>

            <div className="mb-3" style={{ padding: '0px 16px 0' }}>
              <PrescriptionConsent
                cartItems={cartProducts}
                isAuthenticated={isAuthenticated}
                userData={userData}
                onRequireLogin={() => setLoginModalOpen(true)}
                onValidationChange={setPrescriptionState}
              />
            </div>

            {billDetails?.canApplySuperCoins && previewMaxUsableCoins > 0 && (
              <div className="mb-3" style={{ padding: '0 16px' }}>
                <SuperCoinsCard
                  key={`supercoins-${previewMaxUsableCoins}`}
                  isApplied={isSuperCoinsApplied}
                  onToggle={handleSuperCoinsToggle}
                  totalSuperCoinsAmount={billDetails.userSdlCoins}
                  coinValue={billDetails.coinValue}
                  appliedCoinsCount={selectedCoinUsedAmount}
                  resetHighlightSignal={coinResetHighlightSignal}
                  disabled={isCouponLoading || isCartPreviewBusy}
                />
              </div>
            )}

            {/* Coupon Section */}
            <div style={{ padding: '0 16px' }}>
              <ViewCouponAndOffer
                appliedCoupon={previewAppliedCouponCode}
                appliedCouponUid={previewAppliedCouponUid}
                appliedOffer={previewAppliedOffer}
                appliedOfferUid={appliedOfferUid}
                previewDiscounts={previewData?.discounts || null}
                cartItems={cartProducts}
                coinUsed={couponCoinUsed}
                isAuthenticated={isAuthenticated}
                onRequireLogin={() => setLoginModalOpen(true)}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
                onApplyOffer={handleApplyOffer}
                onRemoveOffer={handleRemoveOffer}
                onFreeItemsChange={setSelectedFreeItems}
                onCouponApplyingChange={setIsCouponLoading}
                showSelectedFreeProducts={false}
                isLoading={isCouponLoading || isCartPreviewBusy}
              />
            </div>

            {isAuthenticated && (
              <div style={{ padding: '16px 16px 0' }}>
                <GstInvoiceCard
                  onClick={() => setIsGstInvoiceModalOpen(true)}
                  isBillingSelected={isGstInvoiceSelected}
                  onBillingSelectionChange={setIsGstInvoiceSelected}
                  onBillingAddressChange={setGstBillingAddressUid}
                />
              </div>
            )}

            {billDetails?.earnableSdlCoins > 0 && (
              <div style={{ padding: '16px 16px 0' }}>
                <EarnSdlCoinsBanner
                  totalCoins={billDetails?.earnableSdlCoins}
                />
              </div>
            )}

            {/* show Order Summary only if there are eligible cart items */}
            {hasEligibleCartProducts && billDetails && (
              <div style={{ padding: '16px 16px 0' }}>
                <CheckoutOrderSummary summary={billDetails} />
              </div>
            )}
          </>
        )}
        {!hasAnyCartContent && (
          <div className="empty-cart-box-wrapper d-flex justify-content-center align-items-center h-100">
            <div className="empty-cart-box">
              <div className="empty-icon">
                <RiShoppingCartLine />
              </div>
              <h5>Your cart is currently empty.</h5>
              <Btn
                className="btn btn-sm btn-primary mt-3"
                onClick={() => {
                  router.push('/collections');
                  // router.refresh();
                  setCartCanvas(false);
                }}
                style={{
                  backgroundColor: 'var(--theme-color)',
                  color: '#fefefe',
                }}
              >
                Shop Now
              </Btn>
            </div>
          </div>
        )}
      </div>
      <CartVariationModal
        modal={modal}
        setModal={setModal}
        selectedVariation={selectedVariation}
      />

      <CustomModal
        modal={removePromptOpen}
        setModal={closeRemovePrompt}
        classes={{
          modalClass: 'theme-modal delete-modal',
          modalHeaderClass: 'p-0',
        }}
      >
        <div className="text-center p-4">
          <h5 className="modal-title mb-2">Remove Item?</h5>
          <p className="mb-4">
            Do you want to remove{' '}
            {/* pendingRemovalItem?.product?.name || */}
            {'this item'} from your cart.
            You can save it to your wishlist for later.
          </p>
          <div className="d-flex flex-wrap gap-2">
            <Btn
              title="Remove"
              color="secondary"
              className="btn btn-md fw-bold flex-grow-1 flex-shrink-0"
              onClick={() => handleRemoveWithWishlistOption(false)}
              disabled={
                removeFromCartMutation.isPending ||
                addToWishlistMutation.isPending
              }
            />
            <Btn
              title="Move to Wishlist"
              color="primary"
              className="btn-md fw-bold flex-grow-1 flex-shrink-0"
              onClick={() => handleRemoveWithWishlistOption(true)}
              disabled={
                removeFromCartMutation.isPending ||
                addToWishlistMutation.isPending
              }
            />
            {/* <Btn
              title="Cancel"
              className="btn btn-md btn-theme-outline fw-bold"
              onClick={closeRemovePrompt}
              disabled={
                removeFromCartMutation.isPending || addToWishlistMutation.isPending
              }
            /> */}
          </div>
        </div>
      </CustomModal>

      {isAuthenticated && (
        <ResponsiveModal
          modal={isGstInvoiceModalOpen}
          setModal={setIsGstInvoiceModalOpen}
          classes={{
            modalClass: 'theme-modal view-modal modal-md',
            modalHeaderClass: 'justify-content-between',
            title: 'GST Invoice Details',
          }}
          backdrop="static"
        >
          <div className="right-sidebar-box">
            <GstInvoiceForm
              setModal={setIsGstInvoiceModalOpen}
              onSaved={(response) => {
                const savedBillingUid =
                  response?.data?.uid ||
                  response?.data?.id ||
                  response?.data?.userId ||
                  '';

                if (savedBillingUid) {
                  setGstBillingAddressUid(savedBillingUid);
                }

                setIsGstInvoiceSelected(true);
              }}
              selectedAddress={selectedAddress}
            />
          </div>
        </ResponsiveModal>
      )}

      <OtpLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        setOpen={setLoginModalOpen}
      />
    </>
  );
};

export default HeaderCartBottom;
