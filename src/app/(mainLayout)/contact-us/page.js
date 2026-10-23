import ContactUsContent from '@/components/contactUs';
import { generateStaticSeoMetadata, getStaticSeo } from '@/utils/seo';
import SeoJsonLd from '@/components/seo/SeoJsonLd';
import { PUBLIC_SITE_URL } from '@/utils/constants';

export const revalidate = 3600;

export async function generateMetadata() {
  return generateStaticSeoMetadata('contact-us');
}

const ContactUs = async () => {
  const { schemas: apiSchemas, raw: seoData } = await getStaticSeo('contact-us');

  const pageUrl = `${PUBLIC_SITE_URL}/contact-us`;
  const logoUrl =
    seoData?.ogImage ||
    'https://assets.sdlindia.com/seo/1784887723559-sdl_icon_whitebg_1024.png';

  const contactPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: seoData?.title || 'Contact Shree Dhootapapeshwar Limited',
    url: pageUrl,
    description:
      seoData?.metaDescription ||
      'Get in touch with Shree Dhootapapeshwar Limited for product enquiries, customer support, and office locations.',
    mainEntity: {
      '@type': 'Organization',
      name: 'Shree Dhootapapeshwar Limited',
      url: PUBLIC_SITE_URL,
      logo: logoUrl,
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Shree Dhootapapeshwar Limited',
    url: PUBLIC_SITE_URL,
    logo: logoUrl,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+91-22-23829874',
        contactType: 'customer support',
        email: 'healthcare@sdlindia.com',
        areaServed: 'IN',
        availableLanguage: ['en', 'hi', 'mr'],
      },
      {
        '@type': 'ContactPoint',
        telephone: '+91-22-69715000',
        contactType: 'administrative office',
        email: 'healthcare@sdlindia.com',
        areaServed: 'IN',
        availableLanguage: ['en', 'hi', 'mr'],
      },
    ],
    address: [
      {
        '@type': 'PostalAddress',
        streetAddress: '135, Nanubhai Desai Road, Khetwadi, Girgaon',
        addressLocality: 'Mumbai',
        postalCode: '400004',
        addressCountry: 'IN',
      },
      {
        '@type': 'PostalAddress',
        streetAddress:
          '5th floor, Vastu Central, J. K. Sawant Marg, Dadar (West)',
        addressLocality: 'Mumbai',
        postalCode: '400028',
        addressCountry: 'IN',
      },
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: PUBLIC_SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Contact Us',
        item: pageUrl,
      },
    ],
  };

  const schemas = [
    contactPageSchema,
    organizationSchema,
    breadcrumbSchema,
    ...(apiSchemas || []),
  ];

  return (
    <>
      <SeoJsonLd schemas={schemas} />
      <ContactUsContent />
    </>
  );
};

export default ContactUs;
