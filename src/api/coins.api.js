import { getAuthHeaders } from '@/api/wishlist.api';

const SDL_BASE_URL = process.env.SDL_BASE_URL || process.env.NEXT_PUBLIC_SDL_BASE_URL;

const parseJsonOrEmpty = async (response) => {
  return response.json().catch(() => ({}));
};

export const fetchCoins = async (params = {}) => {
  const { page = 1, limit = 10 } = params;

  const headers = getAuthHeaders();
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const response = await fetch(
    `${SDL_BASE_URL}/getCoins?${queryParams.toString()}`,
    {
      method: 'GET',
      cache: 'no-store',
      headers,
      credentials: 'include',
    }
  );

  const data = await parseJsonOrEmpty(response);

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || 'Failed to fetch coins');
  }

  return data;
};
