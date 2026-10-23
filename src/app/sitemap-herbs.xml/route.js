
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

        const herbs = result.data.herbs;

        if (!Array.isArray(herbs)) {
            return new Response("herbs must be an array", {
                status: 502,
            });
        }

        return xmlResponse(createUrlSet(herbs));
    } catch (error) {
        console.error("Herbs sitemap error:", error);

        return new Response("Failed to generate Herbs sitemap", {
            status: 500,
        });
    }
}
