import React from 'react';
import { generateStaticSeoMetadata, getStaticSeo } from '@/utils/seo';
import SeoJsonLd from '@/components/seo/SeoJsonLd';

export async function generateMetadata() {
  return generateStaticSeoMetadata('quality-and-research');
}

const page = async () => {
  const { schemas } = await getStaticSeo('quality-and-research');

  return (
    <>
      <SeoJsonLd schemas={schemas} />
      <div>page</div>
    </>
  );
};

export default page;
