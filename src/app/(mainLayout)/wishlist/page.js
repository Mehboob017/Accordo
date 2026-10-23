import WishlistContent from '@/components/wishlist';

import { generateStaticSeoMetadata, getStaticSeo } from '@/utils/seo';
import SeoJsonLd from '@/components/seo/SeoJsonLd';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/utils/getQueryClient';

export async function generateMetadata() {
  return generateStaticSeoMetadata('wishlist');
}

const Wishlist = async () => {
  const { schemas } = await getStaticSeo('wishlist');
  const queryClient = getQueryClient();
  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <h1 className="visually-hidden">
        My Wishlist - Shree Dhootapapeshwar Limited
      </h1>
      <h2 className="sr-only">This is a wishlist page.</h2>
      <SeoJsonLd schemas={schemas} />
      <WishlistContent />
    </HydrationBoundary>
  );
};

export default Wishlist;
