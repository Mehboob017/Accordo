'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import SkHealthConcern from '@/components/common/skeletonLoader/homeSkeleton/SkHealthConcern';
import SkReviews from '@/components/common/skeletonLoader/homeSkeleton/SkReviews';
import SkUGCContent from '@/components/common/skeletonLoader/homeSkeleton/SkUGCContent';
import SkHomeBlogs from '@/components/common/skeletonLoader/homeSkeleton/SkHomeBlogs';
import SkHomeFaqs from '@/components/common/skeletonLoader/homeSkeleton/SkHomeFaqs';
import SkBestSeller, { ProductCardSkeleton } from '@/components/common/skeletonLoader/homeSkeleton/SkBestSeller';
import { Col, Row } from 'reactstrap';
import WrapperComponent from '../common/WrapperComponent';

// const HeroCarousel = dynamic(() => import('@/components/home').then(mod => mod.HeroCarousel), { ssr: false });
// const BestSellerProducts = dynamic(() => import('@/components/home').then(mod => mod.BestSellerProducts), { ssr: false });

const HeroCarousel = dynamic(() => import('@/components/home').then(mod => mod.HeroCarousel));
const BestSellerProducts = dynamic(() => import('@/components/home').then(mod => mod.BestSellerProducts), {
  loading: () => <SkBestSeller count={4} />,
});
const StaticBannerCarousel = dynamic(() => import('@/components/home').then(mod => mod.StaticBannerCarousel));
const ShopByIngredients = dynamic(() => import('@/components/home').then(mod => mod.ShopByIngredients));
const ShopByHealthConcerns = dynamic(() => import('@/components/home').then(mod => mod.ShopByHealthConcerns));

// const CTABanner = dynamic(() => import('@/components/home').then(mod => mod.CTABanner), { ssr: false });
// const CTABanner2 = dynamic(() => import('@/components/home').then(mod => mod.CTABanner2), { ssr: false });
// const NewProfileSection = dynamic(() => import('@/components/home').then(mod => mod.NewProfileSection), { ssr: false });
const HomeBlogs = dynamic(() => import('@/components/home').then(mod => mod.HomeBlogs), {
  loading: () => <SkHomeBlogs />,
});
const Reviews = dynamic(() => import('@/components/home').then(mod => mod.Reviews), {
  loading: () => <SkReviews />,
});
const UGCContent = dynamic(() => import('@/components/home').then(mod => mod.UGCContent), {
  loading: () => <SkUGCContent />,
});
const HomeFaqs = dynamic(() => import('@/components/home').then(mod => mod.HomeFaqs), {
  loading: () => <SkHomeFaqs />,
});

function HeroSkeleton() {
  return (
    <div className="hero-carousel-section">
      <Row className="g-0">
        <Col xs={12}>
          <div className="sk-hero-image skeleton-shimmer" />
        </Col>
      </Row>
      <style jsx>{`
        .sk-hero-image {
          width: 100%;
          aspect-ratio: 21 / 9;
          border-radius: 12px;
        }
      `}</style>
    </div>
  );
}

function BestSellerSkeleton({ count = 4 }) {
  return (
    <WrapperComponent customCol={true} classes={{ sectionClass: 'section-b-space best-seller-products-section' }}>
      <Row className="align-items-center mb-3">
        <Col xs={8}>
          <div className="sk-title skeleton-shimmer" />
        </Col>
      </Row>
      <Row className="g-sm-4 g-3 product-list-section">
        {Array.from({ length: count }).map((_, i) => (
          <Col xl={3} lg={4} md={6} xs={6} key={i}>
            <ProductCardSkeleton />
          </Col>
        ))}
      </Row>
      <style jsx>{`
        .sk-title { width: 220px; height: 28px; border-radius: 4px; }
      `}</style>
    </WrapperComponent>
  );
}

export default function HomeClient({ sliderSettings }) {
  return (
    <>
      <h1 className='sr-only'>
        Shree Dhootapapeshwar Limited – 150+ Years of Excellence in Ayurvedic Medicines
      </h1>

      <Suspense fallback={<HeroSkeleton />}>
        <HeroCarousel />
      </Suspense>

      <Suspense fallback={<SkBestSeller count={4} />}>
        <BestSellerProducts />
      </Suspense>

      {/* <Suspense fallback={null}>
        <CTABanner />
      </Suspense> */}

      <Suspense fallback={<HeroSkeleton />}>
        <StaticBannerCarousel />
      </Suspense>

      {/* <Suspense fallback={null}>
        <CTABanner2 />
      </Suspense>

      <Suspense fallback={null}>
        <NewProfileSection />
      </Suspense> */}

      <Suspense fallback={<BestSellerSkeleton count={4} />}>
        <ShopByIngredients />
      </Suspense>

      <Suspense fallback={<SkHealthConcern count={10} sliderSettings={sliderSettings} />}>
        <ShopByHealthConcerns />
      </Suspense>

      <Suspense fallback={<SkReviews />}>
        <Reviews />
      </Suspense>

      <Suspense fallback={<SkUGCContent />}>
        <UGCContent />
      </Suspense>

      <Suspense fallback={<SkHomeBlogs />}>
        <HomeBlogs />
      </Suspense>

      <Suspense fallback={<SkHomeFaqs />}>
        <HomeFaqs />
      </Suspense>

      <style jsx global>{`
        .skeleton-shimmer {
          background: linear-gradient(90deg, #eee 25%, #f5f5f5 37%, #eee 63%);
          background-size: 400% 100%;
          animation: skeleton-shimmer 1.4s ease infinite;
        }
        @keyframes skeleton-shimmer {
          0% { background-position: 100% 50%; }
          100% { background-position: 0 50%; }
        }
      `}</style>
    </>
  );
}
