import MainLayout from '@/layout';
import { dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/utils/getQueryClient';
import Script from 'next/script';

export const metadata = {
  title: {
    default: 'SDL India',
    template: '%s | SDL India',
  },
};

export default async function RootLayout({ children }) {
  // Get the cached QueryClient instance for this request
  const queryClient = getQueryClient();

  // Dehydrate the query client state
  const dehydratedState = dehydrate(queryClient);

  return (
    <>
      {/* Meta Pixel Code */}
      {/* <Script id="meta-pixel" strategy="afterInteractive"> */}
      <Script id="meta-pixel" strategy="lazyOnload">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '348446167114642');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src="https://www.facebook.com/tr?id=348446167114642&ev=PageView&noscript=1"
          alt=""
        />
      </noscript>
      {/* End Meta Pixel Code */}
      <MainLayout dehydratedState={dehydratedState}>{children}</MainLayout>
    </>
  );
}
