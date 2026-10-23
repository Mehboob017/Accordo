import { SDL_BASE_URL } from "@/utils/constants";
import { getAuthHeaders } from '@/api/wishlist.api';
import Cookies from 'js-cookie';

export const fetchHome = async () => {
  const url = `${SDL_BASE_URL}/home`;
  let authHeaders = getAuthHeaders();
  let token = null;

  if (typeof window === 'undefined') {
    // Server-side execution
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      token = cookieStore.get('userToken')?.value;
    } catch (error) {
      console.warn("Could not retrieve cookies on the server");
    }
  } else {
    // Client-side execution
    token = Cookies.get('userToken') || localStorage.getItem('userToken');
  }

  if (token) {
    authHeaders = { Authorization: `Bearer ${token}` };
  }

  // console.log("Authorization Header / Bearer Token:", authHeaders);

  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch home api');
  }

  return res.json();
};

export const fetchHomeSection = async (section) => {
  const url = `${SDL_BASE_URL}/home-new?section=${section}`;
  const res = await fetch(url, { method: 'GET', credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to fetch home section ${section}`);
  return res.json();
};