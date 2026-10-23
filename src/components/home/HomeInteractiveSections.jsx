'use client';

import dynamic from 'next/dynamic';

const Reviews = dynamic(
  () => import('@/components/home').then((mod) => mod.Reviews),
  { ssr: false }
);

const UGCContent = dynamic(
  () => import('@/components/home').then((mod) => mod.UGCContent),
  { ssr: false }
);

const HomeInteractiveSections = () => (
  <>
    <Reviews />
    <UGCContent />
  </>
);

export default HomeInteractiveSections;
