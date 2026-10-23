import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import Loader from '@/layout/loader';
import { getQueryClient } from '@/utils/getQueryClient';
import { fetchDepartments } from '@/api/departments.api';
import { fetchProducts } from '@/api/product.api';
import CollectionContain from '@/components/collection';
import { generateStaticSeoMetadata } from '@/utils/seo';
import SeoJsonLd from '@/components/seo/SeoJsonLd';

export const revalidate = 300;

export async function generateMetadata() {
  return generateStaticSeoMetadata('collections');
}

function createCollectionPageSchema(products = []) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sdlindia.com';
  const collectionsUrl = `${siteUrl}/collections`;

  const collectionsId = collectionsUrl;
  const itemListId = `${collectionsUrl}#itemlist`;
  const breadcrumbId = `${collectionsUrl}#breadcrumb`;
  const organizationId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;

  // Build ListItems dynamically from products
  const listItems = products
    .filter((product) => product?.slug && product?.name)
    .map((product, index) => {
      const firstVariant = Array.isArray(product.productVariants) && product.productVariants.length > 0
        ? product.productVariants[0]
        : null;
      const variantParam = firstVariant?.slug ? `?productVariant=${firstVariant.slug}` : '';
      const productUrl = `${siteUrl}/products/${product.slug}${variantParam}`;

      return {
        '@type': 'ListItem',
        position: index + 1,
        url: productUrl,
        name: product.name,
      };
    });

  // Collections node
  const collectionsNode = {
    '@type': 'Collections',
    '@id': collectionsId,
    url: collectionsUrl,
    name: 'Wide Product Range | Shree Dhootapapeshwar Limited',
    description: 'Explore Ayurvedic products from Shree Dhootapapeshwar Limited.',
    isPartOf: {
      '@id': websiteId,
    },
    breadcrumb: {
      '@id': breadcrumbId,
    },
    publisher: {
      '@id': organizationId,
    },
    inLanguage: 'en-IN',
  };

  // ItemList node
  const itemListNode = {
    '@type': 'ItemList',
    '@id': itemListId,
    name: 'Wide Product Range',
    itemListElement: listItems,
  };

  // BreadcrumbList node
  const breadcrumbNode = {
    '@type': 'BreadcrumbList',
    '@id': breadcrumbId,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${siteUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Collections',
        item: `${siteUrl}/collections/`,
      },
    ],
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      collectionsNode,
      itemListNode,
      breadcrumbNode,
    ],
  };
}

const Collection = async () => {
  const queryClient = getQueryClient();

  // Fetch products for the ItemList schema (page 1, limit 50)
  const productsResponse = await fetchProducts({ page: 1, limit: 50 }).catch(() => null);
  const products = productsResponse?.data?.product || [];

  await queryClient.prefetchQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
  });

  const collectionSchema = createCollectionPageSchema(products);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <h1
        className="visually-hidden"
      >
        Ayurvedic Products Collection - Shree Dhootapapeshwar Limited
      </h1>
      <h2 className="sr-only">This is a collections page.</h2>
      <SeoJsonLd schemas={[collectionSchema]} />
      <Suspense fallback={<Loader />}>
        <CollectionContain />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Collection;

