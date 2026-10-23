const SDL_BASE_URL =
  process.env.SDL_BASE_URL || process.env.NEXT_PUBLIC_SDL_BASE_URL;

const parseResponse = async (response, fallbackMessage) => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || fallbackMessage);
  }

  return payload;
};

const validateRequiredValue = (value, fieldName) => {
  if (
    value === undefined ||
    value === null ||
    value === '' ||
    Number(value) <= 0
  ) {
    throw new Error(`${fieldName} is required`);
  }

  return String(value);
};

export const checkDeliveryPincode = async ({
  pincode,
  selectedVariation,
} = {}) => {
  if (!pincode) {
    throw new Error('Pincode is required');
  }

  const requestBody = {
    // from_pincode: '410206',
    to_pincode: String(pincode).trim(),
    product_mrp: validateRequiredValue(
      selectedVariation?.mrp,
      'Product MRP'
    ),
    shipping_weight_kg: validateRequiredValue(
      selectedVariation?.weight,
      'Shipping weight'
    ),
    shipping_length_cms: validateRequiredValue(
      selectedVariation?.length,
      'Shipping length'
    ),
    shipping_width_cms: validateRequiredValue(
      selectedVariation?.width,
      'Shipping width'
    ),
    shipping_height_cms: validateRequiredValue(
      selectedVariation?.height,
      'Shipping height'
    ),
    payment_method: 'prepaid',
  };

  const response = await fetch(`${SDL_BASE_URL}/check-pincode`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const payload = await parseResponse(
    response,
    'Failed to check delivery availability'
  );

  return {
    success: Boolean(payload?.success),
    serviceable: Boolean(payload?.serviceable),
    expectedDeliveryDate: payload?.expected_delivery_date || '',
    zone: payload?.zone || '',
    message:
      payload?.message ||
      'Delivery timeline is not available for this pincode right now.',
  };
};        