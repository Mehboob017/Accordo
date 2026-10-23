const SDL_BASE_URL = process.env.SDL_BASE_URL || process.env.NEXT_PUBLIC_SDL_BASE_URL;

export const fetchFaqs = async ({ categoryUid } = {}) => {
  const params = new URLSearchParams();

  if (categoryUid) {
    params.set('categoryUid', categoryUid);
  }

  const queryString = params.toString() ? `?${params.toString()}` : '';

  const res = await fetch(
    `${SDL_BASE_URL}/faqs${queryString}`,
    {
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch FAQs');
  }

  return res.json();
};

