import AboutDirectors from '@/components/aboutUs/AboutDirectors';
import { generateStaticSeoMetadata, getStaticSeo } from '@/utils/seo';
import SeoJsonLd from '@/components/seo/SeoJsonLd';

export async function generateMetadata() {
  return generateStaticSeoMetadata('leadership', { path: '/about-us/leadership' });
}

const Leadership = async () => {
  const { schemas } = await getStaticSeo('leadership', { path: '/about-us/leadership' });
  return (
    <>
      <SeoJsonLd schemas={schemas} />
      <AboutDirectors />
    </>
  );
};

export default Leadership;
