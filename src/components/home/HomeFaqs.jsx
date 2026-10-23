'use client';

import React from 'react';
import FaqSection from '../faq/FaqSection';
import SkHomeFaqs from '@/components/common/skeletonLoader/homeSkeleton/SkHomeFaqs';
import { useHomeSectionQuery } from '@/utils/hooks/useHome';

const HomeFaqs = () => {
  const { data, isLoading } = useHomeSectionQuery(3);
  const faqs = data?.data?.faqs || [];

  if (isLoading) {
    return <SkHomeFaqs />;
  }

  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <FaqSection
      title="Frequently Asked Questions"
      description="Find answers to common questions about our products, services, and wellness solutions."
      faqs={faqs}
      className="section-t-space"
    />
  );
};

export default HomeFaqs;
