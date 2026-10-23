export const APP_SCHEME = "sdlapp";
export const ANDROID_PACKAGE = "com.sdlindia.app";
export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;

/**
 * Paths that should redirect mobile users to the Play Store if the app
 * is not installed. Products are intentionally excluded — they open
 * normally on the website.
 */
export const APP_ONLY_PATHS = [
  '/videos',
  '/podcasts',
  // '/blogs',
  '/authors',
];

/**
 * Returns true if the given pathname is an app-only path
 * (exact match or any sub-path).
 */
export function isAppOnlyPath(pathname) {
  return APP_ONLY_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

/**
 * Returns the Play Store URL for Android users.
 * iOS is not handled for now (no App Store URL yet).
 * Desktop/unknown also returns null → no redirect.
 */
export function getStoreUrl(userAgent) {
  const ua = userAgent ?? '';
  const isAndroid = /Android/i.test(ua);
  if (isAndroid) return PLAY_STORE_URL;
  return null; // iOS and desktop: no redirect
}

export function getAppSchemeUrl(path) {
  const cleaned = String(path || "").replace(/^\/+/, "");
  return cleaned ? `${APP_SCHEME}://${cleaned}` : "";
}