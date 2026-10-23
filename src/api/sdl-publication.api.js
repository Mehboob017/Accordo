import { getAuthHeaders } from "@/api/wishlist.api";

const SDL_BASE_URL = process.env.SDL_BASE_URL || process.env.NEXT_PUBLIC_SDL_BASE_URL;

/**
 * Fetch SDL Publications
 * @returns {Promise<Object>} API response with publications, categories, and customer info
 * @throws {Error} If request fails or token is invalid
 */
export const fetchSDLPublications = async () => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    };

    const response = await fetch(`${SDL_BASE_URL}/sdlpublication`, {
      method: 'GET',
      headers,
      cache: 'no-store',
      credentials: 'include',
    });

    const data = await response.json();

    // Handle error responses
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch SDL publications');
    }

    return {
      success: true,
      publications: data.data?.sdlpublications || [],
      categories: data.data?.resourcecategories || [],
      customerInfo: data.data?.customerInfo || null,
    };
  } catch (error) {
    console.error('SDL Publications API Error:', error);
    throw error;
  }
};

/**
 * Check if user has valid token for SDL publications access
 * @returns {boolean} True if token exists in sessionStorage
 */
export const hasValidToken = () => {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('userToken');
  return !!token;
};
