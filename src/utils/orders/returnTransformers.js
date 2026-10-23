import { formatPlacedAt } from '@/utils/orders/orderTransformers';

export const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const isReturnableByCriteria = (item = {}) => {
  return item?.isFreeGift === false && item?.eligible === true;
};

export const isEffectivelyReturnable = (item = {}) => {
  return (
    isReturnableByCriteria(item)
    && item?.fullyReturned === false
    && Number(item?.remainingQty || 0) > 0
  );
};

export const mapEligibilityItemToUi = (item = {}) => {
  const orderedQty = Number(item?.orderedQty || 0);
  const alreadyReturnedQty = Number(item?.alreadyReturnedQty || 0);
  const remainingQty = Number(item?.remainingQty);
  const payableAmount = toNumber(
    item?.payableAmount
    || item?.snapPrice
    || item?.unitRefund
  );

  return {
    id: String(item?.orderItemUid || item?.variantUid || ''),
    orderItemUid: String(item?.orderItemUid || ''),
    variantUid: String(item?.variantUid || ''),
    name: item?.snapProductName || '',
    variant: item?.snapVariantName || '',
    image: item?.snapProductImage || '',
    isFreeGift: Boolean(item?.isFreeGift),
    eligible: Boolean(item?.eligible),
    orderedQty,
    alreadyReturnedQty,
    remainingQty,
    fullyReturned: Boolean(item?.fullyReturned),
    inReturn: Boolean(item?.inReturn),
    unitRefund: toNumber(item?.unitRefund),
    price: toNumber(item?.snapPrice),
    mrp: toNumber(item?.snapMrp),
    payableAmount,
    coinUsed: toNumber(item?.coinUsed),
    coinEarned: toNumber(item?.coinEarned),
    lastReturnDate: item?.lastReturnDate || null,
    returnableByRule: isReturnableByCriteria(item),
    returnable: isEffectivelyReturnable({
      ...item,
      remainingQty,
    }),
  };
};

const formatSubmittedDate = (isoDate) => {
  if (!isoDate) return '';
  return formatPlacedAt(isoDate) || '';
};

const mapPickupAddressToUi = (pickupAddress = {}) => {
  return {
    name: pickupAddress?.name || '',
    phone: pickupAddress?.phone || '',
    address: pickupAddress?.address || '',
  };
};

const mapProofFileToUi = (file = {}) => {
  return {
    uid: String(file?.uid || ''),
    fileUrl: file?.fileUrl || '',
    fileType: file?.fileType || '',
    fileName: file?.fileName || '',
    fileSize: toNumber(file?.fileSize),
    createdAt: file?.createdAt || '',
  };
};

const mapReturnStatusHistoryToUi = (statusHistory = []) => {
  return (Array.isArray(statusHistory) ? statusHistory : []).map((entry) => ({
    uid: String(entry?.uid || ''),
    status: String(entry?.status || '').trim(),
    note: String(entry?.note || '').trim(),
    createdAt: entry?.createdAt || '',
    changedAt: entry?.changedAt || '',
  }));
};

const mapReturnDetailItemToUi = (item = {}) => {
  return {
    uid: String(item?.uid || ''),
    orderItemUid: String(item?.orderItemUid || ''),
    variantUid: String(item?.variantUid || ''),
    snapProductName: item?.snapProductName || '',
    snapVariantName: item?.snapVariantName || '',
    snapProductImage: item?.snapProductImage || '',
    snapMrp: toNumber(item?.snapMrp),
    snapPrice: toNumber(item?.snapPrice),
    snapBasePrice: toNumber(item?.snapBasePrice),
    snapGstPercent: toNumber(item?.snapGstPercent),
    returnQty: toNumber(item?.returnQty),
    totalOrderedQty: toNumber(item?.totalOrderedQty),
    reason: item?.reason || '',
    additionalNote: item?.additionalNote || '',
    status: item?.status || '',
    amounts: {
      subTotal: toNumber(item?.amounts?.subTotal),
      discountCodeAmount: toNumber(item?.amounts?.discountCodeAmount),
      slabDiscountAmount: toNumber(item?.amounts?.slabDiscountAmount),
      coinDiscount: toNumber(item?.amounts?.coinDiscount),
      offerDiscountAmount: toNumber(item?.amounts?.offerDiscountAmount),
      gstAmount: toNumber(item?.amounts?.gstAmount),
      payableAmount: toNumber(item?.amounts?.payableAmount),
      refundAmount: toNumber(item?.amounts?.refundAmount),
      unitRefund: toNumber(item?.amounts?.unitRefund),
    },
    coinUsed: toNumber(item?.coinUsed),
    coinEarned: toNumber(item?.coinEarned),
  };
};

const mapOrderSummaryToUi = (order = {}) => {
  return {
    orderNumber: order?.orderNumber || '',
    paymentMode: order?.paymentMode || '',
    orderStatus: order?.orderStatus || '',
    orderDate: order?.orderDate || '',
    amounts: order?.amounts || {},
  };
};

