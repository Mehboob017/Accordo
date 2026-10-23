import JournalPublicationsContent from '@/components/pages/JournalPublicationsContent';
import { Suspense } from 'react';
import { QueryClient, dehydrate } from '@tanstack/react-query';
import HydrateProvider from '@/helper/hydrateContext/HydrateProvider';
import { fetchJournalPublications } from '@/api/journal-publication.api';
import JournalPublicationsSkeleton from '@/components/pages/JournalPublicationsSkeleton';
import { generateStaticSeoMetadata, getStaticSeo } from '@/utils/seo';
import SeoJsonLd from '@/components/seo/SeoJsonLd';

export async function generateMetadata() {
  return generateStaticSeoMetadata('journal-publication');
}

export default async function Page() {
  const { schemas } = await getStaticSeo('journal-publication');
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['journal-publication'],
    queryFn: fetchJournalPublications,
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <section className="journal-publications-section section-t-space section-b-space">
      <div>
        <HydrateProvider state={dehydratedState}>
          <SeoJsonLd schemas={schemas} />
          <Suspense
            fallback={
              <JournalPublicationsSkeleton />
            }
          >
            <JournalPublicationsContent />
          </Suspense>
        </HydrateProvider>
      </div>
    </section>
  );
}
