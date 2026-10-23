import { getStatusMeta } from '@/utils/orders/statusMapper';

const TRACKING_STATUS_MAP = {
  pending: 'PENDING',
  placed: 'PLACED',
  confirmed: 'CONFIRMED',
  processing: 'PROCESSING',
  packed: 'PACKED',
  shipped: 'SHIPPED',
  out_for_delivery: 'OUT_FOR_DELIVERY',
  delivery_attempt_failed: 'DELIVERY_ATTEMPT_FAILED',
  onway: 'OUT_FOR_DELIVERY',
  delivered: 'DELIVERED',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
  partially_cancelled: 'PARTIALLY_CANCELLED',
  refund_initiated: 'REFUND_INITIATED',
  refund_created: 'REFUND_CREATED',
  refund_processed: 'REFUND_PROCESSED',
  refunded: 'REFUNDED',
  partial_refund: 'PARTIAL_REFUND',
  failed: 'FAILED',
};

const toNormalizedStatusToken = (value) => {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
};

export const normalizeOrderStatus = (status) => {
  const value = toNormalizedStatusToken(status);

  if (!value) {
    return 'pending';
  }

  if (value === 'canceled') {
    return 'cancelled';
  }

  if (value === 'refund_completed') {
    return 'refunded';
  }

  if (value === 'partial_cancelled') {
    return 'partially_cancelled';
  }

  return value;
};

export const mapStatusToTrackingStatus = (status) => {
  return TRACKING_STATUS_MAP[status] || 'CONFIRMED';
};

const resolveOrderItemVariantId = (item = {}) => {
  return String(
    item?.variantUid ||
    item?.variantId ||
    item?.variationId ||
    item?.variation_id ||
    item?.productVariantUid ||
    item?.productVariantId ||
    item?.snapVariantUid ||
    item?.variant?.uid ||
    item?.variant?.id ||
    ''
  ).trim();
};

