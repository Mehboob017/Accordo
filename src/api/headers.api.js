const SDL_BASE_URL = process.env.SDL_BASE_URL || process.env.NEXT_PUBLIC_SDL_BASE_URL;

const EMPTY_HEADERS_RESPONSE = {
  success: false,
  message: 'Failed to fetch header menu',
  data: [],
};

export const fetchHeaders = async () => {
  try {
    const res = await fetch(`${SDL_BASE_URL}/get-headers`, {
      // cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      return {
        ...EMPTY_HEADERS_RESPONSE,
        message: `Failed to fetch header menu (${res.status})`,
      };
    }

    const json = await res.json();

    return {
      success: Boolean(json?.success),
      message: json?.message || 'Header menu fetched successfully',
      data: Array.isArray(json?.data) ? json.data : [],
      topBar: Array.isArray(json?.topBar) ? json.topBar : [],
    };
  } catch (error) {
    return {
      ...EMPTY_HEADERS_RESPONSE,
      message: error.message || EMPTY_HEADERS_RESPONSE.message,
    };
  }
};
