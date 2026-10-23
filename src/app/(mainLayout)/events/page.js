import EventsPage from '@/components/events/EventsPage';
import { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/utils/getQueryClient';
import { fetchEvents } from '@/api/events.api';
import Loader from '@/layout/loader';
import { generateStaticSeoMetadata, getStaticSeo } from '@/utils/seo';
import SeoJsonLd from '@/components/seo/SeoJsonLd';

export async function generateMetadata() {
  return generateStaticSeoMetadata('events');
}

export default async function Page() {
  const { schemas } = await getStaticSeo('events');
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['events', {}],
    queryFn: () => fetchEvents(),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <SeoJsonLd schemas={schemas} />
      <Suspense fallback={<Loader />}>
        <EventsPage />
      </Suspense>
    </HydrationBoundary>
  );
}
