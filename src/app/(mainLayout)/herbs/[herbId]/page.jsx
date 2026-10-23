import HerbDetailContent from './HerbDetailContent';
import { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/utils/getQueryClient';
import { fetchHerbDetail } from '@/api/herbs.api';
import Loader from '@/layout/loader';
import {
  generateDynamicSeoMetadata,
  getDynamicSeo,
  SEO_TYPES,
} from '@/utils/seo';
import SeoJsonLd from '@/components/seo/SeoJsonLd';

async function getHerbFallbackMetadata(herbSlug) {
  try {
    const response = await fetchHerbDetail({ herbSlug });

    if (!response.success || !response.data?.herb) {
      return null;
    }

    const herb = response.data.herb;
    const firstInfo = herb.herbInfos?.[0];
    const description =
      herb.subtitle ||
      firstInfo?.description?.substring(0, 160) ||
      `Learn about ${herb.name} and its benefits.`;

    return {
      title: `${herb.name} - Premium Herbs`,
      description,
      keywords: [
        herb.name,
        herb.subtitle,
        'herbs',
        'natural medicine',
        'ayurvedic herbs',
        'SDL India',
        'herbal products',
      ]
        .filter(Boolean)
        .join(', '),
      openGraph: {
        title: `${herb.name} - Premium Herbs`,
        description,
        type: 'website',
        siteName: 'SDL India',
        images: herb.coverImage
          ? [
              {
                url: herb.coverImage,
                alt: herb.coverImageAlt || herb.name,
              },
            ]
          : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${herb.name} - Premium Herbs`,
        description,
        images: herb.coverImage ? [herb.coverImage] : [],
      },
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { herbId: herbSlug } = await params;
  const path = `/herbs/${herbSlug}`;
  const fallbackMetadata = await getHerbFallbackMetadata(herbSlug);

  return generateDynamicSeoMetadata(herbSlug, SEO_TYPES.HERB, {
    path,
    fallbackMetadata,
  });
}

export default async function page({ params }) {
  const { herbId: herbSlug } = await params;
  const path = `/herbs/${herbSlug}`;
  const { schemas } = await getDynamicSeo(herbSlug, SEO_TYPES.HERB, path);
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['herb-detail', { herbSlug }],
    queryFn: () => fetchHerbDetail({ herbSlug }),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <SeoJsonLd schemas={schemas} />
      <Suspense fallback={<Loader />}>
        <HerbDetailContent herbSlug={herbSlug} />
      </Suspense>
    </HydrationBoundary>
  );
}
