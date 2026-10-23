import { NextResponse } from 'next/server';
import { getStoreUrl, isAppOnlyPath } from './lib/app-deeplink';

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  // Skip static assets
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.startsWith('/favicon') ||
    path.startsWith('/apple-touch-icon') ||
    path.startsWith('/site.webmanifest')
    // || /\.(?:ico|png|jpg|jpeg|svg|webp|webmanifest|txt|xml|pdf)$/i.test(path)
  ) {
    return NextResponse.next();
  }


  // console.log('\n========== MIDDLEWARE HIT ==========');
  // console.log('Path:', path);
  // console.log('Full URL:', request.nextUrl.href);

  // App-only path detection
  if (isAppOnlyPath(path)) {
    const storeUrl = getStoreUrl(request.headers.get('user-agent'));

    // console.log('App-only path detected');
    // console.log('Store URL:', storeUrl);

    if (storeUrl) {
      const targetStoreUrl = new URL(storeUrl, request.url);
      return NextResponse.redirect(targetStoreUrl);
    }
  }

  /**
   * URL redirection check
   */
  try {
    const currentRoute = request.nextUrl.pathname + request.nextUrl.search;
    // const currentRoute = request.nextUrl.pathname;
    // console.log('Sending route:', currentRoute);

    const baseUrl = process.env.NEXT_PUBLIC_SDL_BASE_URL;
    // console.log('BASE URL:', baseUrl);

    if (baseUrl) {
      const cleanBaseUrl = baseUrl.replace(/\/$/, '');
      const redirectApiUrl = `${cleanBaseUrl}/check-url-redirection?url=${encodeURIComponent(currentRoute)}`;

      // console.log('Checking route:', currentRoute);
      // console.log('Calling:', redirectApiUrl);

      const redirectResponse = await fetch(redirectApiUrl,
        // {
        //   cache: 'no-store',
        // }
      );

      if (redirectResponse.ok) {
        const redirectData = await redirectResponse.json();

        // console.log('Redirect response:', redirectData);

        if (
          redirectData?.success === true &&
          redirectData?.redirect === true &&
          redirectData?.destination
        ) {
          // Safely constructs absolute target URL for both relative paths and complete external/internal URLs
          const targetUrl = new URL(redirectData.destination, request.url);

          // INFINITE LOOP GUARD: Prevent redirecting to the exact same URL
          if (targetUrl.href !== request.nextUrl.href) {
            // console.log(
            //   'Redirecting:',
            //   currentRoute,
            //   '->',
            //   targetUrl.href
            // );

            return NextResponse.redirect(targetUrl, 301);
          } else {
            // console.log('Redirect loop prevented: Target URL is identical to current URL');
          }
        }
      } else {
        console.error('Redirect API returned non-OK status:', redirectResponse.status);
      }
    } else {
      console.error('NEXT_PUBLIC_SDL_BASE_URL is not defined in environment variables.');
    }
  } catch (error) {
    console.error('Redirect lookup failed:', error);
  }

  // console.log('No redirect. Continuing request.');
  // console.log('====================================\n');

  return NextResponse.next();
}

/**
 * Filter out static assets, system routes, and Next.js hover/viewport prefetches
 */
export const config = {
  // Exclude static assets, icons, manifest, and system routes from middleware
  matcher: [
    '/((?!api|_next/static|_next/image|favicon|apple-touch-icon|site\\.webmanifest|assets).*)',
  ],
};