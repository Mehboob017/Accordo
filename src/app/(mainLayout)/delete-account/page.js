import DeleteAccountContent from '@/components/deleteAccount';
// import { generateStaticSeoMetadata, getStaticSeo } from '@/utils/seo';
// import SeoJsonLd from '@/components/seo/SeoJsonLd';

// export async function generateMetadata() {
//   return generateStaticSeoMetadata('contact-us');
// }

export const metadata = {
  title: 'Delete Account',
  description: 'Permanently delete your account and associated data from the Shree Dhootapapeshwar Limited website. Read important information before proceeding.',
  alternates: {
    canonical: 'https://www.sdlindia.com/delete-account',
  },
};

const DeleteAccount = async () => {
  // const { schemas } = await getStaticSeo('contact-us');

  return (
    <>
      {/* <SeoJsonLd schemas={schemas} /> */}
      <DeleteAccountContent />
    </>
  );
};

export default DeleteAccount;
