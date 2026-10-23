
const BASE_URL = "https://www.sdlindia.com";

const sitemapFiles = [
    "sitemap-static.xml",
    "sitemap-agenticdiscovery.xml",
    "sitemap-aboutus.xml",
    "sitemap-consumerayurved.xml",
    "sitemap-vaidyaseva.xml",
    "sitemap-ayurvedicpharmacy.xml",
    "sitemap-blogs.xml",
    "sitemap-images.xml",
    "sitemap-herbs.xml",
    "sitemap-healthconcerns.xml",
    "sitemap-events.xml",
    "sitemap-companypolicy.xml",
];

export async function GET() {
    const sitemapEntries = sitemapFiles
        .map(
            (file) => `  <sitemap>
    <loc>${BASE_URL}/${file}</loc>
  </sitemap>`
        )
        .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;

    return new Response(xml, {
        status: 200,
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=0, s-maxage=3600",
        },
    });
}
