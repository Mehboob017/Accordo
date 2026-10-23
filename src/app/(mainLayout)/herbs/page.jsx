import HerbsPageContent from './HerbsPageContent';
import { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/utils/getQueryClient';
import { fetchHerbs } from '@/api/herbs.api';
import Loader from '@/layout/loader';
import { generateStaticSeoMetadata, getStaticSeo } from '@/utils/seo';
import SeoJsonLd from '@/components/seo/SeoJsonLd';

export async function generateMetadata() {
  return generateStaticSeoMetadata('herbs');
}

export default async function HerbsPage() {
  const { schemas } = await getStaticSeo('herbs');
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['herbs', {}],
    queryFn: () => fetchHerbs(),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <SeoJsonLd schemas={schemas} />
      <section className="section-t-space shop-section">
        <div className="container-fluid-lg">
          <div className="events-header text-center">
            <h1 className="events-title">Explore Our Herbal Collection</h1>
            <h2 className="sr-only">This is a herbs page.</h2>
            <p className="events-subtitle">
              Discover the healing power of nature with our curated selection of
              herbs, each with unique benefits and uses.
            </p>
          </div>
        </div>
      </section>
      <Suspense fallback={<Loader />}>
        <HerbsPageContent />
      </Suspense>
    </HydrationBoundary>
  );
}