const mapRequestProducts = (
  requestProducts = [],
  itemMap = {},
  requestProofFilesLength = 0
) => {
  return (Array.isArray(requestProducts) ? requestProducts : []).map((product, index) => {
    const orderItem = product?.orderItem || {};
    const orderItemUid = String(
      product?.orderItemUid
      || product?.orderItem?.uid
      || product?.uid
      || ''
    );

    const linkedItem = itemMap[orderItemUid] || null;
    const quantity = Number(product?.quantity || product?.returnQty || 1);
    const rawRefundAmount = toNumber(product?.refundAmount);
    const unitPrice = toNumber(
      product?.snapPrice
      || orderItem?.snapPrice
      || product?.unitRefund
      || product?.refundPerUnit
      || product?.price
      || linkedItem?.unitRefund
      || linkedItem?.price
      || (rawRefundAmount > 0 && quantity > 0 ? rawRefundAmount / quantity : 0)
    );

    return {
      id: orderItemUid || `return-item-${index + 1}`,
      orderItemUid,
      name:
        product?.snapProductName
        || orderItem?.snapProductName
        || product?.productName
        || linkedItem?.name
        || `Product ${index + 1}`,
      variant:
        product?.snapVariantName
        || orderItem?.snapVariantName
        || linkedItem?.variant
        || '',
      image:
        product?.snapProductImage
        || orderItem?.snapProductImage
        || product?.image
        || linkedItem?.image
        || '',
      returnQty: quantity,
      price: unitPrice,
      reason: product?.reason || product?.returnReason || '',
      notes: product?.additionalNote || product?.notes || '',
      filesCount: Array.isArray(product?.proofFiles)
        ? product.proofFiles.length
        : requestProofFilesLength,
    };
  });
};

const mapReturnRequestToUi = (request = {}, itemMap = {}) => {
  const requestId = String(
    request?.returnNumber
    || request?.uid
    || request?.returnRequestUid
    || ''
  );

  const status = String(request?.status || '').toUpperCase();
  const submittedDate = formatSubmittedDate(
    request?.createdAt || request?.submittedAt || request?.requestedAt || ''
  );

  const requestProofFiles = Array.isArray(request?.proofFiles) ? request.proofFiles : [];

  const requestProducts = mapRequestProducts(
    request?.items || request?.products || [],
    itemMap,
    requestProofFiles.length
  );

  const calculatedRefund = requestProducts.reduce((sum, item) => {
    return sum + (Number(item?.price || 0) * Number(item?.returnQty || 0));
  }, 0);

  const refundAmount = toNumber(request?.refundAmount || calculatedRefund);

  const reasonSummary = request?.reason
    || (requestProducts.length === 1
      ? (requestProducts[0]?.reason || 'Return requested')
      : `${requestProducts.length} items`);

  return {
    id: requestId,
    submittedDate: submittedDate || '-',
    status,
    reason: reasonSummary,
    notes: request?.note || request?.notes || request?.additionalNote || '',
    adminNote: request?.adminNote || '',
    returnRequestUid: String(request?.uid || request?.returnRequestUid || ''),
    trxUid: String(request?.trxUid || ''),
    pickupAddressUid: String(request?.pickupAddressUid || ''),
    pickupName: request?.snapPickupName || '',
    pickupPhone: request?.snapPickupPhone || '',
    pickupAddress: request?.snapPickupAddress || '',
    proofFiles: requestProofFiles,
    proofFilesCount: requestProofFiles.length,
    refundAmount,
    products: requestProducts,
    statusHistory: Array.isArray(request?.statusTimeline)
      ? request.statusTimeline
      : [],
  };
};

