import { getAuthHeaders } from '@/api/wishlist.api';

const SDL_BASE_URL = process.env.SDL_BASE_URL || process.env.NEXT_PUBLIC_SDL_BASE_URL;

export const parseJsonOrEmpty = async (response) => {
  return response.json().catch(() => ({}));
};

export const fetchMyOrders = async (params = {}) => {
  const { page = 1, limit = 10 } = params;

  const headers = getAuthHeaders();

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const response = await fetch(
    `${SDL_BASE_URL}/orders/my-orders?${queryParams.toString()}`,
    {
      method: 'GET',
      cache: 'no-store',
      headers,
      credentials: 'include',
    }
  );

  const data = await parseJsonOrEmpty(response);

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to fetch orders');
  }

  return data;
};

export const fetchOrderDetail = async (orderUid) => {
  if (!orderUid) {
    throw new Error('Order uid is required');
  }

  const headers = getAuthHeaders();

  const response = await fetch(`${SDL_BASE_URL}/orders/detail/${orderUid}`, {
    method: 'GET',
    cache: 'no-store',
    headers,
    credentials: 'include',
  });

  const data = await parseJsonOrEmpty(response);

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to fetch order details');
  }

  return data;
};

export const fetchReturnOverview = async (trxUid) => {
  const normalizedTrxUid = String(trxUid || '').trim();

  if (!normalizedTrxUid) {
    throw new Error('Transaction uid is required');
  }

  const headers = getAuthHeaders();

  const response = await fetch(
    `${SDL_BASE_URL}/returns/overview/${normalizedTrxUid}`,
    {
      method: 'GET',
      cache: 'no-store',
      headers,
      credentials: 'include',
    }
  );

  const data = await parseJsonOrEmpty(response);

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to fetch return overview');
  }

  return data;
};

export const fetchReturnNew = async (trxUid) => {
  const normalizedTrxUid = String(trxUid || '').trim();

  if (!normalizedTrxUid) {
    throw new Error('Transaction uid is required');
  }

  const headers = getAuthHeaders();

  const response = await fetch(
    `${SDL_BASE_URL}/returns/new/${normalizedTrxUid}`,
    {
      method: 'GET',
      cache: 'no-store',
      headers,
      credentials: 'include',
    }
  );

  const data = await parseJsonOrEmpty(response);

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to fetch new return data');
  }

  return data;
};

export const orderAgain = async ({ trxUid } = {}) => {
  const normalizedTrxUid = String(trxUid || '').trim();

  if (!normalizedTrxUid) {
    throw new Error('Transaction uid is required');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  };

  const response = await fetch(`${SDL_BASE_URL}/order-again`, {
    method: 'POST',
    cache: 'no-store',
    headers,
    credentials: 'include',
    body: JSON.stringify({ trxUid: normalizedTrxUid }),
  });

  const data = await parseJsonOrEmpty(response);

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to place order again');
  }

  return data;
};

export const createReturnRequest = async (trxUid, payload) => {
  if (!trxUid) {
    throw new Error('Transaction uid is required');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  };

  const updatedPayload = { ...payload, raisedByType: 'Website' }

  const response = await fetch(`${SDL_BASE_URL}/returns/${trxUid}`, {
    method: 'POST',
    cache: 'no-store',
    credentials: 'include',
    headers,
    body: JSON.stringify(updatedPayload),
  });

  const data = await parseJsonOrEmpty(response);

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to create return request');
  }

  return data;
};

export const addProductReview = async (trxUid, payload) => {
  if (!trxUid) {
    throw new Error('Transaction uid is required');
  }

  // console.log(payload);

  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  }

  const response = await fetch(`${SDL_BASE_URL}/orders/${trxUid}`, {
    method: 'POST',
    cache: 'no-store',
    credentials: 'include',
    headers,
    body: JSON.stringify(payload),
  })

  const data = await parseJsonOrEmpty(response);

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to add product review');
  }

  return data;
}

export const fetchReturnDetail = async (returnUid) => {
  const normalizedUid = String(returnUid || '').trim();

  if (!normalizedUid) {
    throw new Error('Return uid is required');
  }

  const headers = getAuthHeaders();

  const response = await fetch(`${SDL_BASE_URL}/returns/${normalizedUid}`, {
    method: 'GET',
    cache: 'no-store',
    headers,
    credentials: 'include',
  });

  const data = await parseJsonOrEmpty(response);

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to fetch return details');
  }

  return data;
};

export const notifyProductAvailability = async ({ productUid = '', variantUid = '' } = {}) => {
  if (!productUid || !variantUid) {
    throw new Error('Product uid and variant uid are required');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  };

  const response = await fetch(`${SDL_BASE_URL}/notify`, {
    method: 'POST',
    cache: 'no-store',
    headers,
    credentials: 'include',
    body: JSON.stringify({
      productUid,
      variantUid,
    }),
  });

  const data = await parseJsonOrEmpty(response);

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to subscribe for product notification');
  }

  return data;
};

export const cancelOrder = async (trxUid) => {
  const normalizedTrxUid = String(trxUid || '').trim();

  if (!normalizedTrxUid) {
    throw new Error('Transaction uid is required to cancel order');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  };

  const response = await fetch(`${SDL_BASE_URL}/order/cancel`, {
    method: 'POST',
    cache: 'no-store',
    headers,
    credentials: 'include',
    body: JSON.stringify({ trxUid: normalizedTrxUid }),
  });

  const data = await parseJsonOrEmpty(response);

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to cancel order');
  }

  return data;
}

export const cancelReturnRequest = async (returnUid) => {
  const normalizedReturnUid = String(returnUid || '').trim();

  if (!normalizedReturnUid) {
    throw new Error('Return uid is required to cancel return request');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  };

  const response = await fetch(`${SDL_BASE_URL}/returns/cancel/${normalizedReturnUid}`, {
    cache: 'no-store',
    headers,
    credentials: 'include',
  });

  const data = await parseJsonOrEmpty(response);

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to cancel return request');
  }

  return data;
};

export const rateOrder = async (trxUid, payload) => {
  if (!trxUid) {
    throw new Error('Transaction uid is required to rate order');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  };

  const response = await fetch(`${SDL_BASE_URL}/orders/review/${trxUid}`, {
    method: 'POST',
    cache: 'no-store',
    headers,
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const data = await parseJsonOrEmpty(response);

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to rate order');
  }

  return data;
}

export const paymentCancelled = async (payload) => {
  const { razorpay_order_id,
    // razorpay_payment_id, 
    trxUid } = payload;

  // 1. Validation check
  if (!razorpay_order_id || !trxUid) {
    return {
      status: "error",
      message: "Missing required fields in payload.",
    };
  }

  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
  };

  const response = await fetch(`${SDL_BASE_URL}/orders/payment-failed`, {
    method: 'POST',
    cache: 'no-store',
    headers,
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const data = await parseJsonOrEmpty(response);

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to cancel payment');
  }

  return data;
}