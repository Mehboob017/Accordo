import SDLPublicationsClient from '@/components/pages/SDLPublicationsClient';
import { generateStaticSeoMetadata, getStaticSeo } from '@/utils/seo';
import SeoJsonLd from '@/components/seo/SeoJsonLd';

export async function generateMetadata() {
  return generateStaticSeoMetadata('sdl-publication');
}

export default async function Page() {
  const { schemas } = await getStaticSeo('sdl-publication');

  return (
    <>
      <SeoJsonLd schemas={schemas} />
      <SDLPublicationsClient />
    </>
  );
}
