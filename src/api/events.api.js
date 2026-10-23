const SDL_BASE_URL = process.env.SDL_BASE_URL || process.env.NEXT_PUBLIC_SDL_BASE_URL;

/**
 * @typedef {Object} EventCategory
 * @property {string} uid
 * @property {string} name
 * @property {string} slug
 */

/**
 * @typedef {Object} Event
 * @property {string} uid
 * @property {string} title
 * @property {string} slug
 * @property {string} eventCategoryUid
 * @property {EventCategory} eventCategory
 */

/**
 * @typedef {Object} EventSuggestionsData
 * @property {Event[]} events
 * @property {number} count
 */

/**
 * @typedef {Object} EventSuggestionsSuccessResponse
 * @property {true} success
 * @property {string} message
 * @property {EventSuggestionsData} data
 */

/**
 * @typedef {Object} EventSuggestionsFailureResponse
 * @property {false} success
 * @property {string} message
 */

/**
 * @typedef {EventSuggestionsSuccessResponse | EventSuggestionsFailureResponse}
 * EventSuggestionsApiResponse
 */

/**
 * Fetch event suggestions safely
 * @param {string} searchTerm
 * @returns {Promise<Event[]>}
 */
export const fetchEventSuggestions = async (searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) {
    return [];
  }

  const url = `${SDL_BASE_URL}/events/search?search=${encodeURIComponent(
    searchTerm
  )}`;

  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error('Failed to fetch event suggestions');
  }

  /** @type {EventSuggestionsApiResponse} */
  const json = await res.json();

  if (!json.success) {
    console.warn(json.message);
    return [];
  }

  // Extra safety in case backend changes
  if (!Array.isArray(json.data?.events)) {
    return [];
  }

  return json.data.events;
};

export const fetchEvents = async (params = {}) => {
  const {
    category = '',
    limit = '',
    search = '',
    filter = '',
    page = 1,
    sortBy = '',
    field = '',
  } = params;

  const queryParams = new URLSearchParams();
  if (category) queryParams.set('category', category);
  if (limit) queryParams.set('limit', limit);
  if (search) queryParams.set('search', search);
  if (filter) queryParams.set('filter', filter);
  if (page) queryParams.set('page', page);
  if (sortBy) queryParams.set('sort', sortBy);
  if (field) queryParams.set('field', field);

  const queryString = queryParams.toString();
  const url = `${SDL_BASE_URL}/events${queryString ? `?${queryString}` : ''}`;

  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error('Failed to fetch events');
  }

  return res.json();
};

export const fetchCalendarEvents = async (params = {}) => {
  const {
    category = '',
    search = '',
    filter = '',
    date = '',
    sortBy = '',
    field = '',
  } = params;

  const queryParams = new URLSearchParams();
  if (category) queryParams.set('category', category);
  if (search) queryParams.set('search', search);
  if (filter) queryParams.set('filter', filter);
  if (date) queryParams.set('date', date);
  if (sortBy) queryParams.set('sort', sortBy);
  if (field) queryParams.set('field', field);

  const queryString = queryParams.toString();
  const url = `${SDL_BASE_URL}/events/calendar${queryString ? `?${queryString}` : ''}`;

  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error('Failed to fetch calendar events');
  }

  return res.json();
};

export const fetchEventDetail = async ({ eventSlug }) => {
  if (!eventSlug) throw new Error('Event slug is required to fetch event detail');

  const url = `${SDL_BASE_URL}/events/${eventSlug}`;

  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error('Failed to fetch event detail');
  }

  return res.json();
}
