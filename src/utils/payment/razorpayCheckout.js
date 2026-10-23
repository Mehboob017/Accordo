import { loadRazorpayScript } from '@/utils/loadRazorpay';

export const openRazorpayCheckout = async ({
  razorpayData,
  trxUid,
  verifyPayment,
  onCancelled,
  options = {},
}) => {
  if (!razorpayData || !trxUid) {
    throw new Error('Payment initialization failed');
  }

  if (typeof verifyPayment !== 'function') {
    throw new Error('Payment verification handler is required');
  }

  const isLoaded = await loadRazorpayScript();

  if (!isLoaded || typeof window === 'undefined' || !window.Razorpay) {
    throw new Error('Payment gateway failed to load');
  }

  return new Promise((resolve, reject) => {
    // console.log('Initializing Razorpay checkout with data:', razorpayData, 'and trxUid:', trxUid);

    const checkoutOptions = {
      key: razorpayData?.key,
      amount: razorpayData?.amount,
      currency: razorpayData?.currency,
      name: razorpayData?.name,
      description: razorpayData?.description,
      order_id: razorpayData?.orderId,
      prefill: razorpayData?.prefill,
      handler: async (response) => {
        try {
          const verifyData = await verifyPayment({
            razorpay_order_id: response?.razorpay_order_id,
            razorpay_payment_id: response?.razorpay_payment_id,
            razorpay_signature: response?.razorpay_signature,
            trxUid,
          });

          if (!verifyData?.success) {
            throw new Error(verifyData?.message || 'Payment verification failed');
          }

          resolve({
            razorpayResponse: response,
            verifyData,
          });
        } catch (error) {
          reject(error);
        }
      },
      modal: {
        // ondismiss: () => {
        //   const cancelError = new Error('Payment cancelled');
        //   onCancelled?.();
        //   reject(cancelError);
        // },
        ondismiss: async () => {
          // console.log({razorpayData, trxUid})
          try {
          // console.log("on dismiss ran");
            await onCancelled?.({
              razorpay_order_id: razorpayData.orderId,
              // razorpay_payment_id, 
              trxUid
            });
          } finally {
            reject(new Error('Payment cancelled'));
          }
        },
      },
      theme: {
        color: '#1FA67A',
      },
      ...options,
    };

    const razorpayInstance = new window.Razorpay(checkoutOptions);
    razorpayInstance.open();
  });
};
