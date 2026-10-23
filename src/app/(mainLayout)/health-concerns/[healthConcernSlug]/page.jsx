import { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/utils/getQueryClient';
import Loader from '@/layout/loader';
import HealthConcernDetailContent from './HealthConcernDetailContent';
import { fetchHealthConcernDetail } from '@/api/health-concern.api';
import {
  generateDynamicSeoMetadata,
  getDynamicSeo,
  SEO_TYPES,
} from '@/utils/seo';
import SeoJsonLd from '@/components/seo/SeoJsonLd';

async function getHealthConcernFallbackMetadata(healthConcernSlug) {
  try {
    const data = await fetchHealthConcernDetail({ healthConcernSlug });
    const healthConcern = data?.data?.['Health Concerns'];

    if (!healthConcern) {
      return null;
    }

    const { name, description, metaTitle, metaDescription } = healthConcern;

    return {
      title: metaTitle || `${name} | Ayurvedic Care & Natural Wellness`,
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sdlindia.com'}/health-concerns/${healthConcernSlug}`,
      },
      description:
        metaDescription ||
        description?.replace(/<[^>]*>/g, '').slice(0, 160) ||
        `Discover Ayurvedic solutions, lifestyle guidance, and herbal formulations for ${name}.`,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { healthConcernSlug } = await params;
  const path = `/health-concerns/${healthConcernSlug}`;

  const fallbackMetadata =
    await getHealthConcernFallbackMetadata(healthConcernSlug);

  return generateDynamicSeoMetadata(
    healthConcernSlug,
    SEO_TYPES.HEALTH_CONCERN,
    {
      path,
      fallbackMetadata,
    }
  );
}

export default async function page({ params }) {
  const { healthConcernSlug } = await params;
  const path = `/health-concerns/${healthConcernSlug}`;
  const { schemas } = await getDynamicSeo(
    healthConcernSlug,
    SEO_TYPES.HEALTH_CONCERN,
    path
  );
  const queryClient = getQueryClient();

  // old code 

  // await queryClient.prefetchQuery({
  //   queryKey: ['health-concern-detail', { healthConcernSlug }],
  //   queryFn: () => fetchHealthConcernDetail({ healthConcernSlug }),
  // });

  // new code 
  const limit = 8;

  await queryClient.prefetchInfiniteQuery({
    queryKey: [
      'health-concern-detail',
      { healthConcernSlug, limit },
    ],
    queryFn: ({ pageParam = 1 }) =>
      fetchHealthConcernDetail({
        healthConcernSlug,
        page: pageParam,
        limit,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination =
        lastPage?.data?.['Related Products']?.pagination ||
        lastPage?.pagination;

      if (!pagination?.hasNextPage) {
        return undefined;
      }

      return pagination.currentPage + 1;
    },
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <SeoJsonLd schemas={schemas} />
      <Suspense fallback={<Loader />}>
        <HealthConcernDetailContent healthConcernSlug={healthConcernSlug} />
      </Suspense>
    </HydrationBoundary>
  );
}
