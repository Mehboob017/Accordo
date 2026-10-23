import { SDL_BASE_URL } from '@/utils/constants';

export const fetchStaticSeoPages = async () => {
  const res = await fetch(`${SDL_BASE_URL}/getstaticseopages`, {
    method: 'GET',
    // cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    return { success: false, data: null };
  }

  return res.json();
};

export const fetchSeoBySlug = async (slug, type = 'Static') => {
  const params = new URLSearchParams({ slug, type });

  try {
    const res = await fetch(`${SDL_BASE_URL}/seo?${params.toString()}`, {
      method: 'GET',
      // cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.success) {
      return { success: false, data: null, message: data?.message };
    }

    return data;
  } catch {
    return { success: false, data: null };
  }
};