export const formatPlacedAt = (isoDate) => {
  if (!isoDate) return '';

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const normalizeTimelineStatusKey = (value) => {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
};

const resolveTimelineEntryDate = (entry = {}) => {
  return entry?.date || entry?.createdAt || entry?.changedAt || '';
};

const mapStatusHistoryToTimeline = (statusHistory = []) => {
  const normalizedHistory = Array.isArray(statusHistory) ? statusHistory : [];

  return normalizedHistory
    .map((entry, index) => {
      const rawStatus = String(entry?.status || '').trim();

      if (!rawStatus) {
        return null;
      }

      const rawDate = resolveTimelineEntryDate(entry);

      return {
        key: `${normalizeTimelineStatusKey(rawStatus)}_${index}`,
        label: getStatusMeta(rawStatus).label,
        date: rawDate ? formatPlacedAt(rawDate) : '',
      };
    })
    .filter(Boolean);
};

const normalizePrescriptionFileType = (fileType = '') => {
  const normalizedType = String(fileType || '').toLowerCase();

  if (normalizedType.startsWith('image') || normalizedType === 'image') {
    return 'image/jpeg';
  }

  if (normalizedType.includes('pdf') || normalizedType === 'pdf') {
    return 'application/pdf';
  }

  return normalizedType || 'application/octet-stream';
};

const mapOrderPrescriptionFiles = (prescriptions = []) => {
  return (Array.isArray(prescriptions) ? prescriptions : [])
    .map((file) => {
      const previewUrl = file?.fileUrl || '';

      if (!previewUrl) {
        return null;
      }

      return {
        id: file?.id || file?.uid || file?.imageKey || previewUrl,
        uid: file?.uid || '',
        name: file?.fileName || 'Prescription file',
        type: normalizePrescriptionFileType(file?.fileType),
        previewUrl,
        fileType: file?.fileType || '',
        fileName: file?.fileName || '',
        fileSize: Number(file?.fileSize || 0),
        createdAt: file?.createdAt || '',
      };
    })
    .filter(Boolean);
};

export const mapApiOrderToCardModel = (apiOrder) => {
  const orderItems = Array.isArray(apiOrder?.orderItems) ? apiOrder.orderItems : [];
  const normalizedStatus = normalizeOrderStatus(apiOrder?.currentStatus);

  // Extract shared pricing structure directly matching detail model
  const itemTotalValue = Number(apiOrder?.subtotal || 0);
  const mrpValue = Number(apiOrder?.totalMrp || itemTotalValue);
  const couponDiscountValue = Number(apiOrder?.discountAmount || 0);
  const deliveryChargeValue = Number(apiOrder?.deliveryChargesAmount || 0);
  const sdlCoinDiscountValue = Number(apiOrder?.coinDiscountAmount || 0);
  const slabDiscountAmount = Number(apiOrder?.slabDiscountAmount || 0);
  const slabDiscountPercent = Number(apiOrder?.slabDiscountPercent || 0);
  const grandTotalValue = Number(apiOrder?.payableAmount || 0);
  const roundingAmount = Number(apiOrder?.roundingAmount || 0);
  const offerDiscountAmountValue = Number(apiOrder?.offerDiscountAmount || 0);

  return {
    id: apiOrder?.uid,
    trxUid: apiOrder?.trxUid || apiOrder?.trx?.uid || apiOrder?.uid || orderItems?.[0]?.trxUid || '',
    pickupAddressUid: apiOrder?.shippingAddressUid || apiOrder?.shippingAddress?.uid || apiOrder?.address?.uid || '',
    orderId: apiOrder?.orderNumber || apiOrder?.invoiceId || apiOrder?.uid,
    currentStatus: normalizedStatus,
    status: normalizedStatus,
    placedAt: apiOrder?.createdAt,
    total: grandTotalValue,
    itemTotal: itemTotalValue,
    mrp: mrpValue,
    couponDiscount: couponDiscountValue,
    shippingCharge: deliveryChargeValue,
    displayStatus: apiOrder?.displayStatus || '',
    sdlCoinDiscount: sdlCoinDiscountValue,
    slabDiscountAmount: slabDiscountAmount,
    offerDiscountAmount: offerDiscountAmountValue,
    slabDiscountPercentage: slabDiscountPercent,
    receiverName: apiOrder?.snapShippingName || apiOrder?.snapCustomerName,
    receiverPhone: apiOrder?.snapShippingPhone || apiOrder?.snapCustomerPhone || '',
    deliveryAddress: [
      apiOrder?.snapShippingAddressLine1,
      apiOrder?.snapShippingAddressLine2,
      apiOrder?.snapShippingCity,
      apiOrder?.snapShippingState,
      apiOrder?.snapShippingPincode,
    ].filter(Boolean).join(', '),

    items: orderItems.map((item) => ({
      id: item?.uid,
      orderItemUid: item?.uid || item?.orderItemUid || '',
      variantUid: resolveOrderItemVariantId(item),
      variantId: resolveOrderItemVariantId(item),
      name: item?.snapProductName || '',
      image: item?.snapProductImage || '',
      variant: item?.snapVariantName || '',
      price: Number(item?.snapPrice || 0),
      mrp: Number(item?.snapMrp || 0),
      quantity: Number(item?.quantity || 1),
      subTotal: Number(item?.subTotal || 0),
      discountCodeAmount: Number(item?.discountCodeAmount || 0),
      offerDiscountAmount: Number(item?.offerDiscountAmount || 0),
      coinDiscount: Number(item?.coinDiscount || 0),
      slabDiscountAmount: Number(item?.slabDiscountAmount || 0),
      isFreeGift: Boolean(item?.isFreeGift),
      returnable: Boolean(item?.snapReturnable ?? item?.variant?.product?.returnable),
      currentStatus: item?.currentStatus || '',
    })),
    // Attach the unified summary object to list items natively
    summary: {
      mrp: mrpValue,
      itemTotal: itemTotalValue,
      discountedPrice: itemTotalValue,
      couponDiscount: couponDiscountValue,
      shippingCharge: deliveryChargeValue,
      sdlCoinDiscount: sdlCoinDiscountValue,
      slabDiscountAmount: slabDiscountAmount,
      slabDiscountPercentage: slabDiscountPercent,
      offerDiscountAmount: offerDiscountAmountValue,
      grandTotal: grandTotalValue,
      roundingAmount: roundingAmount,
    },
    tracking: {
      orderStatus: mapStatusToTrackingStatus(normalizedStatus),
      statusHistory: apiOrder?.statusTimeline || apiOrder?.statusHistory || [],
    },
    prescriptions: mapOrderPrescriptionFiles(apiOrder?.orderPrescription || []),
    reviews: apiOrder?.orderReview || [],
    isCancellable: apiOrder?.isCancellable || false,
    canRaiseReturn: apiOrder?.canRaiseReturn || false,
    invoiceLink: apiOrder?.invoices?.[0]?.s3Url || '',
    invoiceNo: apiOrder?.invoices?.[0]?.metadata?.invoiceNo || '',
  };
};

export const mapOrderDetailToOrderModel = (apiOrder) => {
  // console.log({ apiOrder });

  const items = Array.isArray(apiOrder?.orderItems) ? apiOrder.orderItems : [];
  const trackingStatusHistory = apiOrder?.statusTimeline || apiOrder?.statusHistory || [];
  const placedAtIso = apiOrder?.createdAt || '';
  const placedAt = placedAtIso ? formatPlacedAt(placedAtIso) : '';
  const roundingAmount = Number(apiOrder?.roundingAmount || 0);
  const arrivedAtIso = apiOrder?.deliveryInfo?.deliveredAt || '';
  const arrivedAt = arrivedAtIso ? formatPlacedAt(arrivedAtIso) : '';
  const normalizedStatus = normalizeOrderStatus(apiOrder?.currentStatus);
  const currentTrackingStatus = String(apiOrder?.currentStatus || normalizedStatus || '').trim();

  const itemTotalValue = Number(apiOrder?.subtotal || 0);
  const mrpValue = Number(apiOrder?.totalMrp || itemTotalValue);
  const couponDiscountValue = Number(apiOrder?.discountAmount || 0);
  const deliveryChargeValue = Number(apiOrder?.deliveryChargesAmount || 0);
  const sdlCoinDiscountValue = Number(apiOrder?.coinDiscountAmount || 0);
  const slabDiscountAmount = Number(apiOrder?.slabDiscountAmount || 0);
  const slabDiscountPercent = Number(apiOrder?.slabDiscountPercent || 0);
  const grandTotalValue = Number(apiOrder?.payableAmount || 0);
  const orderPrescriptionFiles = apiOrder?.orderPrescription || [];
  const orderReview = apiOrder?.orderReview || [];
  const totalCoinsEarned = apiOrder?.coinEarned || 0;
  const offerDiscountAmountValue = Number(apiOrder?.offerDiscountAmount || 0);

  const totalMrp = Number(apiOrder?.totalMrp || 0);
  const subtotal = Number(apiOrder?.subtotal || 0);
  const subtotalExGst = Number(apiOrder?.subtotalExGst || 0);
  const gstAmount = Number(apiOrder?.gstAmount || 0);

  const mappedItems = items.map((item) => ({
    id: item?.uid,
    orderItemUid: item?.uid || '',
    variantUid: resolveOrderItemVariantId(item),
    variantId: resolveOrderItemVariantId(item),
    name: item?.snapProductName || '',
    image: item?.snapProductImage || '',
    variant: item?.snapVariantName || '',
    price: Number(item?.snapPrice || 0),
    mrp: Number(item?.snapMrp || 0),
    quantity: Number(item?.quantity || 1),
    subTotal: Number(item?.subTotal || 0),
    discountCodeAmount: Number(item?.discountCodeAmount || 0),
    offerDiscountAmount: Number(item?.offerDiscountAmount || 0),
    coinDiscount: Number(item?.coinDiscount || 0),
    slabDiscountAmount: Number(item?.slabDiscountAmount || 0),
    isFreeGift: Boolean(item?.isFreeGift),
    returnable: Boolean(item?.snapReturnable ?? item?.variant?.product?.returnable),
    currentStatus: item?.currentStatus || '',
  }));

  return {
    id: apiOrder?.uid,
    trxUid: apiOrder?.trxUid || apiOrder?.trx?.uid || apiOrder?.uid || items?.[0]?.trxUid || '',
    pickupAddressUid: apiOrder?.shippingAddressUid || apiOrder?.shippingAddress?.uid || apiOrder?.address?.uid || '',
    orderId: apiOrder?.orderNumber || apiOrder?.invoiceId || apiOrder?.uid,
    status: normalizedStatus,
    displayStatus: apiOrder?.displayStatus || '',
    currentStatus: apiOrder?.currentStatus || '',
    isCancellable: apiOrder?.isCancellable || false,
    canRaiseReturn: apiOrder?.canRaiseReturn || false,
    canCancelReturn: apiOrder?.canCancelReturn || false,
    placedAt,
    arrivedAt,
    total: grandTotalValue,
    itemTotal: itemTotalValue,
    mrp: mrpValue,
    couponDiscount: couponDiscountValue,
    shippingCharge: deliveryChargeValue,
    sdlCoinDiscount: sdlCoinDiscountValue,
    items: mappedItems,
    summary: {
      mrp: mrpValue,
      itemTotal: itemTotalValue,
      discountedPrice: itemTotalValue,
      couponDiscount: couponDiscountValue,
      shippingCharge: deliveryChargeValue,
      sdlCoinDiscount: sdlCoinDiscountValue,
      slabDiscountAmount: slabDiscountAmount,
      slabDiscountPercentage: slabDiscountPercent,
      grandTotal: grandTotalValue,
      roundingAmount: roundingAmount,
      offerDiscountAmount: offerDiscountAmountValue,
      totalMrp,
      subtotal,
      subtotalExGst,
      gstAmount,
    },
    receiverName: apiOrder?.snapShippingName || apiOrder?.snapCustomerName || '',
    receiverPhone: apiOrder?.snapShippingPhone || apiOrder?.snapCustomerPhone || '',
    deliveryAddress: [
      apiOrder?.snapShippingAddressLine1,
      apiOrder?.snapShippingAddressLine2,
      apiOrder?.snapShippingCity,
      apiOrder?.snapShippingState,
      apiOrder?.snapShippingPincode,
    ].filter(Boolean).join(', '),
    tracking: {
      orderStatus: currentTrackingStatus,
      statusHistory: trackingStatusHistory,
    },
    prescriptions: mapOrderPrescriptionFiles(orderPrescriptionFiles),
    reviews: orderReview,
    totalCoinsEarned,
    refundHistory: Array.isArray(apiOrder?.refundHistory) ? apiOrder.refundHistory : [],
    invoiceLink: apiOrder?.invoices?.[0]?.s3Url || '',
    invoiceNo: apiOrder?.invoices?.[0]?.metadata?.invoiceNo || '',
  };
};