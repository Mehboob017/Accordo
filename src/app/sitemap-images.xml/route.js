
const escapeXml = (value = "") =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_SDL_BASE_URL;

        if (!baseUrl) {
            throw new Error("NEXT_PUBLIC_SDL_BASE_URL is not configured");
        }

        const response = await fetch(
            `${baseUrl.replace(/\/+$/, "")}/sitemap.xml`,
            { cache: "no-store" }
        );

        if (!response.ok) {
            return new Response("Failed to fetch sitemap API", {
                status: 502,
            });
        }

        const result = await response.json();

        if (!result.success || !result.data) {
            return new Response("Invalid sitemap API response", {
                status: 502,
            });
        }

        const images = result.data.images;

        if (!Array.isArray(images)) {
            return new Response("images must be an array", {
                status: 502,
            });
        }

        const entries = images
            .filter((item) => item?.loc && item?.image)
            .map(
                (item) => `  <url>
    <loc>${escapeXml(item.loc)}</loc>
    <image:image>
      <image:loc>${escapeXml(item.image)}</image:loc>
    </image:image>
  </url>`
            )
            .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries}
</urlset>`;

        return new Response(xml, {
            status: 200,
            headers: {
                "Content-Type": "application/xml; charset=utf-8",
                "Cache-Control": "public, max-age=0, s-maxage=3600",
            },
        });
    } catch (error) {
        console.error("Images sitemap error:", error);

        return new Response("Failed to generate Images sitemap", {
            status: 500,
        });
    }
}
