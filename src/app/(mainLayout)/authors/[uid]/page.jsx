import AppDeepLinkRedirect from '@/components/deeplink/AppDeepLinkRedirect';
import { getAppSchemeUrl } from '@/lib/app-deeplink';

export const metadata = {
  title: 'Open in SDL India',
  robots: { index: false, follow: false },
};

export default async function AuthorDeepLinkPage({ params }) {
  const { uid } = await params;
  const appUrl = getAppSchemeUrl(`authors/${encodeURIComponent(uid)}`);

  return <AppDeepLinkRedirect appUrl={appUrl} label="SDL India author" />;
}
