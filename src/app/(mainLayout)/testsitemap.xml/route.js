// app/sitemap.xml/route.js

export async function GET() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SDL_BASE_URL}/sitemap.xml`,
    {
      // cache: "no-store",
    }
  );

  if (!response.ok) {
    return new Response("Failed to fetch sitemap", { status: 500 });
  }

  const xml = await response.text();

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}