export const mapReturnsOverviewToModel = (payload = {}) => {
  const data = payload?.data || {};
  // console.log({ data });

  const rawEligibilityItems = Array.isArray(data?.eligibility?.items)
    ? data.eligibility.items
    : [];

  const eligibilityItems = rawEligibilityItems.map(mapEligibilityItemToUi);

  const eligibleProducts = eligibilityItems.filter((item) => item.returnableByRule);
  const returnableProducts = eligibleProducts.filter((item) => item.returnable);
  const fullyReturnedProducts = eligibleProducts.filter((item) => !item.returnable);

  const nonReturnableProducts = eligibilityItems.filter((item) => !item.returnable);

  const itemMap = eligibilityItems.reduce((accumulator, item) => {
    if (item?.orderItemUid) {
      accumulator[item.orderItemUid] = item;
    }
    return accumulator;
  }, {});

  const rawRequests = Array.isArray(data?.returnRequests) ? data.returnRequests : [];
  const sortedRawRequests = [...rawRequests].sort((requestA, requestB) => {
    const dateA = new Date(
      requestA?.createdAt || requestA?.submittedAt || requestA?.requestedAt || 0
    ).getTime();
    const dateB = new Date(
      requestB?.createdAt || requestB?.submittedAt || requestB?.requestedAt || 0
    ).getTime();

    return dateB - dateA;
  });
  const returnRequests = sortedRawRequests.map((request) => mapReturnRequestToUi(request, itemMap));

  const latestReturnStatus = returnRequests.length > 0
    ? String(returnRequests[0]?.status || '').toUpperCase()
    : null;

  // const statusHistory = mapReturnStatusHistoryToUi(data?.statusHistory);
  const statusHistory = mapReturnStatusHistoryToUi(data?.statusTimeline);
  const proofFiles = (Array.isArray(data?.proofFiles) ? data.proofFiles : []).map(mapProofFileToUi);
  const items = (Array.isArray(data?.items) ? data.items : []).map(mapReturnDetailItemToUi);
  const overview = {
    trxUid: String(data?.trxUid || ''),
    orderNumber: data?.orderNumber || data?.order?.orderNumber || '',
    orderStatus: data?.orderStatus || data?.order?.orderStatus || '',
    orderDate: data?.orderDate || data?.order?.orderDate || '',
    paymentMode: data?.paymentMode || data?.order?.paymentMode || '',
    deliveryInfo: data?.deliveryInfo || {},
    amounts: data?.amounts || data?.order?.amounts || {},
  };
  const displayOrderStatus = data?.displayOrderStatus || '';

  return {
    success: Boolean(payload?.success),
    message: payload?.message || '',
    uid: String(data?.uid || ''),
    returnNumber: data?.returnNumber || '',
    status: String(data?.status || '').toUpperCase(),
    reason: data?.reason || '',
    refundMethod: data?.refundMethod || '',
    adminNote: data?.adminNote || '',
    createdAt: data?.createdAt || '',
    updatedAt: data?.updatedAt || '',
    pickupAddress: mapPickupAddressToUi(data?.pickupAddress),
    order: mapOrderSummaryToUi(data?.order),
    items,
    refundSummary: data?.refundSummary || {},
    proofFiles,
    statusHistory,
    coinImpact: data?.coinImpact || {},
    overview,
    eligibilityItems,
    eligibleProducts,
    returnableProducts,
    fullyReturnedProducts,
    nonReturnableProducts,
    returnRequests,
    displayOrderStatus,
    latestReturnStatus,
    canCreateReturn: returnableProducts.length > 0,
    showReturnButton: eligibleProducts.length > 0 || returnRequests.length > 0,
    rawData: data,
  };
};

const mapAddressToUi = (address = {}) => {
  const firstName = String(address?.firstName || '').trim();
  const lastName = String(address?.lastName || '').trim();

  return {
    uid: String(address?.uid || ''),
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    phone: String(address?.phone || '').trim(),
    addressLine1: address?.addressLine1 || '',
    addressLine2: address?.addressLine2 || '',
    city: address?.city || '',
    state: address?.state || '',
    pincode: address?.pincode || '',
    text: [
      address?.addressLine1,
      address?.addressLine2,
      address?.city,
      address?.state,
      address?.pincode,
    ]
      .filter(Boolean)
      .join(', '),
  };
};

export const mapReturnsNewToModel = (payload = {}) => {
  const data = payload?.data || {};

  const rawItems = Array.isArray(data?.selectProducts?.items)
    ? data.selectProducts.items
    : [];
  const selectProducts = rawItems.map(mapEligibilityItemToUi);

  const returnableProducts = selectProducts.filter((item) => item.returnable);
  const nonReturnableProducts = selectProducts.filter((item) => !item.returnable);
  const fullyReturnedProducts = selectProducts.filter((item) => {
    return item?.fullyReturned || Number(item?.remainingQty || 0) <= 0;
  });

  const returnReasons = (Array.isArray(data?.returnReasons) ? data.returnReasons : [])
    .map((reason) => ({
      value: String(reason?.value || '').trim(),
      label: String(reason?.label || reason?.value || '').trim(),
    }))
    .filter((reason) => reason.value && reason.label);

  const addresses = (Array.isArray(data?.addresses) ? data.addresses : [])
    .map(mapAddressToUi);

  const orderInfo = data?.orderInfo || {};
  const orderDate = String(orderInfo?.orderDate || '').trim();
  const deliveredAt = String(orderInfo?.deliveredAt || '').trim();

  return {
    success: Boolean(payload?.success),
    message: payload?.message || '',
    selectProducts,
    returnableProducts,
    nonReturnableProducts,
    fullyReturnedProducts,
    returnReasons,
    orderInfo: {
      orderNumber: orderInfo?.orderNumber || '',
      orderDate,
      orderDateLabel: formatPlacedAt(orderDate) || '',
      paymentMode: orderInfo?.paymentMode || '',
      deliveryAddressUid: String(
        orderInfo?.deliveryAddressUid
        || orderInfo?.shippingAddressUid
        || orderInfo?.addressUid
        || ''
      ).trim(),
      deliveredAt: orderInfo?.deliveredAt || null,
      deliveredAtLabel: deliveredAt ? (formatPlacedAt(deliveredAt) || deliveredAt) : '',
      deliveryName: orderInfo?.deliveryName || '',
      awbNumber: orderInfo?.awbNumber || '',
      amounts: orderInfo?.amounts || {},
    },
    addresses,
    defaultPickupAddress: addresses[0] || null,
    canCreateReturn: returnableProducts.length > 0,
  };
};
