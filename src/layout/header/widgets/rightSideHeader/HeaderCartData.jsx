'use client';

import React, { useContext, useEffect, useState, useMemo, useRef } from 'react';
import {
  RiCloseLine,
  RiCloseFill,
  RiArrowDownSLine,
  RiBuildingLine,
} from 'react-icons/ri';
import { Offcanvas, OffcanvasBody, OffcanvasHeader } from 'reactstrap';
import { useRouter } from 'next/navigation';
import CartContext from '@/helper/cartContext';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import UserContext from '@/helper/userContext';
import HeaderCartBottom from './HeaderCartBottom';
import ResponsiveModal from '@/components/common/ResponsiveModal';
import AddAddressForm from '@/components/checkout/common/AddAddressForm';
import OtpLoginModal from '@/components/auth/login/OtpLoginModal';
import {
  useAddCustomerAddress,
  useCustomerAddresses,
} from '@/utils/hooks/useCustomerAddress';
import { formatAddress } from '@/utils/helpers';
import { ToastNotification } from '@/utils/customFunctions/ToastNotification';
import { verifyOrderPayment } from '@/api/checkout.api';
import { openRazorpayCheckout } from '@/utils/payment/razorpayCheckout';
import { RZP_PAYMENT_METHOD } from '@/utils/constants';
import { buildOrderPrescriptionPayload } from '@/utils/prescription/prescriptionPayload';
import { clearDraftPrescriptionFiles } from '@/utils/prescription/prescriptionStorage';
import { usePaymentCancel, usePlaceOrder } from '@/utils/hooks/useMyOrders';
import { capitalizeWords } from '@/utils/customFunctions/Capitalize';

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

