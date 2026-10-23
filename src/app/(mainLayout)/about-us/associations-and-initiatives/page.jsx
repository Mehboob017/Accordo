import React from 'react';
import AssociationsAndInitiativesPageContent from './components/AssociationsAndInitiativesPageContent';
import { generateStaticSeoMetadata, getStaticSeo } from '@/utils/seo';
import SeoJsonLd from '@/components/seo/SeoJsonLd';

export async function generateMetadata() {
  return generateStaticSeoMetadata('associations-and-initiatives', { path: '/about-us/associations-and-initiatives' });
}

const AssociationsAndInitiativesPage = async () => {
  const { schemas } = await getStaticSeo('associations-and-initiatives', { path: '/about-us/associations-and-initiatives' });
  return (
    <>
      <SeoJsonLd schemas={schemas} />
      <AssociationsAndInitiativesPageContent />
    </>
  );
};

export default AssociationsAndInitiativesPage;
