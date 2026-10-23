import { SDL_BASE_URL } from "@/utils/constants";

export const getAuthHeaders = () => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('userToken');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

export const fetchWishlist = async ({ page = 1, limit = 10 } = {}) => {
  const authHeaders = getAuthHeaders();

  if (!authHeaders.Authorization) {
    throw new Error('Authentication required');
  }

  const url = `${SDL_BASE_URL}/wishlist?page=${page}&limit=${limit}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch wishlist');
  }

  const data = await response.json();
  return data;
};


export const toggleWishlist = async ({ productUid, add } = {}) => {
  const authHeaders = getAuthHeaders();

  if (!authHeaders.Authorization) {
    throw new Error('Authentication required');
  }

  const body = JSON.stringify({ add });

  const url = `${SDL_BASE_URL}/wishlistUpdate/${productUid}`;

  const response = await fetch(url, {
    method: 'POST',
    cache: 'no-store',
    body,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update wishlist');
  }

  const data = await response.json();
  return data;
};

export const addToWishlist = async ({ productUid, add = true } = {}) => {
  return toggleWishlist({ productUid, add });
};

export const removeFromWishlist = async ({ productUid, add = false } = {}) => {
  return toggleWishlist({ productUid, add });
};

export const fetchWishlistArray = async () => {
  const authHeaders = getAuthHeaders();

  if (!authHeaders.Authorization) {
    throw new Error('Authentication required');
  }

  const url = `${SDL_BASE_URL}/wishlist-array`;

  const response = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch wishlist array');
  }

  const data = await response.json();
  return data;
}