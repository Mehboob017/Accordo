const SDL_BASE_URL = process.env.SDL_BASE_URL || process.env.NEXT_PUBLIC_SDL_BASE_URL;

export const fetchClinics = async (params = {}) => {
  const { limit = 12, page = 1, search = '', specialization = '', sortBy = '' } = params;

  const queryParams = new URLSearchParams();
  queryParams.append('limit', limit);
  queryParams.append('page', page);
  if (search) queryParams.append('search', search);
  if (sortBy) queryParams.set('sort', sortBy);
  if (specialization) queryParams.append('specialization', specialization);

  const res = await fetch(
    `${SDL_BASE_URL}/clinics?${queryParams.toString()}`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch clinics');
  }
  return res.json();
};

/**
 * Fetch clinic suggestions for search autocomplete
 * @param {string} searchTerm
 * @returns {Promise<Clinic[]>}
 */
export const fetchClinicSuggestions = async (searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) {
    return [];
  }

  const queryParams = new URLSearchParams();
  queryParams.append('search', searchTerm);

  const res = await fetch(
    `${SDL_BASE_URL}/search/clinics?${queryParams.toString()}`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch clinic suggestions');
  }

  const json = await res.json();

  if (!json.success) {
    console.warn(json.message);
    return [];
  }

  if (!Array.isArray(json.data?.clinics)) {
    return [];
  }

  return json.data.clinics;
};
