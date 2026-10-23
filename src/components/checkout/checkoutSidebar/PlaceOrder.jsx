'use client';

import { useContext, useState } from 'react';
import Btn from '@/elements/buttons/Btn';
import { useRouter } from 'next/navigation';
import UserContext from '@/helper/userContext';
import { ToastNotification } from '@/utils/customFunctions/ToastNotification';
import OtpLoginModal from '@/components/auth/login/OtpLoginModal';
import { verifyOrderPayment } from '@/api/checkout.api';
import { openRazorpayCheckout } from '@/utils/payment/razorpayCheckout';
import { RZP_PAYMENT_METHOD } from '@/utils/constants';
import { buildOrderPrescriptionPayload } from '@/utils/prescription/prescriptionPayload';
import { clearDraftPrescriptionFiles } from '@/utils/prescription/prescriptionStorage';
import { usePaymentCancel, usePlaceOrder } from '@/utils/hooks/useMyOrders';

const PlaceOrder = ({
  values,
  cartProducts,
  billDetails,
  instantBuyProduct,
  isStandaloneCheckout = false,
  disabled = false,
  prescriptionState,
  couponUid = '',
  offerUid = '',
  coinUsed = 0,
  freeItems = [],
  paymentMode = RZP_PAYMENT_METHOD,
  getGstInvoice = false,
  billingAddressUid = '',
  shippingAddressUid = '',
  onAddAddress,
}) => {
  const router = useRouter();
  const { userData, isAuthenticated } = useContext(UserContext);
  const [otpModal, setOtpModal] = useState(false);
  const [isPreparingPrescriptions, setIsPreparingPrescriptions] =
    useState(false);
  const hasShippingAddress = Boolean(
    values?.shipping_address_id || shippingAddressUid
  );

  const { mutateAsync: markPaymentFailed } = usePaymentCancel();

  const { mutate: submitOrder, isPending: isSubmitting } = usePlaceOrder({
    onSuccess: async (response) => {
      const data = response?.data;
      const clearPrescriptionDraftsOnSuccess = async () => {
        try {
          await clearDraftPrescriptionFiles();
        } catch (error) {
          // Keep order success flow unaffected if local cleanup fails.
        }
      };

      // Free order: skip Razorpay, order already placed
      if (!data?.razorpay) {
        await clearPrescriptionDraftsOnSuccess();
        if (data?.trxUid) sessionStorage.setItem('_osTrxUid', data.trxUid);
        router.replace(
          `/order-success?orderId=${encodeURIComponent(data?.orderNumber || '')}`
        );
        return;
      }

      if (!data?.trxUid) {
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
              // console.log({data})
              const res = await markPaymentFailed({
                razorpay_order_id: data?.razorpay?.orderId,
                razorpay_payment_id: '',
                trxUid: data?.trxUid,
              });
              // console.log(res)
            } catch (error) {
              console.error('Failed to mark payment as failed', error);
            }

            ToastNotification('info', 'Payment cancelled');
          },
        });

        // console.log('Razorpay response:', razorpayResponse);
        // console.log('verifyData:', verifyData);

        const resolvedOrderId =
          verifyData?.data?.orderNumber || data?.orderNumber || '';

        await clearPrescriptionDraftsOnSuccess();
        if (data?.trxUid) sessionStorage.setItem('_osTrxUid', data.trxUid);
        router.replace(
          `/order-success?orderId=${encodeURIComponent(resolvedOrderId)}`
        );
      } catch (error) {
        if (error?.message === 'Payment cancelled') {
          return;
        }

        ToastNotification(
          'error',
          error?.message || 'Payment could not be completed'
        );
      }
    },
    onError: (error) => {
      ToastNotification(
        'error',
        error?.message || 'Failed to place order. Please try again.'
      );
    },
  });

  const handlePlaceOrderClick = async () => {
    // Validate cart is not empty
    if (!cartProducts || cartProducts.length === 0) {
      ToastNotification(
        'error',
        'Your cart is empty. Please add items before placing an order.'
      );
      return;
    }

    // Check if checkout is disabled due to any reason (e.g., out of stock items, invalid cart state)
    if (disabled) {
      ToastNotification(
        'error',
        'Unable to place order with the current checkout items.'
      );
      return;
    }

    // Check login
    if (!isAuthenticated) {
      ToastNotification('info', 'Please login to place your order.');
      setOtpModal(true);
      return;
    }

    if (!hasShippingAddress) {
      ToastNotification('info', 'Please add a delivery address to proceed.');
      if (onAddAddress) {
        onAddAddress();
      }
      return;
    }

    if (
      prescriptionState?.isPrescriptionRequired &&
      !prescriptionState?.isValid
    ) {
      ToastNotification(
        'error',
        prescriptionState?.error ||
          prescriptionState?.requirementError ||
          'Prescription is required to proceed'
      );
      return;
    }

    // console.log('Placing order with values:', {
    //   values,
    //   couponUid,
    //   offerUid,
    //   coinUsed,
    //   paymentMode,
    //   cartProducts,
    //   billDetails,
    //   userData,
    //   instantBuyProduct,
    //   isStandaloneCheckout,
    //   disabled,
    //   prescriptionState,
    //   isAuthenticated,
    // });

    try {
      setIsPreparingPrescriptions(true);

      const prescriptions = prescriptionState?.isPrescriptionRequired
        ? await buildOrderPrescriptionPayload(prescriptionState?.uploadedFiles)
        : [];

      const orderPayload = {
        customerUid: userData?.uid,
        billingAddressUid: billingAddressUid || shippingAddressUid || '',
        shippingAddressUid: shippingAddressUid || '',
        paymentMode,
        couponUid,
        offerUid,
        coinUsed,
        addThrough: 'Website',
        note: '',
        getGstInvoice,
        prescriptions,
        items: cartProducts.map((item) => ({
          variantUid: item?.variation_id || '',
          quantity: Number(item.quantity || 1),
        })),
        freeItems: (Array.isArray(freeItems) ? freeItems : [])
          .map((item) => ({
            variantUid: String(item?.variantUid || '').trim(),
            quantity: Math.max(1, Math.floor(Number(item?.quantity || 1))),
          }))
          .filter((item) => Boolean(item?.variantUid)),
      };

      // console.log('[PlaceOrder] Payload:', orderPayload);

      submitOrder(orderPayload);
    } catch (error) {
      ToastNotification(
        'error',
        error?.message || 'Prescription upload failed. Please try again.'
      );
    } finally {
      setIsPreparingPrescriptions(false);
    }
  };

  return (
    <>
      <Btn
        className="mt-3 shimmer"
        onClick={handlePlaceOrderClick}
        disabled={
          isSubmitting ||
          isPreparingPrescriptions ||
          !cartProducts?.length ||
          disabled
        }
      >
        {isPreparingPrescriptions
          ? 'Uploading Prescription...'
          : isSubmitting
            ? 'Placing Order...'
            : disabled
              ? 'Checkout unavailable'
              : !isAuthenticated
                ? 'Please Login'
                : !hasShippingAddress
                  ? 'Add Address'
                  : // : `Place Order${billDetails?.grandTotal ? ` • ₹${billDetails.grandTotal.toFixed(2)}` : ''}`}
                    `Place Order`}
      </Btn>
      <OtpLoginModal isOpen={otpModal} setOpen={setOtpModal} />
    </>
  );
};

export default PlaceOrder;
