import { SDL_BASE_URL } from "@/utils/constants";

export const fetchPresses = async ({ page = 1, limit = 12 } = {}) => {
  const res = await fetch(
    `${SDL_BASE_URL}/presses?page=${page}&limit=${limit}`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch presses');
  }
  return res.json();
};
