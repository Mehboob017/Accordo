import { CareerHero } from '@/components/career/Careerhero';
import CareerOpportunities from '@/components/career/CareerOpportunities';
import CareerBenefits from '@/components/career/CareerBenefits';
import CareerStats from '@/components/career/CareerStats';
import CareerImageSection from '@/components/career/CareerImageSection';
import CareerDisclaimer from '@/components/career/CareerDisclaimer';
import { generateStaticSeoMetadata, getStaticSeo } from '@/utils/seo';
import SeoJsonLd from '@/components/seo/SeoJsonLd';
import CareerHeroBanner from '@/components/career/CareerHeroBanner';
import CareerPosition from '@/components/career/CareerPosition';
import CareerLookFor from '@/components/career/CareerLookFor';

export async function generateMetadata() {
  return generateStaticSeoMetadata('career');
}

const page = async () => {
  const { schemas } = await getStaticSeo('career');

  return (
    <>
      <h1
        className="visually-hidden"
      >
        Careers at Shree Dhootapapeshwar Limited - Join Team SDL
      </h1>
      <SeoJsonLd schemas={schemas} />
      {/* <CareerHero /> */}
      <CareerHeroBanner />
      <CareerStats />
      <CareerOpportunities />
      {/* <CareerPosition /> */}
      <CareerBenefits />
      <CareerLookFor />
      <CareerImageSection />
      <CareerDisclaimer />
    </>
  );
};

export default page;
