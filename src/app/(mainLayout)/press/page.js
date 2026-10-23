import PressPage from '@/components/press/PressPage';
import { Suspense } from 'react';
import PressPageSkeleton from '@/components/press/PressPageSkeleton';
import { generateStaticSeoMetadata, getStaticSeo } from '@/utils/seo';
import SeoJsonLd from '@/components/seo/SeoJsonLd';

export async function generateMetadata() {
  return generateStaticSeoMetadata('press');
}

const Press = async () => {
  const { schemas } = await getStaticSeo('press');

  return (
    <>
      <SeoJsonLd schemas={schemas} />
      <section className="section-t-space press-main-section">
        <div className="container-fluid-lg">
          <div className="events-header text-center">
            <h1 className="events-title">Press & Media</h1>
            <h2 className="sr-only">This is a press & media page.</h2>
            <p className="events-subtitle">
              Latest news coverage, media features, and press releases about
              Shree Dhootapapeshwar Limited and its Ayurvedic products.
            </p>
          </div>
        </div>
      </section>
      <Suspense fallback={<PressPageSkeleton />}>
        <PressPage />
      </Suspense>
    </>
  );
};

export default Press;
