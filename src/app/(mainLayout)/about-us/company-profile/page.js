import AboutUsContent from '@/components/aboutUs';
import AwardsRecognition from '@/components/aboutUs/AwardsRecognition';
import CsrActivities from '@/components/aboutUs/CsrActivities';
import EthosSection from '@/components/aboutUs/EthosSection';
import Expansion from '@/components/aboutUs/Expansion';
import HistorySection from '@/components/aboutUs/HistorySection';
import Inception from '@/components/aboutUs/Inception';
import MilestonesSection from '@/components/aboutUs/MilestonesSection';
import MissionSection from '@/components/aboutUs/MissionSection';
import ProfileSection from '@/components/aboutUs/ProfileSection';
import ProfileVideoSection from '@/components/aboutUs/ProfileVideoSection';
import CompanyDocuments from '../../company-documents/CompanyDocuments';
import PageBanner from '@/components/common/PageBanner';
import { generateStaticSeoMetadata, getStaticSeo } from '@/utils/seo';
import SeoJsonLd from '@/components/seo/SeoJsonLd';

export async function generateMetadata() {
  return generateStaticSeoMetadata('company-profile', { path: '/about-us/company-profile' });
}

const OurLegacy = async () => {
  const { schemas } = await getStaticSeo('company-profile', { path: '/about-us/company-profile' });
  return (
    <>
      <SeoJsonLd schemas={schemas} />
      <PageBanner
        title="Company Profile"
        subtitle="Discover our legacy, values, and commitment to authentic Ayurvedic healthcare."
      />
      <ProfileSection />
      {/* <ProfileVideoSection /> */}
      <MissionSection />
      <EthosSection />
      <AwardsRecognition />
      <CsrActivities />
      <CompanyDocuments />
    </>
  );
};

export default OurLegacy;
