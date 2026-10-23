import { SDL_BASE_URL } from '@/utils/constants';

export const fetchPreclinicalStudies = async () => {
  const res = await fetch(
    `${SDL_BASE_URL}/peclinicalstudies`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch preclinical studies');
  }
  return res.json();
};
