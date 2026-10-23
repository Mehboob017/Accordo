import StoreFinderPage from '@/components/stores/StoreFinderPage';
import { Suspense } from 'react';
import {
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import HydrateProvider from '@/helper/hydrateContext/HydrateProvider';
import { fetchStores } from '@/api/stores.api';
import Loader from '@/layout/loader';
import {
  generateStaticSeoMetadata,
  getStaticSeo,
} from '@/utils/seo';
import SeoJsonLd from '@/components/seo/SeoJsonLd';

export async function generateMetadata() {
  return generateStaticSeoMetadata('stores');
}

const StoreFinder = async ({ searchParams }) => {
  const { schemas } = await getStaticSeo('stores');

  const queryClient = new QueryClient();

  const sp = await searchParams;

  const search = sp?.search || '';
  const limit = 15;
  const sortBy = 'asc';
  const field = 'created_at';

  await queryClient.prefetchInfiniteQuery({
    queryKey: [
      'stores-infinite',
      {
        search,
        limit,
        sortBy,
        field,
      },
    ],
    queryFn: ({ pageParam = 1 }) =>
      fetchStores({
        page: pageParam,
        search,
        limit,
        sortBy,
        field,
      }),
    initialPageParam: 1,
  });

  return (
    <HydrateProvider state={dehydrate(queryClient)}>
      <SeoJsonLd schemas={schemas} />

      <Suspense fallback={<Loader />}>
        <StoreFinderPage />
      </Suspense>
    </HydrateProvider>
  );
};

export default StoreFinder;
