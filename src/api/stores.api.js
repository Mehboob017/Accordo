import { SDL_BASE_URL } from "@/utils/constants";

export const fetchStores = async ({
  search = '',
  limit = 15,
  page = 1,
  sortBy = 'asc',
  field = 'created_at',
} = {}) => {
  const params = new URLSearchParams();

  if (search) {
    params.append('search', search);
  }

  params.append('limit', limit);
  params.append('page', page);
  params.append('sort', sortBy);
  params.append('field', field);

  const res = await fetch(
    `${SDL_BASE_URL}/stores?${params.toString()}`,
    {
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch stores');
  }

  return res.json();
};

/**
 * Fetch store suggestions for search autocomplete
 * @param {string} searchTerm
 * @returns {Promise<Store[]>}
 */
export const fetchStoreSuggestions = async (searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) {
    return [];
  }

  const params = new URLSearchParams();
  params.append('search', searchTerm);

  const res = await fetch(
    `${SDL_BASE_URL}/search/stores?${params.toString()}`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch store suggestions');
  }

  const json = await res.json();

  if (!json.success) {
    console.warn(json.message);
    return [];
  }

  if (!Array.isArray(json.data?.stores)) {
    return [];
  }

  return json.data.stores;
};
