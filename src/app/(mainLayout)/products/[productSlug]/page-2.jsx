import ProductsDetailContent from '@/components/productsDetails';

// Force dynamic rendering - internal API routes don't work during static build
// export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { productSlug } = await params;
  // fetch data
  const productData = await fetch(
    `${process.env.API_PROD_URL}product/${productSlug}`,
    { cache: 'no-store' }
  )
    .then((res) => res.json())
    .catch((err) => console.log('err', err));
  return {
    openGraph: {
      title: productData?.meta_title,
      description: productData?.meta_description,
      images: [productData?.product_meta_image?.original_url, []],
    },
  };
}

const ProductDetails = async ({ params }) => {
  const { productSlug } = await params;
  return <ProductsDetailContent params={productSlug} />;
};

export default ProductDetails;
