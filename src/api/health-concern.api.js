const SDL_BASE_URL =
  process.env.SDL_BASE_URL ||
  process.env.NEXT_PUBLIC_SDL_BASE_URL;

export const fetchHealthConcernDetail = async ({
  healthConcernSlug,
  page = 1,
  limit = 8,
}) => {
  if (!healthConcernSlug) {
    throw new Error('Health concern slug is required');
  }

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const url = `${SDL_BASE_URL}/health-concerns/${healthConcernSlug}?${params}`;

  try {
    const res = await fetch(url, {
      next: {
        revalidate: 60 * 60 * 24 * 1, // 1 day
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(
        `Failed to fetch health concern detail: ${res.status} ${res.statusText}`
      );
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching health concern detail:', error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to fetch health concern detail',
      data: null,
    };
  }
};