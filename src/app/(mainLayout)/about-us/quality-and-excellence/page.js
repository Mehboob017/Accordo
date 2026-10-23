import AboutDirectors from '@/components/aboutUs/AboutDirectors';
import FacilitiesSection from '@/components/aboutUs/FacilitiesSection';
import ManufacturingPlant from '@/components/aboutUs/ManufacturingPlant';
import Gmp from '@/components/aboutUs/Gmp';
import GmpInAyurved from '@/components/aboutUs/GmpInAyurved';
import ManufacturingExcellence from '@/components/aboutUs/ManufacturingExcellence';
import QualityControl from '@/components/aboutUs/QualityControl';
import QualityEvaluation from '@/components/aboutUs/QualityEvaluation';
import Standardisation from '@/components/aboutUs/Standardisation';
import PharmacopoeialStandards from '@/components/aboutUs/PharmacopoeialStandards';
import CertificationsAndAccreditations from '@/components/aboutUs/CertificationsAndAccreditations';
import LabImageSection from '@/components/aboutUs/LabImageSection';
import { generateStaticSeoMetadata, getStaticSeo } from '@/utils/seo';
import SeoJsonLd from '@/components/seo/SeoJsonLd';

export async function generateMetadata() {
  return generateStaticSeoMetadata('quality-and-excellence', { path: '/about-us/quality-and-excellence' });
}

const ManufacturingAndQuality = async () => {
  const { schemas } = await getStaticSeo('quality-and-excellence', { path: '/about-us/quality-and-excellence' });
  return (
    <>
      <SeoJsonLd schemas={schemas} />
      <ManufacturingPlant />
      <LabImageSection />
      <Gmp />
      <GmpInAyurved />
      <ManufacturingExcellence />
      <QualityControl />
      <PharmacopoeialStandards />
      <QualityEvaluation />
      <Standardisation />
      <CertificationsAndAccreditations />
      {/* <FacilitiesSection /> */}
    </>
  );
};

export default ManufacturingAndQuality;
