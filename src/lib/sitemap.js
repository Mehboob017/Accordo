
const escapeXml = (value = "") =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

export function createUrlSet(urls = []) {
    const entries = urls
        .filter((item) => item?.loc)
        .map((item) => {
            const lastmod = item.lastModified
                ? `\n    <lastmod>${escapeXml(item.lastModified)}</lastmod>`
                : "";

            const changefreq = item.changefreq
                ? `\n    <changefreq>${escapeXml(item.changefreq)}</changefreq>`
                : "";

            return `  <url>
    <loc>${escapeXml(item.loc)}</loc>${lastmod}${changefreq}
  </url>`;
        })
        .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

export function xmlResponse(xml) {
    return new Response(xml, {
        status: 200,
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=0, s-maxage=3600",
        },
    });
}
