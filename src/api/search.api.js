import { getAuthHeaders } from "./wishlist.api";

const SDL_BASE_URL = process.env.SDL_BASE_URL || process.env.NEXT_PUBLIC_SDL_BASE_URL;

/**
 * @typedef {'product'|'category'|'department'|'health interest'|'herb'|'event category'|'event subcategory'|'event'|'blog category'|'blog'|'resource category'|'resource subcategory'|'resources'} SearchResultType
 */

/**
 * @typedef {Object} SearchResult
 * @property {string} uid
 * @property {string} name
 * @property {SearchResultType} type
 * @property {string} slug
 * @property {string} redirectUrl
 * @property {string} image
 * @property {string} imageAlt
 */

/**
 * @typedef {Object} SearchResponse
 * @property {boolean} success
 * @property {SearchResult[]} data
 * @property {string} [message]
 */

/**
 * Fetches global search results for a given query.
 * @param {string} query
 * @returns {Promise<SearchResponse>}
 */
export const fetchGlobalSearch = async (query) => {
  try {
    const url = `${SDL_BASE_URL}/web-global-search?q=${encodeURIComponent(query)}`;

    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      credentials: 'include',
    });

    if (!res.ok) {
      return {
        success: false,
        data: [],
        message: `Search request failed (${res.status})`,
      };
    }

    const json = await res.json();

    return {
      success: Boolean(json?.success),
      data: Array.isArray(json?.data) ? json.data : [],
      message: json?.message || '',
      // totalResults: typeof json?.totalResults === 'number' ? json.totalResults : undefined,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: error?.message || 'Failed to fetch search results',
    };
  }
};
