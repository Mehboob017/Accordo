import CultivatorRegistrationForm from '@/features/cultivator-form';

export const metadata = {
  title: ' SDL India - Add Cultivator',
  description: 'Register as a cultivator with SDL India and contribute to the supply chain of Ayurvedic raw materials.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sdlindia.com'}/cultivators/add`,
  },
};

export default async function Page() {
  return <CultivatorRegistrationForm />;
}
