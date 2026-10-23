import PreclinicalStudiesClient from '@/components/pages/PreclinicalStudiesClient';
import { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/utils/getQueryClient';
import { fetchPreclinicalStudies } from '@/api/preclinical-studies.api';
import PreclinicalStudiesSkeleton from '@/components/pages/PreclinicalStudiesSkeleton';

export async function generateMetadata() {
  try {
    const response = await fetchPreclinicalStudies();
    const categories = response?.data?.resourcecategories || [];
    const studies = response?.data?.peclinicalstudies || [];
    const totalCategories = categories.length || 0;
    const totalStudies = studies.length || 0;

    return {
      title: 'Preclinical Studies',
      description: `Explore ${totalStudies} preclinical research studies across ${totalCategories} categories including pharmacology assessments, toxicology reports, and safety evaluations for registered practitioners.`,
      keywords: [
        'Preclinical Studies',
        'Pharmacology',
        'Toxicology',
        'Safety Assessment',
        'Research Studies',
        'Practitioner Resources',
        'SDL India',
        'In Vitro Studies',
        'In Vivo Studies',
        'Bioavailability',
      ].join(', '),
      openGraph: {
        title: 'Preclinical Studies',
        description: `Access ${totalStudies} comprehensive preclinical research studies and assessments.`,
        type: 'website',
        siteName: 'SDL India',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Preclinical Studies',
        description: `Explore ${totalStudies} preclinical research studies and assessments.`,
      },
    };
  } catch (error) {
    return {
      title: 'Preclinical Studies',
      description:
        'Access comprehensive preclinical research studies, pharmacology assessments, and toxicology reports for registered practitioners.',
      keywords:
        'Preclinical Studies, Pharmacology, Toxicology, Safety Assessment, Research Studies, SDL India',
      openGraph: {
        title: 'Preclinical Studies',
        description:
          'Access comprehensive preclinical research studies and assessments.',
        type: 'website',
        siteName: 'SDL India',
      },
    };
  }
}

export default async function Page() {
  const queryClient = getQueryClient();

  const prefetchResult = await queryClient.prefetchQuery({
    queryKey: ['preclinical-studies'],
    queryFn: fetchPreclinicalStudies,
  });

  // console.log('✅ Preclinical Studies server prefetch completed:', prefetchResult);

  const dehydratedState = dehydrate(queryClient);
  // console.log('📦 Preclinical Studies dehydrated state:', dehydratedState);

  return (
    <HydrationBoundary state={dehydratedState}>
      <Suspense
        fallback={
          <section className="publications-section section-t-space section-b-space">
            <PreclinicalStudiesSkeleton />
          </section>
        }
      >
        <PreclinicalStudiesClient />
      </Suspense>
    </HydrationBoundary>
  );
}
