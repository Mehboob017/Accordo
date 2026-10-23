import CultivatorsPageContent from '@/components/pages/CultivatorsPageContent';
import { generateStaticSeoMetadata, getStaticSeo } from '@/utils/seo';
import SeoJsonLd from '@/components/seo/SeoJsonLd';

// export async function generateMetadata() {
//   return generateStaticSeoMetadata('cultivators');
// }

export const dynamic = 'force-static';

export const metadata = {
  title: 'Cultivators',
  description: 'Explore opportunities for cultivating medicinal herbs with Shree Dhootapapeshwar Limited. Discover cultivation guides, best practices, and partnership programs for herb farmers and growers.',
  alternates: {
    canonical: 'https://www.sdlindia.com/cultivators',
  },
};

export default async function CultivatorsPage() {
  const { schemas } = await getStaticSeo('cultivators');

  return (
    <>
      <SeoJsonLd schemas={schemas} />
      <CultivatorsPageContent />
    </>
  );
}
