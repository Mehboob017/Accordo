import BrowserFaq from '@/components/faq';
import { Suspense } from 'react';
import FaqPageSkeleton from '@/components/faq/FaqPageSkeleton';
import { generateStaticSeoMetadata, getStaticSeo } from '@/utils/seo';
import SeoJsonLd from '@/components/seo/SeoJsonLd';
import { fetchFaqs } from '@/api/faqs.api';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/utils/getQueryClient';

export const revalidate = 300;

export async function generateMetadata() {
  return generateStaticSeoMetadata('faqs');
}

function createFaqPageSchema(faqData) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sdlindia.com';
  const faqUrl = `${siteUrl}/faqs`;

  const categories = Array.isArray(faqData?.faq) ? faqData.faq : [];
  const questions = [];
  const seenQuestions = new Set();

  for (const category of categories) {
    const faqs = Array.isArray(category?.faqs) ? category.faqs : [];
    for (const item of faqs) {
      if (item?.question && item?.answer) {
        const q = String(item.question).trim();
        const a = String(item.answer)
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/gi, ' ')
          .trim();

        if (q && a && !seenQuestions.has(q.toLowerCase())) {
          seenQuestions.add(q.toLowerCase());
          questions.push({
            '@type': 'Question',
            name: q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: a,
            },
          });
        }
      }
    }
  }

  if (!questions.length) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${faqUrl}#faq`,
    url: faqUrl,
    name: 'FAQs | Shree Dhootapapeshwar Limited | Ayurvedic Help & Support',
    mainEntity: questions,
  };
}

const Faqs = async () => {
  const queryClient = getQueryClient();
  const { schemas } = await getStaticSeo('faqs');

  await queryClient.prefetchQuery({
    queryKey: ['faqs', 'all'],
    queryFn: () => fetchFaqs({ categoryUid: null }),
  });

  const faqData = queryClient.getQueryData(['faqs', 'all']);
  const faqSchema = createFaqPageSchema(faqData?.data);

  const allSchemas = [
    ...schemas,
    ...(faqSchema ? [faqSchema] : []),
  ];

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SeoJsonLd schemas={allSchemas} />
      <Suspense fallback={<FaqPageSkeleton />}>
        <BrowserFaq />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Faqs;
