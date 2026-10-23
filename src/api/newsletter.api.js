import { SDL_BASE_URL } from "@/utils/constants";

export const subscribeNewsletter = async (email, recaptchaToken) => {
  const payload = { email };

  if (recaptchaToken) {
    payload.recaptchaToken = recaptchaToken;
  }

  const res = await fetch(`${SDL_BASE_URL}/newsletter/subscribe`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.message);
  }
  return data;
}