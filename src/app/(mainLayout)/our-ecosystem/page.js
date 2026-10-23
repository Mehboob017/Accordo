import React from 'react';
import { generateStaticSeoMetadata, getStaticSeo } from '@/utils/seo';
import SeoJsonLd from '@/components/seo/SeoJsonLd';

export async function generateMetadata() {
  return generateStaticSeoMetadata('our-ecosystem');
}

const page = async () => {
  const { schemas } = await getStaticSeo('our-ecosystem');

  return (
    <>
      <SeoJsonLd schemas={schemas} />
      <div>page</div>
    </>
  );
};

export default page;
