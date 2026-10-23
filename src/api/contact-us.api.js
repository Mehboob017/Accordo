const SDL_BASE_URL = process.env.SDL_BASE_URL || process.env.NEXT_PUBLIC_SDL_BASE_URL;

export const contactUs = async (payload) => {
  const res = await fetch(`${SDL_BASE_URL}/enquiryform`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  // console.log(data);

  if (!data.success) {
    throw new Error(data.message || 'Failed to submit enquiry.');
  }

  return data;
};