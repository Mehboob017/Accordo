import { getAuthHeaders } from "@/api/wishlist.api";
import { useMutation } from "@tanstack/react-query";

const SDL_BASE_URL = process.env.SDL_BASE_URL || process.env.NEXT_PUBLIC_SDL_BASE_URL;

const verifyGstApi = async (payload) => {
  const response = await fetch(`${SDL_BASE_URL}/verify-gst`, {
    method: "POST",
    cache: 'no-store',
    credentials: 'include',
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  // console.log('hook data', { data, response })

  if (!response.ok) {
    throw new Error(data.message || "Failed to verify GSTIN");
  }

  return data;
};

export const useVerifyGst = () =>
  useMutation({
    mutationKey:"verify-gstin",
    mutationFn: verifyGstApi,
  });