const HeaderCartData = ({ cartStyle }) => {
  const { setCartCanvas, cartCanvas } = useContext(ThemeOptionContext);
  const [shippingCal, setShippingCal] = useState(0);
  const [modal, setModal] = useState(false);
  const {
    isLoading: isCartLoading,
    addToCartMutation,
    removeFromCartMutation,
    removeCartItemsMutation,
  } = useContext(CartContext);
  const { userData, isAuthenticated } = useContext(UserContext);
  const { data: customerAddressesData, isLoading: isAddressesLoading } =
    useCustomerAddresses({
      enabled: isAuthenticated,
    });
  const router = useRouter();
  const [otpModal, setOtpModal] = useState(false);
  const [addressModal, setAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [showAddressLimitModal, setShowAddressLimitModal] = useState(false);
  const [isProceedingToCheckout, setIsProceedingToCheckout] = useState(false);
  const [checkoutState, setCheckoutState] = useState({
    appliedCoupon: '',
    appliedCouponUid: '',
    appliedOfferUid: '',
    appliedCouponDiscountAmount: 0,
    isSuperCoinsApplied: false,
    billDetails: null,
    isGstInvoiceSelected: false,
    gstBillingAddressUid: '',
    hasInvalidCartItems: false,
    prescriptionState: DEFAULT_PRESCRIPTION_STATE,
    isPreviewLoading: false,
    buyableItems: [],
    freeItems: [],
  });

  const addressDropdownRef = useRef(null);
  const userSelectedManuallyRef = useRef(false); // FIX 1: Track if user manually overrode the default address

  const activeBillDetails = checkoutState?.billDetails || null;
  const shippingFreeAmt = Number(activeBillDetails?.freeShippingThreshold || 0);

  // Mutation for adding address
  const { mutate: addAddressMutate, isPending: isAddingAddress } =
    useAddCustomerAddress({
      onSuccess: () => {
        setAddressModal(false);
        userSelectedManuallyRef.current = false; // FIX 2: Reset the tracker so the newly added default address gets auto-selected
      },
    });

  const { mutateAsync: markPaymentFailed } = usePaymentCancel();

  useEffect(() => {
    if (!shippingFreeAmt || !activeBillDetails) {
      setShippingCal(0);
      return;
    }

    let tempCal =
      (Number(activeBillDetails?.subtotal || 0) * 100) / shippingFreeAmt;
    if (tempCal > 100) {
      tempCal = 100;
    }
    setShippingCal(tempCal);
  }, [activeBillDetails, shippingFreeAmt]);

  const userAddresses = useMemo(() => {
    const addresses = Array.isArray(customerAddressesData?.data?.addresses)
      ? customerAddressesData.data.addresses
      : [];

    return addresses.filter((address) => address?.type === 'shipping');
  }, [customerAddressesData?.data?.addresses]);

  // FIX 3: Prioritize defaultFlag and respect manual selections vs fresh additions
  useEffect(() => {
    if (!userAddresses || userAddresses.length === 0) {
      if (selectedAddress !== null) setSelectedAddress(null);
      return;
    }

    // Find the backend default (or fallback to the first address if none are flagged)
    const backendDefault =
      userAddresses.find((a) => a.defaultFlag === true) || userAddresses[0];

    // If the user hasn't actively clicked a different address in the dropdown
    if (!userSelectedManuallyRef.current) {
      if (selectedAddress?.uid !== backendDefault.uid) {
        setSelectedAddress(backendDefault);
      }
    } else {
      // If user did manually select an address, verify it still exists in the list
      const exists = userAddresses.find((a) => a.uid === selectedAddress?.uid);
      if (exists) {
        if (selectedAddress !== exists) {
          setSelectedAddress(exists);
        }
      } else {
        // If their manually selected address was deleted, revert to default
        setSelectedAddress(backendDefault);
        userSelectedManuallyRef.current = false;
      }
    }
  }, [userAddresses, selectedAddress]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        addressDropdownRef.current &&
        !addressDropdownRef.current.contains(event.target)
      ) {
        setShowAddressDropdown(false);
      }
    };

    if (showAddressDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddressDropdown]);

  const buyableCartItems = Array.isArray(checkoutState?.buyableItems)
    ? checkoutState.buyableItems
    : [];
  const totalCartQuantity = Math.max(
    0,
    Number(activeBillDetails?.totalItems || 0)
  );
  const hasEligibleCartProducts =
    Number(activeBillDetails?.totalItems || 0) > 0;
  const noEligibleItemsLabel = 'No eligible items to purchase';
  const prescriptionState =
    checkoutState?.prescriptionState || DEFAULT_PRESCRIPTION_STATE;
  const hasPrescriptionBlocker =
    prescriptionState?.isPrescriptionRequired &&
    !prescriptionState?.isValid &&
    !prescriptionState?.isHydrating;
  const prescriptionWarningMessage =
    prescriptionState?.error ||
    prescriptionState?.requirementError ||
    'Prescription is required to proceed';
  const isCartAsyncLoading =
    isCartLoading ||
    isAddressesLoading ||
    isAddingAddress ||
    isProceedingToCheckout ||
    checkoutState?.isPreviewLoading ||
    addToCartMutation?.isPending ||
    removeFromCartMutation?.isPending ||
    removeCartItemsMutation?.isPending;

  const { mutate: submitOrder } = usePlaceOrder({
    onSuccess: async (response) => {
      const data = response?.data;
      const clearPrescriptionDraftsOnSuccess = async () => {
        try {
          await clearDraftPrescriptionFiles();
        } catch (error) {
          // Keep order success flow unaffected if local cleanup fails.
        }
      };

      if (!data?.razorpay) {
        await clearPrescriptionDraftsOnSuccess();
        setCartCanvas(false);
        setIsProceedingToCheckout(false);
        if (data?.trxUid) sessionStorage.setItem('_osTrxUid', data.trxUid);
        router.replace(
          `/order-success?orderId=${encodeURIComponent(data?.orderNumber || '')}`
        );
        return;
      }

      if (!data?.trxUid) {
        setIsProceedingToCheckout(false);
        ToastNotification('error', 'Payment initialization failed');
        return;
      }

      try {
        const { verifyData, razorpayResponse } = await openRazorpayCheckout({
          razorpayData: data.razorpay,
          trxUid: data.trxUid,
          verifyPayment: verifyOrderPayment,
          onCancelled: async () => {
            try {
              await markPaymentFailed({
                razorpay_order_id: data?.razorpay?.orderId,
                razorpay_payment_id: '',
                trxUid: data?.trxUid,
              });
            } catch (error) {
              console.error('Failed to mark payment as failed', error);
            }
            ToastNotification('info', 'Payment cancelled');
          },
        });

        const resolvedOrderId =
          verifyData?.data?.orderNumber || data?.orderNumber || '';
        await clearPrescriptionDraftsOnSuccess();
        setCartCanvas(false);
        if (data?.trxUid) sessionStorage.setItem('_osTrxUid', data.trxUid);
        router.replace(
          `/order-success?orderId=${encodeURIComponent(resolvedOrderId)}`
        );
      } catch (error) {
        if (error?.message !== 'Payment cancelled') {
          ToastNotification(
            'error',
            error?.message || 'Payment could not be completed'
          );
        }
      } finally {
        setIsProceedingToCheckout(false);
      }
    },
    onError: (error) => {
      setIsProceedingToCheckout(false);
      ToastNotification(
        'error',
        error?.message || 'Failed to place order. Please try again.'
      );
    },
  });

  const handleAddAddressClick = () => {
    if (isAddingAddress) return;
    if (!isAuthenticated) {
      setOtpModal(true);
      return;
    }
    if (userAddresses.length >= 20) {
      setShowAddressLimitModal(true);
      return;
    }
    setAddressModal(true);
  };

  const handleProceedToCheckout = async () => {
    if (isProceedingToCheckout || isAddingAddress) {
      return;
    }

    if (buyableCartItems?.length > 0 && !selectedAddress) {
      ToastNotification('error', 'Please select a delivery address.');
      return;
    }

    if (!buyableCartItems || buyableCartItems.length === 0) {
      ToastNotification(
        'error',
        'Your cart has no eligible items to purchase.'
      );
      return;
    }

    if (hasPrescriptionBlocker) {
      ToastNotification('error', prescriptionWarningMessage);
      return;
    }

    setIsProceedingToCheckout(true);

    const selectedShippingAddressUid = selectedAddress?.uid;
    const resolvedShippingAddressUid = selectedShippingAddressUid || '';
    const resolvedBillingAddressUid = checkoutState?.isGstInvoiceSelected
      ? checkoutState?.gstBillingAddressUid || resolvedShippingAddressUid
      : resolvedShippingAddressUid;
    const safeCoinValue = Number(activeBillDetails?.coinValue || 0);
    const safeSuperCoinDiscount = Number(
      activeBillDetails?.superCoinDiscount || 0
    );
    const resolvedCoinUsed =
      checkoutState?.isSuperCoinsApplied && safeCoinValue > 0
        ? Math.max(0, Math.floor(safeSuperCoinDiscount / safeCoinValue))
        : 0;

    try {
      const prescriptions = prescriptionState?.isPrescriptionRequired
        ? await buildOrderPrescriptionPayload(prescriptionState?.uploadedFiles)
        : [];

      const orderPayload = {
        customerUid: userData?.uid,
        billingAddressUid: resolvedBillingAddressUid,
        shippingAddressUid: resolvedShippingAddressUid,
        paymentMode: RZP_PAYMENT_METHOD,
        couponUid: checkoutState?.appliedCouponUid || '',
        offerUid: checkoutState?.appliedOfferUid || '',
        coinUsed: resolvedCoinUsed,
        addThrough: 'Website',
        note: '',
        getGstInvoice: Boolean(checkoutState?.isGstInvoiceSelected),
        prescriptions,
        items: buyableCartItems.map((item) => ({
          variantUid: item?.variation_id || '',
          quantity: Number(item?.quantity || 1),
        })),
        freeItems: (Array.isArray(checkoutState?.freeItems)
          ? checkoutState.freeItems
          : []
        )
          .map((item) => ({
            variantUid: String(item?.variantUid || '').trim(),
            quantity: Math.max(1, Math.floor(Number(item?.quantity || 1))),
          }))
          .filter((item) => Boolean(item?.variantUid)),
      };

      submitOrder(orderPayload);
    } catch (error) {
      setIsProceedingToCheckout(false);
      ToastNotification(
        'error',
        error?.message || 'Prescription upload failed. Please try again.'
      );
    }
  };

  return (
    <>
      {cartStyle == 'cart_sidebar' ? (
        <Offcanvas
          direction="end"
          isOpen={cartCanvas}
          toggle={() => setCartCanvas(false)}
          className={`cart-offcanvas ${isCartAsyncLoading ? 'is-updating' : ''}`}
          aria-busy={isCartAsyncLoading}
        >
          <OffcanvasHeader toggle={null}>
            <div className="d-flex align-items-center justify-content-between w-100">
              <span className="header-text">
                <h4 className="id">Shopping Cart</h4>
                {totalCartQuantity > 0 && (
                  <span className="item-count">
                    ({totalCartQuantity}{' '}
                    {totalCartQuantity === 1 ? 'item' : 'items'})
                  </span>
                )}
              </span>
              <button
                type="button"
                className="close-btn"
                onClick={() => setCartCanvas(false)}
                aria-label="Close"
              >
                <RiCloseFill />
              </button>
            </div>
          </OffcanvasHeader>
          <div className="cart-content-shell">
            <OffcanvasBody className="cart-body" data-lenis-prevent>
              <HeaderCartBottom
                modal={modal}
                setModal={setModal}
                shippingCal={shippingCal}
                shippingFreeAmt={shippingFreeAmt}
                onCheckoutDataChange={setCheckoutState}
                selectedAddress={selectedAddress}
              />
            </OffcanvasBody>
            {totalCartQuantity > 0 && (
              <div className="cart-footer">
                {isAuthenticated && userAddresses?.length > 0 ? (
                  <>
                    {/* Delivery Address Section */}
                    <div
                      className="delivery-address-section"
                      ref={addressDropdownRef}
                    >
                      <div
                        className="delivery-location-header"
                        onClick={() =>
                          setShowAddressDropdown(!showAddressDropdown)
                        }
                      >
                        <div className="location-icon-wrapper">
                          <RiBuildingLine />
                        </div>

                        <div className="location-content">
                          <div className="location-title">
                            Delivering to{' '}
                            {selectedAddress?.addressType || 'the address'}
                            <RiArrowDownSLine
                              className={`dropdown-icon ${showAddressDropdown ? 'open' : ''}`}
                            />
                          </div>

                          <div className="location-user-info text-capitalize">
                            {capitalizeWords(selectedAddress?.firstName)}{' '}
                            {capitalizeWords(selectedAddress?.lastName)} |{' '}
                            {selectedAddress?.countryCode}{' '}
                            {selectedAddress?.phone}
                          </div>

                          <div className="location-address">
                            {selectedAddress
                              ? formatAddress(selectedAddress)
                              : 'Select an address'}
                          </div>
                        </div>
                      </div>

                      {/* Address Dropdown */}
                      {showAddressDropdown && (
                        <div className="address-dropdown" data-lenis-prevent>
                          {userAddresses.map((address) => (
                            <div
                              key={address.uid}
                              className={`address-option ${selectedAddress?.uid === address.uid
                                ? 'active'
                                : ''
                                }`}
                              onClick={() => {
                                // FIX 4: Flag that the user made a manual choice
                                setSelectedAddress(address);
                                userSelectedManuallyRef.current = true;
                                setShowAddressDropdown(false);
                              }}
                            >
                              <div className="address-option-title">
                                {address.addressType || 'Address'}
                              </div>

                              <div className="address-option-details">
                                <span>
                                  {capitalizeWords(address.firstName)}{' '}
                                  {capitalizeWords(address.lastName)}{' '}
                                </span>{' '}
                                <span
                                  style={{
                                    color: '#e2e2e2',
                                  }}
                                >
                                  |
                                </span>{' '}
                                <span
                                  style={{
                                    color: '#6f6f6f',
                                    fontWeight: '400',
                                    fontSize: '13px',
                                  }}
                                >
                                  {address.countryCode} {address.phone}
                                </span>
                                <br />
                                <span>{formatAddress(address)}</span>
                              </div>
                            </div>
                          ))}

                          <div
                            className="add-new"
                            onClick={() => {
                              setShowAddressDropdown(false);
                              handleAddAddressClick();
                            }}
                          >
                            + Add New Address
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Payment Button */}
                    <button
                      className="btn-payment"
                      onClick={handleProceedToCheckout}
                      disabled={
                        isProceedingToCheckout ||
                        isAddingAddress ||
                        !hasEligibleCartProducts
                      }
                    >
                      {isProceedingToCheckout
                        ? 'Processing...'
                        : !hasEligibleCartProducts
                          ? noEligibleItemsLabel
                          : `Click to Pay`}
                    </button>
                  </>
                ) : (
                  <button
                    className="btn-primary btn-payment shimmer"
                    onClick={() => {
                      if (!isAuthenticated) {
                        setOtpModal(true);
                      } else {
                        handleAddAddressClick();
                      }
                    }}
                    disabled={isAddingAddress || !hasEligibleCartProducts}
                  >
                    {!hasEligibleCartProducts
                      ? noEligibleItemsLabel
                      : !isAuthenticated
                        ? 'Please Login'
                        : 'Add Address to proceed'}
                  </button>
                )}
              </div>
            )}
            {isCartAsyncLoading && (
              <div
                className="cart-loading-overlay"
                role="status"
                aria-live="polite"
              >
                <div
                  className="spinner-border text-success"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
        </Offcanvas>
      ) : (
        <div className={`onhover-div ${cartCanvas ? 'show' : ''}`}>
          <div className="cart-title">
            <h4>Shopping Cart</h4>
            <a onClick={() => setCartCanvas((prev) => !prev)}>
              <RiCloseLine />
            </a>
          </div>
          <HeaderCartBottom
            modal={modal}
            setModal={setModal}
            shippingCal={shippingCal}
            shippingFreeAmt={shippingFreeAmt}
            selectedAddress={selectedAddress}
          />
        </div>
      )}
      <ResponsiveModal
        modal={addressModal}
        setModal={setAddressModal}
        classes={{
          modalClass: 'theme-modal view-modal modal-md',
          modalHeaderClass: 'justify-content-between',
          title: 'Add Address',
        }}
        backdrop="static"
      >
        <div className="right-sidebar-box">
          <AddAddressForm
            mutate={addAddressMutate}
            setModal={setAddressModal}
            type="shipping"
            modal={false}
            isSubmitting={isAddingAddress}
          />
        </div>
      </ResponsiveModal>
      <ResponsiveModal
        modal={showAddressLimitModal}
        setModal={setShowAddressLimitModal}
        classes={{
          modalClass: 'theme-modal modal-sm',
          modalHeaderClass: 'justify-content-between',
          title: 'Address Limit Reached',
        }}
      >
        <div className="p-2">Maximum 20 addresses can be added.</div>
      </ResponsiveModal>
      <OtpLoginModal isOpen={otpModal} setOpen={setOtpModal} />
    </>
  );
};

export default HeaderCartData;