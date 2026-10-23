import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/utils/getQueryClient';
import HomeClient from '@/components/home/HomeClient';
import HomeSeoContent from '@/components/home/HomeSeoContent';

import { generateStaticSeoMetadata, getStaticSeo } from '@/utils/seo';
import SeoJsonLd from '@/components/seo/SeoJsonLd';
import { fetchHomeSection } from '@/api/home.api';

export async function generateMetadata() {
  return generateStaticSeoMetadata('home');
}

export default async function Home() {
  // const { schemas } = await getStaticSeo('home');
  // const queryClient = getQueryClient();
  // // Removed server-side prefetch so that the token is sent correctly from the client
  // // await queryClient.prefetchQuery({ queryKey: ['home'], queryFn: fetchHome });

  const { schemas } = await getStaticSeo('home');
  const queryClient = getQueryClient();

  // await queryClient.prefetchQuery({
  //   queryKey: ['home'],
  //   queryFn: fetchHome, // let it run unauthenticated on the server; payload isn't personalized
  // });

  await Promise.all(
    [1, 2, 3].map((section) =>
      queryClient.prefetchQuery({
        queryKey: ['home', section],
        queryFn: () => fetchHomeSection(section),
      })
    )
  );

  const sliderSettings = {
    dots: false,
    arrows: true,
    infinite: true,
    speed: 400,
    slidesToScroll: 1,
    slidesToShow: 7.2,
    swipeToSlide: true,
    responsive: [
      { breakpoint: 1440, settings: { slidesToShow: 7 } },
      { breakpoint: 1200, settings: { slidesToShow: 6.5 } },
      { breakpoint: 992, settings: { slidesToShow: 6 } },
      { breakpoint: 768, settings: { slidesToShow: 5.5 } },
      { breakpoint: 540, settings: { slidesToShow: 3 } },
    ],
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SeoJsonLd schemas={schemas} />
      <HomeClient sliderSettings={sliderSettings} />
      <HomeSeoContent />
    </HydrationBoundary>
  );
}