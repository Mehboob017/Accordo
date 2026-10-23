import AboutUsContent from '@/components/aboutUs';
import EthosSection from '@/components/aboutUs/EthosSection';
import Expansion from '@/components/aboutUs/Expansion';
import HistoryTimeline from '@/components/aboutUs/HistoryTimeline';
import MilestonesSection from '@/components/aboutUs/MilestonesSection';
import MissionSection from '@/components/aboutUs/MissionSection';
import ProfileSection from '@/components/aboutUs/ProfileSection';
import VideoSection from '@/components/aboutUs/VideoSection';
import { milestones } from '@/components/aboutUs/milestonesdata';
import PageBanner from '@/components/common/PageBanner';
import { generateStaticSeoMetadata, getStaticSeo } from '@/utils/seo';
import SeoJsonLd from '@/components/seo/SeoJsonLd';

export async function generateMetadata() {
  return generateStaticSeoMetadata('sdl-legacy', { path: '/about-us/sdl-legacy' });
}

const OurLegacy = async () => {
  const { schemas } = await getStaticSeo('sdl-legacy', { path: '/about-us/sdl-legacy' });
  return (
    <>
      <SeoJsonLd schemas={schemas} />
      <PageBanner
        title="SDL Legacy"
        subtitle="Discover the story of SDL India, a leading Ayurvedic company in India."
      />
      {/* <ProfileSection /> */}
      {/* history page start */}
      <HistoryTimeline />
      {/* <Expansion /> */}
      {/* history page end */}
      <MilestonesSection milestones={milestones} />
      {/* <MissionSection />
      <EthosSection /> */}
      <VideoSection />
    </>
  );
};

export default OurLegacy;
