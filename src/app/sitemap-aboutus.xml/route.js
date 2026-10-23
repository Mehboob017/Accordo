
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

        const urls = result.data.aboutPages;

        if (!Array.isArray(urls)) {
            return new Response("aboutPages must be an array", {
                status: 502,
            });
        }

        return xmlResponse(createUrlSet(urls));
    } catch (error) {
        console.error("About us sitemap error:", error);

        return new Response("Failed to generate About us sitemap", {
            status: 500,
        });
    }
}
