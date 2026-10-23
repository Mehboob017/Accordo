export const CUSTOMER_TYPES = {
  DOCTOR: 'doctor',
  DOCTOR_AND_CONSUMER: 'doctorAndConsumer',
  RETAILER: 'retailer',
};

export const normalizeCustomerType = (value = '') => {
  const normalizedValue = String(value || '').trim();

  if (normalizedValue === CUSTOMER_TYPES.DOCTOR) {
    return CUSTOMER_TYPES.DOCTOR;
  }

  if (normalizedValue === CUSTOMER_TYPES.RETAILER) {
    return CUSTOMER_TYPES.RETAILER;
  }

  return CUSTOMER_TYPES.DOCTOR_AND_CONSUMER;
};

export const getProductCustomerType = (product) =>
  normalizeCustomerType(product?.consumer_type || product?.customerType);

export const isDoctorUser = (userData) =>
  Boolean(
    userData?.isDoctor ||
      userData?.role === 'Doctor' ||
      userData?.role === 'doctor'
  );

export const getCartItemCustomerType = (item) =>
  normalizeCustomerType(
    item?.product?.consumer_type || item?.product?.customerType || item?.customerType
  );

export const getCartItemQuantity = (item) => {
  const parsedQuantity = Number(item?.quantity || 0);

  return Number.isFinite(parsedQuantity) ? Math.max(0, parsedQuantity) : 0;
};

export const getCartItemKey = (item) => {
  const productId = item?.product_id || item?.product?.id || item?.product?.uid;
  const variationId =
    item?.variation_id || item?.variation?.id || item?.variation?.uid || 'default';

  if (!productId) {
    return null;
  }

  return `${productId}::${variationId}`;
};

export const getCartItemAvailableQuantity = (item) => {
  const rawQuantity =
    item?.selectedVariation?.quantity ??
    item?.variation?.quantity ??
    item?.product?.quantity ??
    item?.quantity;

  const parsedQuantity = Number(rawQuantity);

  return Number.isFinite(parsedQuantity) ? Math.max(0, parsedQuantity) : null;
};

export const isCartItemOutOfStock = (item) => {
  const inStockFlag = item?.variation?.inStockFlag ?? item?.product?.inStockFlag;

  return inStockFlag === false;
};

export const getCartItemSalePrice = (item) => {
  const parsedPrice = Number(
    item?.variation?.sale_price ?? item?.product?.sale_price ?? 0
  );

  return Number.isFinite(parsedPrice) ? parsedPrice : 0;
};

export const getCartItemListPrice = (item) => {
  const parsedPrice = Number(item?.variation?.price ?? item?.product?.price ?? 0);

  return Number.isFinite(parsedPrice) ? parsedPrice : 0;
};

const normalizeCoinCount = (value) => {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return 0;
  }

  return Math.max(0, Math.floor(parsedValue));
};

export const getProductEarnedSdlCoins = ({ selectedVariation } = {}) => {
  return normalizeCoinCount(selectedVariation?.coinsCount);
};

export const getCartItemEarnedSdlCoins = (item) => {
  const coinsPerUnit = normalizeCoinCount(item?.variation?.coinsCount);

  return coinsPerUnit * getCartItemQuantity(item);
};

export const partitionCartItemsByAccess = (items = [], isDoctor = false) => {
  const safeItems = Array.isArray(items) ? items : [];

  return safeItems.reduce(
    (accumulator, item) => {
      const customerType = getCartItemCustomerType(item);

      if (customerType === CUSTOMER_TYPES.RETAILER) {
        accumulator.hiddenItems.push(item);
        return accumulator;
      }

      if (customerType === CUSTOMER_TYPES.DOCTOR && !isDoctor) {
        accumulator.restrictedItems.push(item);
        return accumulator;
      }

      if (isCartItemOutOfStock(item)) {
        accumulator.outOfStockItems.push(item);
        return accumulator;
      }

      accumulator.eligibleItems.push(item);
      return accumulator;
    },
    {
      eligibleItems: [],
      restrictedItems: [],
      outOfStockItems: [],
      hiddenItems: [],
    }
  );
};

export const groupCartItemsByCustomerType = (items = []) => {
  const safeItems = Array.isArray(items) ? items : [];
  const groups = [
    {
      key: CUSTOMER_TYPES.DOCTOR,
      title: 'Doctor Products',
    },
    {
      key: CUSTOMER_TYPES.DOCTOR_AND_CONSUMER,
      title: 'Doctor & Customer Products',
    },
  ];

  return groups
    .map((group) => {
      const groupItems = safeItems.filter(
        (item) => getCartItemCustomerType(item) === group.key
      );

      return {
        ...group,
        items: groupItems,
        itemCount: groupItems.length,
        totalQuantity: groupItems.reduce(
          (sum, item) => sum + getCartItemQuantity(item),
          0
        ),
      };
    })
    .filter((group) => group.items.length > 0);
};

export const getCartItemProductUid = (item) =>
  item?.product_id || item?.product?.id || item?.product?.uid || null;