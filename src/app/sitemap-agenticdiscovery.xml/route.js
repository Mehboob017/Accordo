
export async function GET() {
    const urls = [
        "https://www.sdlindia.com/agents.md",
        "https://www.sdlindia.com/llms.txt",
        "https://www.sdlindia.com/llms-full.txt",
    ];

    const entries = urls
        .map(
            (url) => `  <url>
    <loc>${url}</loc>
  </url>`
        )
        .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;

    return new Response(xml, {
        status: 200,
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=0, s-maxage=3600",
        },
    });
}
