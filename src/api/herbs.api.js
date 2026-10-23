const SDL_BASE_URL = process.env.SDL_BASE_URL || process.env.NEXT_PUBLIC_SDL_BASE_URL;

export const fetchHerbs = async (params = { category: '', limit: '', search: '', filter: '', page: '1', sortBy: '' }) => {
  const { category = '', limit = '', search = '', filter = '', page = '1', sortBy = '' } = params;

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (search) queryParams.append('search', search);
  if (category) queryParams.append('category', category);
  if (filter) queryParams.append('filter', filter);
  if (page) queryParams.append('page', page.toString());
  if (limit) queryParams.append('limit', limit.toString());
  if (sortBy) queryParams.append('sort', sortBy);

  const queryString = queryParams.toString();
  const url = `${SDL_BASE_URL}/herbs${queryString ? `?${queryString}` : ''}`;

  try {
    const res = await fetch(url, {
      // cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch herbs: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();

    if (!json.success) {
      console.warn('API returned unsuccessful response:', json.message);
      return {
        success: false,
        message: json.message || 'Failed to fetch herbs',
        data: {
          herbs: [],
          pagination: {
            total: 0,
            page: 1,
            limit: parseInt(params.limit) || 12,
            totalPages: 0,
          },
        },
      };
    }

    return json;
  } catch (error) {
    console.error('Error fetching herbs:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch herbs',
      data: {
        herbs: [],
        pagination: {
          total: 0,
          page: 1,
          limit: parseInt(limit) || 12,
          totalPages: 0,
        },
      },
    };
  }
};

export const fetchHerbSuggestions = async (searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) {
    return [];
  }

  const url = `${SDL_BASE_URL}/herb/search?search=${encodeURIComponent(
    searchTerm
  )}`;

  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error('Failed to fetch herb suggestions');
  }

  const json = await res.json();

  if (!json.success) {
    console.warn(json.message);
    return [];
  }

  if (!json.data || !Array.isArray(json.data.herbs)) {
    return [];
  }

  return json.data.herbs;
};


export const fetchHerbDetail = async ({ herbSlug }) => {
  if (!herbSlug) throw new Error('Herb slug is required to fetch herb detail');

  const url = `${SDL_BASE_URL}/herbs/${herbSlug}`;

  try {
    const res = await fetch(url, {
      // cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch herb detail: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();

    if (!json.success) {
      return {
        success: false,
        message: json.message || 'Herb not found',
        data: null,
      };
    }

    return json;
  } catch (error) {
    console.error('Error fetching herb detail:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch herb detail',
      data: null,
    };
  }
};


export const fetchAnnualHerbRequirements = async (params = { page: 1, limit: 10 }) => {
  const { page = 1, limit = 10 } = params;

  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());

  const url = `${SDL_BASE_URL}/annual-requirements?${queryParams.toString()}`;

  try {
    const res = await fetch(url, {
      // cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(
        `Failed to fetch annual requirements: ${res.status} ${res.statusText}`
      );
    }

    const json = await res.json();

    if (!json?.success) {
      return {
        success: false,
        message: json?.message || 'Failed to fetch annual requirements',
        data: {
          cultivators: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0,
          },
        },
      };
    }

    return json;
  } catch (error) {
    console.error('Error fetching annual requirements:', error);
    return {
      success: false,
      message: error?.message || 'Failed to fetch annual requirements',
      data: {
        cultivators: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      },
    };
  }
};
