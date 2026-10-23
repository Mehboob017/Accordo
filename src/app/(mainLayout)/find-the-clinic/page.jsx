import ClinicFinderPage from '@/components/clinic/ClinicFinderPage';
import { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/utils/getQueryClient';
import { fetchClinics } from '@/api/clinics.api';
import Loader from '@/layout/loader';
import { generateStaticSeoMetadata, getStaticSeo } from '@/utils/seo';
import SeoJsonLd from '@/components/seo/SeoJsonLd';

export async function generateMetadata() {
  return generateStaticSeoMetadata('clinics');
}

export default async function ClinicFinder() {
  const { schemas } = await getStaticSeo('clinics');
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['clinics', { limit: 12, page: 1, search: '', specialization: '' }],
    queryFn: () => fetchClinics({ limit: 12, page: 1 }),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <SeoJsonLd schemas={schemas} />
      <Suspense fallback={<Loader />}>
        <ClinicFinderPage />
      </Suspense>
    </HydrationBoundary>
  );
}
