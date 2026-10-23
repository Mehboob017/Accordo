export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || '348446167114642';

/**
 * Standard Meta Pixel track wrapper
 */
export const trackMetaEvent = (eventName, params = {}) => {
  if (typeof window === 'undefined') return;
  if (typeof window.fbq !== 'function') return;

  window.fbq('track', eventName, params);
};

/**
 * Normalizes and updates Advanced Matching user data on the Meta Pixel instance.
 * Plain text fields are automatically hashed (SHA-256) client-side by Meta's fbevents.js script before transmission.
 */
export const updateMetaUserData = (userData = {}) => {
  if (typeof window === 'undefined') return;
  if (typeof window.fbq !== 'function') return;

  const matchData = {};

  if (userData.email && typeof userData.email === 'string') {
    const cleanEmail = userData.email.trim().toLowerCase();
    if (cleanEmail) matchData.em = cleanEmail;
  }

  if (userData.phone) {
    const rawPhone = String(userData.phone).replace(/\D/g, '');
    if (rawPhone.length >= 10) {
      // Normalize with India 91 prefix if 10 digits
      matchData.ph = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    }
  }

  if (userData.firstName && typeof userData.firstName === 'string') {
    const cleanFn = userData.firstName.trim().toLowerCase();
    if (cleanFn) matchData.fn = cleanFn;
  }

  if (userData.lastName && typeof userData.lastName === 'string') {
    const cleanLn = userData.lastName.trim().toLowerCase();
    if (cleanLn) matchData.ln = cleanLn;
  }

  if (userData.city && typeof userData.city === 'string') {
    const cleanCity = userData.city.trim().toLowerCase().replace(/[^a-z]/g, '');
    if (cleanCity) matchData.ct = cleanCity;
  }

  if (userData.state && typeof userData.state === 'string') {
    const cleanState = userData.state.trim().toLowerCase();
    if (cleanState) matchData.st = cleanState;
  }

  if (userData.pincode || userData.zip) {
    const cleanZip = String(userData.pincode || userData.zip).trim();
    if (cleanZip) matchData.zp = cleanZip;
  }

  if (userData.country) {
    matchData.country = String(userData.country).trim().toLowerCase().slice(0, 2);
  } else {
    matchData.country = 'in';
  }

  if (userData.externalId || userData.uid) {
    const cleanId = String(userData.externalId || userData.uid).trim();
    if (cleanId) matchData.external_id = cleanId;
  }

  // Only re-init if at least one valid identity parameter exists
  if (Object.keys(matchData).length > 0) {
    window.fbq('init', META_PIXEL_ID, matchData);
  }
};

/**
 * Captures fbclid from URL and sets the 1st-party _fbc cookie if present.
 * Strictly does NOT fabricate dummy or random data if fbclid is missing.
 */
export const captureFbclid = () => {
  if (typeof window === 'undefined') return;

  try {
    const params = new URLSearchParams(window.location.search);
    const fbclid = params.get('fbclid');

    if (fbclid && !document.cookie.includes('_fbc=')) {
      const creationTime = Date.now();
      const fbcValue = `fb.1.${creationTime}.${fbclid}`;
      const domain = window.location.hostname;
      const maxAge = 90 * 24 * 60 * 60; // 90 days

      document.cookie = `_fbc=${fbcValue}; path=/; max-age=${maxAge}; domain=${domain}; SameSite=Lax`;
    }
  } catch (err) {
    // Ignore cookie write issues on restricted browser environments
  }
};