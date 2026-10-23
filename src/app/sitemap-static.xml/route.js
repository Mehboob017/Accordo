
import { createUrlSet, xmlResponse } from "@/lib/sitemap";

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

        const urls = result.data.staticPages;

        if (!Array.isArray(urls)) {
            return new Response("staticPages must be an array", {
                status: 502,
            });
        }

        return xmlResponse(createUrlSet(urls));
    } catch (error) {
        console.error("Static sitemap error:", error);

        return new Response("Failed to generate static sitemap", {
            status: 500,
        });
    }
}
