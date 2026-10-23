'use client';
import Breadcrumb from '../common/Breadcrumb';
import WrapperComponent from '../common/WrapperComponent';
import AboutUsImage from './AboutUsImage';
import AboutUsText from './AboutUsText';
import ClientSection from './ClientSection';
import CreativeTeam from './CreativeTeam';
import OurBlog from './OurBlog';
import ReviewSection from './ReviewSection';
import MissionSection from './MissionSection';
import AboutDirectors from './AboutDirectors';
import ManufacturingPlant from './ManufacturingPlant';
import EthosSection from './EthosSection';
import AboutHeroBanner from './AboutHeroBanner';
import AboutSection from './AboutSection';
import CompanyDocuments from '@/app/(mainLayout)/company-documents/CompanyDocuments';


const AboutUsContent = () => {
  return (
    <>
      <AboutHeroBanner />
      <AboutSection />

      {/* <Breadcrumb title={'AboutUs'} subNavigation={[{ name: 'AboutUs' }]} /> */}
      {/* <WrapperComponent
        classes={{
          sectionClass: 'fresh-vegetable-section section-lg-space',
          row: 'gx-xl-5 gy-xl-0 g-3 ratio_148_1',
        }}
        customCol
      >
        <AboutUsImage />
        <AboutUsText />
      </WrapperComponent> */}
      {/* <ClientSection /> */}
      {/* <CreativeTeam /> */}

      <CompanyDocuments />
      {/* <ReviewSection />
      <OurBlog /> */}
    </>
  );
};

export default AboutUsContent;
