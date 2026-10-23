import React from 'react';
import { generateStaticSeoMetadata, getStaticSeo } from '@/utils/seo';
import SeoJsonLd from '@/components/seo/SeoJsonLd';

export async function generateMetadata() {
  return generateStaticSeoMetadata('our-story');
}

const OurStory = async () => {
  const { schemas } = await getStaticSeo('our-story');

  return (
    <>
      <SeoJsonLd schemas={schemas} />
      <div>OurStory</div>
    </>
  );
};

export default OurStory;
