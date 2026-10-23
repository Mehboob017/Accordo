export const APP_URLS = {
  ANDROID: 'https://play.google.com/store/apps/details?id=com.sdlindia.app',
  IOS: 'https://apps.apple.com',
}

export const PUBLIC_SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sdlindia.com'
).replace(/\/+$/, '');

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const RZP_PAYMENT_METHOD = 'ONLINE'

export const OFFER_TYPE_LABELS = {
  BUY_X_GET_Y_FREE: 'Buy X Get Y Free',
  FIXED_PRODUCT_BASED: 'Fixed Product Based',
  BUY_X_GET_Y_FIXED: 'Buy X Get Y Fixed',
  BUY_X_GET_Y_DISCOUNT: 'Buy X Get Y Discount',
  CART_VALUE_FREE_PRODUCT: 'Cart Value Free Product',
  SPECIAL_DISCOUNT: 'Special Discount',
};

export const SDL_BASE_URL = process.env.SDL_BASE_URL || process.env.NEXT_PUBLIC_SDL_BASE_URL;

export const isLocalhostEnvironment = () => {
  if (process.env.NODE_ENV === 'development') return true;
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.endsWith('.local')
    );
  }
  return false;
};

export const isTurnstileRequired = () => {
  if (process.env.NEXT_PUBLIC_REQUIRE_TURNSTILE === 'true') return true;
  if (process.env.NEXT_PUBLIC_REQUIRE_TURNSTILE === 'false') return false;
  return !isLocalhostEnvironment();
};