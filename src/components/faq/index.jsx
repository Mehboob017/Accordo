'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useFaqs } from '@/utils/hooks/useFaqs';
import FaqPageSkeleton from './FaqPageSkeleton';
import FaqSection from './FaqSection';

const BrowserFaq = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const categoryUid = searchParams.get('categoryUid') || null;

  const { data: response, isLoading } = useFaqs(categoryUid);

  const faqCategories = response?.data?.faqCategories || [];
  const faqGroups = response?.data?.faq || [];

  const activeGroup = categoryUid
    ? faqGroups.find((group) => group.uid === categoryUid)
    : null;

  const faqsToRender = activeGroup
    ? activeGroup.faqs || []
    : faqGroups.flatMap((group) => group.faqs || []);

  const handleCategoryChange = (nextCategoryUid) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextCategoryUid) {
      params.set('categoryUid', nextCategoryUid);
    } else {
      params.delete('categoryUid');
    }
    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    router.push(url, { scroll: false });
  };

  if (isLoading) return <FaqPageSkeleton />;

  return (
    <FaqSection
      faqs={faqsToRender}
      title="Frequently Asked Questions"
      titleTag="h1"
      description="Find clear and straightforward answers to the most common questions about our services, process, pricing, and delivery."
      categories={faqCategories}
      activeCategoryUid={categoryUid}
      onChangeCategory={handleCategoryChange}
    />
  );
};

export default BrowserFaq;
export { FaqSection };
