import { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/utils/getQueryClient';
import { fetchAnnualHerbRequirements } from '@/api/herbs.api';
import AnnualHerbRequirementsContent from './AnnualHerbRequirementsContent';
// import Breadcrumb from '@/components/common/Breadcrumb';
import WrapperComponent from '@/components/common/WrapperComponent';
import styles from './page.module.scss';

// Generate metadata from API
// export async function generateMetadata() {
//   try {
//     const response = await fetchAnnualHerbRequirements({ page: 1, limit: 10 });
//     const totalItems = response?.data?.pagination?.total || 0;
//     const requirements = response?.data?.cultivators || [];

//     // Get unique herb count
//     const herbCount = requirements.length || 0;

//     return {
//       title: 'Annual Requirement of Herbs - SDL India',
//       description: `Explore the annual requirement of ${totalItems}+ medicinal herbs by SDL India. Comprehensive list including procurement status, stock availability, and demand insights for herb suppliers and cultivators across India.`,
//       keywords: [
//         'annual herb requirement',
//         'medicinal herbs demand',
//         'herb cultivation trends',
//         'herb market opportunities',
//         'herb suppliers India',
//         'herb procurement status',
//         'medicinal plant demand',
//         'herb farming trends',
//         'herb market analysis',
//         'herb cultivation opportunities',
//         'ayurvedic herbs requirement',
//         'herbal raw material demand',
//         'SDL India herbs',
//         'herb stock availability',
//       ].join(', '),
//       openGraph: {
//         title: 'Annual Requirement of Herbs - SDL India',
//         description: `View annual requirements for ${totalItems}+ medicinal herbs. Real-time procurement status and stock availability information for cultivators and suppliers.`,
//         type: 'website',
//         siteName: 'SDL India',
//       },
//       twitter: {
//         card: 'summary_large_image',
//         title: 'Annual Requirement of Herbs - SDL India',
//         description: `Comprehensive annual herb requirements list covering ${totalItems}+ medicinal herbs with procurement status and availability.`,
//       },
//       alternates: {
//         canonical: '/annual-requirement-of-herbs',
//       },
//     };
//   } catch (error) {
//     // Fallback metadata if API fails
//     return {
//       title: 'Annual Requirement of Herbs - SDL India',
//       description:
//         'Discover the annual requirement of medicinal herbs in India. SDL India provides insights into demand, cultivation trends, and market opportunities for herb suppliers and cultivators.',
//       keywords: [
//         'annual herb requirement',
//         'medicinal herbs demand',
//         'herb cultivation trends',
//         'herb market opportunities',
//         'herb suppliers India',
//         'herb cultivation insights',
//         'medicinal plant demand',
//         'herb farming trends',
//         'herb market analysis',
//         'herb cultivation opportunities',
//       ].join(', '),
//       openGraph: {
//         title: 'Annual Requirement of Herbs - SDL India',
//         description:
//           'Discover the annual requirement of medicinal herbs in India. SDL India provides insights into demand, cultivation trends, and market opportunities for herb suppliers and cultivators.',
//         type: 'website',
//         siteName: 'SDL India',
//       },
//       twitter: {
//         card: 'summary_large_image',
//         title: 'Annual Requirement of Herbs - SDL India',
//         description:
//           'Discover the annual requirement of medicinal herbs in India. SDL India provides insights into demand, cultivation trends, and market opportunities for herb suppliers and cultivators.',
//       },
//       alternates: {
//         canonical: '/annual-requirement-of-herbs',
//       },
//     };
//   }
// }

export const metadata = {
  title: 'Annual Requirement of Medicinal Herbs',
  description: 'Discover the annual requirement of medicinal herbs in India. SDL India provides insights into demand, cultivation trends, and market opportunities for herb suppliers and cultivators.',
  alternates: {
    canonical: 'https://www.sdlindia.com/annual-requirement-of-herbs',
  },
};

// Server Component - Main Page
export default async function AnnualRequirementOfHerbsPage() {
  const queryClient = getQueryClient();

  // Prefetch data for initial page
  await queryClient.prefetchQuery({
    queryKey: ['annual-herb-requirements', 1, 10],
    queryFn: () => fetchAnnualHerbRequirements({ page: 1, limit: 10 }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* Breadcrumb */}
      {/* <Breadcrumb
        title="Annual Requirement of Herbs"
        subNavigation={[{ name: 'Annual Herb Requirements' }]}
      /> */}

      {/* Main Content */}
      <WrapperComponent
        classes={{
          sectionClass: styles['annual-herbs-section'],
          fluidClass: 'container-fluid-lg',
        }}
        noRowCol
      >
        {/* Page Header */}
        <div className={styles['annual-herbs-header']}>
          <h1>Annual Requirement of Medicinal Herbs</h1>
          <h2 className="sr-only">This is an annual requirement of herbs page.</h2>
          <p>
            Comprehensive list of medicinal herbs required annually by SDL India,
            including procurement status, stock availability, and last updated
            information. This data helps cultivators and suppliers understand
            market demands and opportunities.
          </p>
        </div>

        {/* Table with Pagination */}
        <Suspense
          fallback={
            <div className={styles['herbs-loading']}>
              <div className={styles['loading-spinner']}></div>
              <p>Loading annual herb requirements...</p>
            </div>
          }
        >
          <AnnualHerbRequirementsContent />
        </Suspense>
      </WrapperComponent>
    </HydrationBoundary>
  );
}