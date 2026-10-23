import { getAuthHeaders } from '@/api/wishlist.api';

const SDL_BASE_URL = process.env.SDL_BASE_URL || process.env.NEXT_PUBLIC_SDL_BASE_URL;

const parseResponse = async (response, fallbackMessage) => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || fallbackMessage);
  }

  return payload;
};

export const cultivatorAddFormApi = async (payload) => {  
  const response = await fetch(`${SDL_BASE_URL}/add-cultivated-offering`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  const parsedResponse = await parseResponse(response, 'Failed to add cultivator form');

  return parsedResponse;
};