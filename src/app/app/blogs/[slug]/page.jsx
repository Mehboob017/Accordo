import AppDeepLinkRedirect from '@/components/deeplink/AppDeepLinkRedirect';
import { getAppSchemeUrl } from '@/lib/app-deeplink';

export const metadata = {
  title: 'Open in SDL India',
  robots: { index: false, follow: false },
};

export default async function BlogAppDeepLinkPage({ params }) {
  const { slug } = await params;
  const appUrl = getAppSchemeUrl(`blogs/${encodeURIComponent(slug)}`);

  return <AppDeepLinkRedirect appUrl={appUrl} label="SDL India blog" />;
}
