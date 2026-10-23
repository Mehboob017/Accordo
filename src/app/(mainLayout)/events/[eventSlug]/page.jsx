import EventDetailPage from '@/components/events/EventDetailPage';
import { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/utils/getQueryClient';
import { fetchEventDetail } from '@/api/events.api';
import Loader from '@/layout/loader';
import {
  generateDynamicSeoMetadata,
  getDynamicSeo,
  SEO_TYPES,
} from '@/utils/seo';
import SeoJsonLd from '@/components/seo/SeoJsonLd';

async function getEventFallbackMetadata(eventSlug) {
  try {
    const response = await fetchEventDetail({ eventSlug });
    const event = response?.data?.event;

    if (!event) {
      return null;
    }

    const title = event.title || event.name || 'Event Details';
    const description =
      event.description?.replace(/<[^>]*>/g, '').slice(0, 160) ||
      `Join ${title} by SDL India.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        siteName: 'SDL India',
        images: event.coverImage ? [event.coverImage] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: event.coverImage ? [event.coverImage] : [],
      },
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { eventSlug } = await params;
  const path = `/events/${eventSlug}`;
  const fallbackMetadata = await getEventFallbackMetadata(eventSlug);

  return generateDynamicSeoMetadata(eventSlug, SEO_TYPES.EVENT, {
    path,
    fallbackMetadata,
  });
}

export default async function Page({ params }) {
  const { eventSlug } = await params;
  const path = `/events/${eventSlug}`;
  const { schemas } = await getDynamicSeo(eventSlug, SEO_TYPES.EVENT, path);
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['event-detail', { eventSlug }],
    queryFn: () => fetchEventDetail({ eventSlug }),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <SeoJsonLd schemas={schemas} />
      <Suspense fallback={<Loader />}>
        <EventDetailPage />
      </Suspense>
    </HydrationBoundary>
  );
}
