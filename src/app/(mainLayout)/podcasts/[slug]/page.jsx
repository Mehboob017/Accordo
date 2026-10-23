import AppDeepLinkRedirect from '@/components/deeplink/AppDeepLinkRedirect';
import { getAppSchemeUrl } from '@/lib/app-deeplink';

export const metadata = {
  title: 'Open in SDL India',
  robots: { index: false, follow: false },
};

export default async function PodcastDeepLinkPage({ params }) {
  const { slug } = await params;
  const appUrl = getAppSchemeUrl(`podcasts/${encodeURIComponent(slug)}`);

  return <AppDeepLinkRedirect appUrl={appUrl} label="SDL India podcast" />;
}
