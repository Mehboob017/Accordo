import '../../public/assets/scss/app.scss';
// import NoSSR from '@/utils/NoSSR';
import LenisProvider from '@/providers/LenisProvider';
import { Poppins } from "next/font/google"
import Script from 'next/script'
import {
  // GoogleAnalytics,
  GoogleTagManager
} from '@next/third-parties/google'
import { Preconnect } from './preconnect';

// Variable font: single woff2 covers all weights (400–700) → 1 request instead of 4
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
  adjustFontFallback: true, // reduces layout shift by matching fallback metrics
})

export const viewport = {
  width: "device-width",
  initialScale: 1,
}

export const metadata = {
  metadataBase: new URL('https://www.sdlindia.com'),
  icons: {
    // icon: '/favicon.ico',
    // apple: '/apple-touch-icon.png',
    icon: [
      {
        url: '/favicon-48x48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        url: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
    ],
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
  manifest: '/site.webmanifest',
};

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className} suppressHydrationWarning={true}>
        <Preconnect />
        <LenisProvider>
          {children}
        </LenisProvider>

        <Script
          strategy="lazyOnload"
          src="https://news.google.com/swg/js/v1/publisher.js"
        />
        <GoogleTagManager gtmId="GTM-NBJ9WC2P" />
        {/* <GoogleAnalytics gaId="G-LXVFSMSSPW" /> */}
      </body>
    </html>
  );
}
