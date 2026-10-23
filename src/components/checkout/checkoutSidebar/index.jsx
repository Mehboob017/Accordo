import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Card, Col, Input, InputGroup } from 'reactstrap';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import SidebarProduct from './SidebarProduct';
import CartContext from '@/helper/cartContext';
import PlaceOrder from './PlaceOrder';
import ViewCouponAndOffer from './ViewCouponAndOffer';
import CheckoutOrderSummary from './CheckoutOrderSummary';
import SuperCoinsCard from './SuperCoinsCard';
import GstInvoiceCard from './GstInvoiceCard';
import EarnSdlCoinsBanner from './EarnSdlCoinsBanner';
import AlternativeProductList from '@/layout/header/widgets/rightSideHeader/AlternativeProductList';
import UserContext from '@/helper/userContext';
import ResponsiveModal from '@/components/common/ResponsiveModal';
import GstInvoiceForm from './GstInvoiceForm';
import { clearCheckoutRequest, getCheckoutRequest } from '@/api/checkout.api';
import { useCheckout } from '@/utils/hooks/useCheckout';
import { useCartPreview } from '@/utils/hooks/useCart';
import { ToastNotification } from '@/utils/customFunctions/ToastNotification';
import OtpLoginModal from '@/components/auth/login/OtpLoginModal';
import PrescriptionConsent from '@/components/cart/PrescriptionConsent';
import {
  isDoctorUser,
  partitionCartItemsByAccess,
} from '@/utils/cart/cartUtils';
import { placeHolderImage } from '@/data/CommonPath';

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
      if (typeof source.url === 'string' && source.url.trim()) return source.url;
      if (typeof source.src === 'string' && source.src.trim()) return source.src;
    }
  }

  return placeHolderImage;
};

