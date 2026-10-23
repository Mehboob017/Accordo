'use client';

import { useFaqs } from '@/utils/hooks/useFaqs';
import FaqSection from '@/components/faq/FaqSection';
import FaqPageSkeleton from '@/components/faq/FaqPageSkeleton';

/**
 * FAQ section for product details page - shows all FAQs without category tabs.
 */
const ProductFaqSection = () => {
  const { data: response, isLoading } = useFaqs(null);

  const faqGroups = response?.data?.faq || [];
  const faqs = faqGroups.flatMap((group) => group.faqs || []);

  if (isLoading) return <FaqPageSkeleton />;
  if (!faqs?.length) return null;

  return (
    <FaqSection
      faqs={faqs}
      title="Frequently Asked Questions"
      description="Find answers to common questions about our products, delivery, and services."
    />
  );
};

export default ProductFaqSection;
