
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

        const companyPages = result.data.companyPages;

        if (!Array.isArray(companyPages)) {
            return new Response("companyPages must be an array", {
                status: 502,
            });
        }

        return xmlResponse(createUrlSet(companyPages));
    } catch (error) {
        console.error("Company Policy sitemap error:", error);

        return new Response(
            "Failed to generate Company Policy sitemap",
            { status: 500 }
        );
    }
}