const CheckoutSidebar = ({
  values,
  setFieldValue,
  selectedShippingAddress,
  onAddAddress,
}) => {
  const checkoutDebugTag = '[CheckoutDebug]';
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [appliedCouponUid, setAppliedCouponUid] = useState('');
  const [appliedOfferUid, setAppliedOfferUid] = useState('');
  const [isSuperCoinsApplied, setIsSuperCoinsApplied] = useState(false);
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const [checkoutRequest, setCheckoutRequest] = useState(null);
  const [hasResolvedCheckoutRequest, setHasResolvedCheckoutRequest] =
    useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [isGstInvoiceModalOpen, setIsGstInvoiceModalOpen] = useState(false);
  const [isGstInvoiceSelected, setIsGstInvoiceSelected] = useState(false);
  const [gstBillingAddressUid, setGstBillingAddressUid] = useState('');
  const [selectedCoinUsedAmount, setSelectedCoinUsedAmount] = useState(0);
  const [selectedFreeItems, setSelectedFreeItems] = useState([]);
  const [otpModal, setOtpModal] = useState(false);
  const [prescriptionState, setPrescriptionState] = useState(
    DEFAULT_PRESCRIPTION_STATE
  );
  const prevCartRefreshKeyRef = useRef(null);
  const hasRedirectedRef = useRef(false);
  const {
    cartProducts,
    addToCartMutation,
    removeFromCartMutation,
    updateCheckoutItemQuantity,
    isLoading: isCartLoading,
  } = useContext(CartContext);
  const { userData, isAuthenticated } = useContext(UserContext);
  const router = useRouter();
  const {
    data: checkoutResponse,
    error: checkoutError,
    isError: isCheckoutError,
    isLoading: isCheckoutLoading,
  } = useCheckout(checkoutRequest);

  const checkoutMeta = checkoutResponse?.data;
  const remoteCheckoutProduct = checkoutMeta?.checkoutItem || null;
  const hasStandaloneRequest = Boolean(
    checkoutRequest?.productUid && checkoutRequest?.variantUid
  );
  const isStandaloneCheckout = Boolean(checkoutProduct);
  const isDoctor = isDoctorUser(userData);

  useEffect(() => {
    const storedCheckoutRequest = getCheckoutRequest();
    setCheckoutRequest(storedCheckoutRequest);
    setHasResolvedCheckoutRequest(true);
  }, []);

  useEffect(() => {
    if (!remoteCheckoutProduct) return;

    setCheckoutProduct((currentProduct) => {
      if (!currentProduct) {
        return remoteCheckoutProduct;
      }

      if (
        currentProduct?.product_id === remoteCheckoutProduct?.product_id &&
        currentProduct?.variation_id === remoteCheckoutProduct?.variation_id
      ) {
        return currentProduct;
      }

      return remoteCheckoutProduct;
    });
  }, [remoteCheckoutProduct]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const rawDraft = sessionStorage.getItem('checkout-offcanvas-data');
    if (!rawDraft) return;

    try {
      const parsedDraft = JSON.parse(rawDraft);

      if (parsedDraft?.appliedCoupon) {
        setAppliedCoupon(parsedDraft.appliedCoupon);
      }

      if (parsedDraft?.appliedCouponUid) {
        setAppliedCouponUid(parsedDraft.appliedCouponUid);
      }

      if (typeof parsedDraft?.isSuperCoinsApplied === 'boolean') {
        setIsSuperCoinsApplied(parsedDraft.isSuperCoinsApplied);
      }
    } catch (error) {
      console.error('Unable to parse checkout-offcanvas-data', error);
    }
  }, []);

  useEffect(() => {
    if (!isCheckoutError || !checkoutError?.message) {
      return;
    }

    ToastNotification('error', checkoutError.message);
  }, [checkoutError?.message, isCheckoutError]);

  useEffect(() => {
    if (
      !hasResolvedCheckoutRequest ||
      isCheckoutLoading ||
      isCartLoading ||
      hasRedirectedRef.current
    ) {
      return;
    }

    if (hasStandaloneRequest) {
      if (remoteCheckoutProduct || checkoutProduct) {
        return;
      }

      if (!isAuthenticated) {
        return;
      }

      hasRedirectedRef.current = true;
      router.back();
      return;
    }

    if (cartProducts?.length > 0) {
      return;
    }

    if (!isAuthenticated) {
      return;
    }

    ToastNotification('error', 'Your cart has no eligible items to continue.');

    hasRedirectedRef.current = true;
    router.back();
  }, [
    cartProducts,
    checkoutProduct,
    hasResolvedCheckoutRequest,
    hasStandaloneRequest,
    isAuthenticated,
    isCartLoading,
    isCheckoutLoading,
    remoteCheckoutProduct,
    router,
  ]);

  const sourceCheckoutProducts = useMemo(() => {
    if (checkoutProduct) {
      return [checkoutProduct];
    }

    return cartProducts;
  }, [checkoutProduct, cartProducts]);

  const {
    eligibleItems: checkoutProducts,
    restrictedItems: restrictedCheckoutProducts,
    outOfStockItems: outOfStockCheckoutProducts,
    hiddenItems: hiddenCheckoutProducts,
  } = useMemo(
    () => partitionCartItemsByAccess(sourceCheckoutProducts, isDoctor),
    [sourceCheckoutProducts, isDoctor]
  );

  const coinUsedForPreview = useMemo(() => {
    if (!isSuperCoinsApplied) {
      return 0;
    }

    return Math.max(0, Math.floor(Number(selectedCoinUsedAmount || 0)));
  }, [isSuperCoinsApplied, selectedCoinUsedAmount]);

  const cartPreviewRefreshKey = useMemo(
    () =>
      (Array.isArray(sourceCheckoutProducts) ? sourceCheckoutProducts : [])
        .map((item) =>
          [
            String(item?.product_id || ''),
            String(item?.variation_id || ''),
            String(item?.quantity || 0),
          ].join(':')
        )
        .sort()
        .join('|'),
    [sourceCheckoutProducts]
  );

  const checkoutPreviewPayload = useMemo(() => {
    const payload = {
      couponCode: appliedCoupon,
      offerUid: appliedOfferUid,
      coinUsed: coinUsedForPreview,
    };

    if (isStandaloneCheckout && checkoutProduct) {
      const productUid = String(
        checkoutProduct?.product_id || checkoutProduct?.product?.id || ''
      ).trim();
      const variantUid = String(
        checkoutProduct?.variation_id || checkoutProduct?.variation?.id || ''
      ).trim();
      const qty = Math.max(
        1,
        Math.floor(Number(checkoutProduct?.quantity || 1))
      );

      if (productUid && variantUid) {
        payload.buyNow = {
          productUid,
          variantUid,
          qty,
        };
      }
    }

    return payload;
  }, [
    appliedCoupon,
    appliedOfferUid,
    coinUsedForPreview,
    isStandaloneCheckout,
    checkoutProduct,
  ]);

  const {
    data: cartPreviewResponse,
    isLoading: isCartPreviewLoading,
    isFetching: isCartPreviewFetching,
    refetch: refetchCartPreview,
  } = useCartPreview(
    checkoutPreviewPayload,
    {
      enabled: hasStandaloneRequest
        ? Boolean(checkoutProduct)
        : hasResolvedCheckoutRequest,
      keepPreviousData: true,
    },
    cartPreviewRefreshKey
  );

  const previewData = cartPreviewResponse?.data;
  const previewAppliedOffer = previewData?.discounts?.offer ?? null;
  const previewAppliedCoupon = previewData?.discounts?.coupon ?? null;
  const previewAppliedCouponCode = String(
    previewAppliedCoupon?.code || ''
  ).trim();
  const previewAppliedCouponUid = String(
    previewAppliedCoupon?.uid || ''
  ).trim();
  const isCartQtyMutationPending =
    Boolean(addToCartMutation?.isPending) ||
    Boolean(removeFromCartMutation?.isPending);
  const wasCartQtyMutationPendingRef = useRef(false);
  const previewMaxUsableCoins = useMemo(() => {
    const resolvedCount = Number(
      cartPreviewResponse?.data?.superCoins?.maxUsable ?? 0
    );

    return Number.isFinite(resolvedCount)
      ? Math.max(0, Math.floor(resolvedCount))
      : 0;
  }, [cartPreviewResponse?.data?.superCoins?.maxUsable]);
  const isCartPreviewBusy = isCartPreviewLoading || isCartPreviewFetching;

  useEffect(() => {
    if (!hasResolvedCheckoutRequest || isStandaloneCheckout) {
      return;
    }

    if (isCartQtyMutationPending) {
      wasCartQtyMutationPendingRef.current = true;
      return;
    }

    if (wasCartQtyMutationPendingRef.current) {
      wasCartQtyMutationPendingRef.current = false;
      refetchCartPreview();
    }
  }, [
    hasResolvedCheckoutRequest,
    isStandaloneCheckout,
    isCartQtyMutationPending,
    refetchCartPreview,
  ]);

  useEffect(() => {
    if (!appliedOfferUid || !previewData?.discounts) {
      return;
    }

    if (previewData.discounts.offer === null) {
      setAppliedOfferUid('');
      ToastNotification(
        'info',
        'Offer removed because the updated cart is not eligible.'
      );
    }
  }, [appliedOfferUid, previewData?.discounts]);

  const previewCheckoutProducts = previewData?.items?.buyable ?? [];
  const previewRestrictedCheckoutProducts =
    previewData?.items?.unavailable ?? [];
  const previewOutOfStockCheckoutProducts =
    previewData?.items?.outOfStock ?? [];

  const displayCheckoutProducts = previewData
    ? previewCheckoutProducts
    : checkoutProducts;
  const displayRestrictedCheckoutProducts = previewData
    ? previewRestrictedCheckoutProducts
    : restrictedCheckoutProducts;
  const displayOutOfStockCheckoutProducts = previewData
    ? previewOutOfStockCheckoutProducts
    : outOfStockCheckoutProducts;
  const displayHiddenCheckoutProducts = hiddenCheckoutProducts;

  const hasIneligibleCheckoutProducts =
    displayRestrictedCheckoutProducts.length > 0 ||
    displayOutOfStockCheckoutProducts.length > 0 ||
    displayHiddenCheckoutProducts.length > 0;
  const hasAnyCheckoutProducts =
    displayCheckoutProducts.length > 0 || hasIneligibleCheckoutProducts;
  const billDetails = previewData?.summary || null;
  const resolvedCoinUsedCount = useMemo(() => {
    if (previewMaxUsableCoins <= 0) {
      return 0;
    }

    return previewMaxUsableCoins;
  }, [previewMaxUsableCoins]);

  const couponCoinUsed = useMemo(() => {
    if (!isSuperCoinsApplied) {
      return 0;
    }

    return Math.max(0, Math.floor(Number(selectedCoinUsedAmount || 0)));
  }, [isSuperCoinsApplied, selectedCoinUsedAmount]);

  const checkoutCoinSummary = useMemo(() => {
    const safeItems = Array.isArray(displayCheckoutProducts)
      ? displayCheckoutProducts
      : [];

    return safeItems.reduce(
      (accumulator, item) => {
        const coinsPerUnit = Number(item?.variation?.coinsCount);
        const quantity = Number(item?.quantity || 1);

        if (!Number.isFinite(coinsPerUnit) || coinsPerUnit <= 0) {
          return accumulator;
        }

        accumulator.hasProductsWithCoins = true;
        accumulator.totalCoins +=
          Math.floor(coinsPerUnit) * Math.max(1, quantity);
        return accumulator;
      },
      {
        hasProductsWithCoins: false,
        totalCoins: 0,
      }
    );
  }, [displayCheckoutProducts]);

  const coinBannerTotalCoins = Math.max(
    Number(billDetails?.earnableSdlCoins) || 0,
    checkoutCoinSummary.totalCoins
  );

  const shouldShowEarnCoinsBanner =
    checkoutCoinSummary.hasProductsWithCoins && coinBannerTotalCoins > 0;

  const handleStandaloneQuantityChange = (delta) => {
    setCheckoutProduct((currentProduct) => {
      if (!currentProduct) {
        return currentProduct;
      }

      const stockLimit = Number(
        currentProduct?.variation?.quantity ??
          currentProduct?.product?.quantity ??
          0
      );
      const currentQuantity = Number(currentProduct?.quantity || 1);

      if (delta > 0 && stockLimit > 0 && currentQuantity >= stockLimit) {
        ToastNotification(
          'error',
          `Only ${stockLimit} item${stockLimit === 1 ? '' : 's'} available.`
        );
        return currentProduct;
      }

      const nextQuantity = Math.max(
        1,
        stockLimit > 0
          ? Math.min(currentQuantity + delta, stockLimit)
          : currentQuantity + delta
      );

      const salePrice = Number(
        currentProduct?.sale_price ||
          currentProduct?.variation?.sale_price ||
          currentProduct?.product?.sale_price ||
          currentProduct?.price ||
          0
      );

      return {
        ...currentProduct,
        quantity: nextQuantity,
        sub_total: salePrice * nextQuantity,
      };
    });
  };

  const handleCheckoutQuantityChange = (item, delta) => {
    if (isStandaloneCheckout) {
      handleStandaloneQuantityChange(delta);
      return;
    }

    const currentQuantity = Number(item?.quantity || 1);

    if (delta < 0 && currentQuantity <= 1) {
      return;
    }

    updateCheckoutItemQuantity(item, delta);
  };

  const isCheckoutDisabled =
    !billDetails ||
    !displayCheckoutProducts?.length ||
    displayCheckoutProducts.some(
      (item) => item?.variation?.inStockFlag === false
    );
  const hasPrescriptionBlocker =
    prescriptionState?.isPrescriptionRequired &&
    !prescriptionState?.isValid &&
    !prescriptionState?.isHydrating;
  const prescriptionWarningMessage =
    prescriptionState?.error ||
    prescriptionState?.requirementError ||
    'Prescription is required to proceed';
  const isCheckoutUiLoading =
    isCheckoutLoading ||
    (!hasStandaloneRequest && isCartLoading) ||
    isCouponLoading ||
    isCartPreviewBusy;

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
  }, [cartPreviewRefreshKey, isSuperCoinsApplied]);

  useEffect(() => {
    if (!isSuperCoinsApplied || !billDetails) {
      return;
    }

    if (billDetails?.canApplySuperCoins === false) {
      setIsSuperCoinsApplied(false);
      setSelectedCoinUsedAmount(0);
    }
  }, [billDetails, isSuperCoinsApplied]);

  if (
    (!hasResolvedCheckoutRequest ||
      isCheckoutLoading ||
      (!hasStandaloneRequest && isCartLoading)) &&
    !hasAnyCheckoutProducts
  ) {
    return null;
  }

  if (
    isAuthenticated &&
    !isCheckoutLoading &&
    !isCartLoading &&
    !hasAnyCheckoutProducts
  ) {
    return null;
  }

  const handleRemoveRestrictedStandaloneProducts = () => {
    if (!isStandaloneCheckout) {
      return;
    }
    clearCheckoutRequest();
    setCheckoutProduct(null);
  };

  const onApplyCoupon = (couponData) => {
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

    // 2. Remove any applied offer
    setAppliedOfferUid('');
    setSelectedFreeItems([]);
  };

  const onRemoveCoupon = () => {
    setAppliedCoupon('');
    setAppliedCouponUid('');
  };

  const onApplyOffer = (offerData) => {
    const isObjectPayload =
      offerData && typeof offerData === 'object' && !Array.isArray(offerData);
    const offerUid = String(
      isObjectPayload ? offerData?.offerUid || offerData?.uid : offerData || ''
    ).trim();

    // 1. Apply the offer
    setAppliedOfferUid(offerUid);
    setSelectedFreeItems([]);

    // 2. Remove any applied coupon
    setAppliedCoupon('');
    setAppliedCouponUid('');
  };

  const onRemoveOffer = () => {
    setAppliedOfferUid('');
    setSelectedFreeItems([]);
  };

  const handleSuperCoinsToggle = (nextApplied) => {
    const shouldApply = Boolean(nextApplied);

    if (!shouldApply) {
      setIsSuperCoinsApplied(false);
      setSelectedCoinUsedAmount(0);
      return;
    }

    const resolvedCoinAmount = resolvedCoinUsedCount;

    setSelectedCoinUsedAmount(resolvedCoinAmount);
    setIsSuperCoinsApplied(true);
  };

  const goToProductDetails = (productSlug) => {
    if (!productSlug) {
      return;
    }

    router.push(`/products/${productSlug}`);
  };

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
    <Col xl="5">
      <Card
        className="pos-detail-card"
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        {isCheckoutUiLoading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255, 255, 255, 0.55)',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--title-color)',
            }}
            role="status"
            aria-live="polite"
          >
            <div className="spinner-border text-primary" aria-hidden="true" />
            <span>Updating checkout...</span>
          </div>
        )}
        <div
          style={{
            opacity: isCheckoutUiLoading ? 0.55 : 1,
            transition: 'opacity 0.2s ease',
          }}
        >
          <div className="title-header">
            <h5 className="fw-bold">Checkout</h5>
          </div>

          <SidebarProduct
            values={values}
            setFieldValue={setFieldValue}
            checkoutProducts={displayCheckoutProducts}
            isInstantBuy={isStandaloneCheckout}
            isLoading={
              hasStandaloneRequest
                ? (isCheckoutLoading && !checkoutProduct) || isCartPreviewBusy
                : isCartLoading || isCartPreviewBusy
            }
            emptyMessage="No eligible items in the checkout."
            showQuantityControls
            onIncrease={(item) => handleCheckoutQuantityChange(item, 1)}
            onDecrease={(item) => handleCheckoutQuantityChange(item, -1)}
          />

          {selectedFreeItems?.length > 0 && (
            <div>
              <ul className="order-items mb-0">
                {selectedFreeItems.map(renderFreeCartValueItem)}
              </ul>
            </div>
          )}

          {displayRestrictedCheckoutProducts?.length > 0 && (
            <div className="mt-3">
              <AlternativeProductList
                products={displayRestrictedCheckoutProducts}
                onRemoveAll={handleRemoveRestrictedStandaloneProducts}
                isRemoving={false}
                title="You cannot purchase these items."
                reason="Please create a Vaidya account to purchase these items."
                removeAriaLabel="Remove restricted products"
                hideCloseButton={true}
              />
            </div>
          )}

          {displayOutOfStockCheckoutProducts?.length > 0 && (
            <div className="mt-3">
              <AlternativeProductList
                products={displayOutOfStockCheckoutProducts}
                onRemoveAll={handleRemoveRestrictedStandaloneProducts}
                isRemoving={false}
                title="These items are out of stock currently"
                reason="Remove these items from the checkout for now, or try again when the selected variant is back in stock."
                removeAriaLabel="Remove out-of-stock products"
                hideCloseButton={true}
              />
            </div>
          )}

          {billDetails?.canApplySuperCoins && (
            <div className="mt-3">
              <SuperCoinsCard
                isApplied={isSuperCoinsApplied}
                onToggle={handleSuperCoinsToggle}
                totalSuperCoinsAmount={billDetails.userSdlCoins}
                coinValue={billDetails.coinValue}
                appliedCoinsCount={selectedCoinUsedAmount}
                disabled={isCheckoutUiLoading}
              />
            </div>
          )}

          <div className="mt-3">
            <PrescriptionConsent
              cartItems={displayCheckoutProducts}
              isAuthenticated={isAuthenticated}
              userData={userData}
              onRequireLogin={() => setOtpModal(true)}
              onValidationChange={setPrescriptionState}
            />
          </div>

          <div className="mt-3">
            <ViewCouponAndOffer
              appliedCoupon={previewAppliedCouponCode}
              appliedCouponUid={previewAppliedCouponUid}
              appliedOffer={previewAppliedOffer}
              appliedOfferUid={appliedOfferUid}
              previewDiscounts={previewData?.discounts || null}
              cartItems={displayCheckoutProducts}
              coinUsed={couponCoinUsed}
              isAuthenticated={isAuthenticated}
              onRequireLogin={() => setOtpModal(true)}
              onApplyCoupon={onApplyCoupon}
              onRemoveCoupon={onRemoveCoupon}
              onApplyOffer={onApplyOffer}
              onRemoveOffer={onRemoveOffer}
              onFreeItemsChange={setSelectedFreeItems}
              onCouponApplyingChange={setIsCouponLoading}
              showSelectedFreeProducts={false}
              isLoading={isCouponLoading || isCartPreviewBusy}
            />
          </div>

          {isAuthenticated && (
            <>
              <div className="mt-3">
                <GstInvoiceCard
                  onClick={() => setIsGstInvoiceModalOpen(true)}
                  isBillingSelected={isGstInvoiceSelected}
                  onBillingSelectionChange={setIsGstInvoiceSelected}
                  onBillingAddressChange={setGstBillingAddressUid}
                />
              </div>

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
                    selectedAddress={selectedShippingAddress}
                  />
                </div>
              </ResponsiveModal>
            </>
          )}

          {shouldShowEarnCoinsBanner && (
            <div className="mt-3">
              <EarnSdlCoinsBanner totalCoins={coinBannerTotalCoins} />
            </div>
          )}

          {billDetails && (
            <div className="mt-3">
              <CheckoutOrderSummary summary={billDetails} />
            </div>
          )}

          <div className="mt-3 checkout-button-wrapper">
            {/* {hasPrescriptionBlocker && (
              <div
                style={{
                  marginBottom: 10,
                  borderRadius: 10,
                  border: '1px solid #f2c26b',
                  background: '#fff6e7',
                  color: '#7a5100',
                  fontSize: 12,
                  fontWeight: 600,
                  lineHeight: 1.4,
                  padding: '8px 10px',
                }}
              >
                {prescriptionWarningMessage}
              </div>
            )} */}
            <PlaceOrder
              values={values}
              cartProducts={displayCheckoutProducts}
              billDetails={billDetails}
              instantBuyProduct={checkoutProduct}
              isStandaloneCheckout={isStandaloneCheckout}
              disabled={isCheckoutDisabled || isCheckoutUiLoading}
              prescriptionState={prescriptionState}
              couponUid={previewAppliedCouponUid || ''}
              offerUid={appliedOfferUid || ''}
              coinUsed={isSuperCoinsApplied ? couponCoinUsed : 0}
              freeItems={selectedFreeItems}
              getGstInvoice={isGstInvoiceSelected}
              billingAddressUid={
                isGstInvoiceSelected ? gstBillingAddressUid : ''
              }
              shippingAddressUid={values?.shipping_address_id || ''}
              onAddAddress={onAddAddress}
            />
          </div>
        </div>
      </Card>

      <OtpLoginModal isOpen={otpModal} setOpen={setOtpModal} />
    </Col>
  );
};

export default CheckoutSidebar;