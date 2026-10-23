'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Col, Container, Row } from 'reactstrap';
import Image from 'next/image';
import { RiDoubleQuotesR } from 'react-icons/ri';
import { LeafSVG } from '@/components/common/CommonSVG';
import ProductBox1Rating from '@/components/common/productBox/productBox1/ProductBox1Rating';
import CustomHeading from '../common/CustomHeading';
import SkReviews from '@/components/common/skeletonLoader/homeSkeleton/SkReviews';
import { useHome, useReviews } from '@/utils/hooks/useHome';
import { getInitials } from '@/utils/helpers';

const MARQUEE_SPEED_PX_PER_SEC = 50;

const ReviewCard = ({ item }) => (
  <div className="reviewer-box">
    <div className="icon">
      <RiDoubleQuotesR />
    </div>

    <div className="product-rating mb-2">
      <ProductBox1Rating totalRating={item.star} />
    </div>

    <p data-lenis-prevent className="common-scrollbar">
      {item.message}
    </p>

    <div className="reviewer-profile">
      {item.image ? (
        <div className="reviewer-image">
          <Image
            height={60}
            width={60}
            src={item.image}
            alt={item.imageAlt || item.name}
            unoptimized
            loading="lazy"
          />
        </div>
      ) : (
        <div className="reviewer-initials">{getInitials(item.name)}</div>
      )}

      <div className="reviewer-name">
        <h5>{item.name}</h5>
        <h6>{item.userType}</h6>
      </div>
    </div>
  </div>
);

const Reviews = () => {
  // const { data } = useHome();
  const { data, isLoading } = useReviews();
  // const reviewsList = data?.data?.reviews || [];
  const reviewsList = (data?.data?.reviews || []).slice(0, 10);
  const trackRef = useRef(null);

  // const marqueeItems = useMemo(() => {
  //   if (reviewsList.length === 0) {
  //     return [];
  //   }

  //   const duplicated = [...reviewsList, ...reviewsList];

  //   return duplicated.map((item, index) => ({
  //     ...item,
  //     marqueeKey: `${item.uid ?? item.id ?? 'review'}-${index}`,
  //   }));
  // }, [reviewsList]);
  const marqueeItems = useMemo(() => {
    if (reviewsList.length === 0) {
      return [];
    }

    const duplicated = [...reviewsList, ...reviewsList];

    return duplicated.map((item, index) => ({
      ...item,
      marqueeKey: `${item.uid ?? item.id ?? 'review'}-${index}`,
    }));
  }, [reviewsList]);

  useEffect(() => {
    const track = trackRef.current;

    if (!track || reviewsList.length === 0) {
      return undefined;
    }

    const updateDuration = () => {
      const halfWidth = track.scrollWidth / 2;

      if (halfWidth <= 0) {
        return;
      }

      track.style.setProperty(
        '--marquee-duration',
        `${halfWidth / MARQUEE_SPEED_PX_PER_SEC}s`
      );
    };

    updateDuration();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(updateDuration)
        : null;

    resizeObserver?.observe(track);
    window.addEventListener('resize', updateDuration);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateDuration);
    };
  }, [reviewsList]);

  if (isLoading) {
    return <SkReviews />;
  }

  if (reviewsList.length === 0) {
    return null;
  }

  return (
    <section className="review-section section-b-space section-t-space">
      <Container fluid>
        <CustomHeading
          customClass="mb-0 text-center"
          title="Testimonials"
          subTitle="See what our customers are saying about their wellness journey with us"
          svgUrl={<LeafSVG className="icon-width" />}
        />

        <Row>
          <Col xs="12">
            <div className="reviews-marquee">
              <div ref={trackRef} className="reviews-marquee__track">
                {marqueeItems.map((item) => (
                  <div className="reviews-marquee__slide" key={item.marqueeKey}>
                    <ReviewCard item={item} />
                  </div>
                ))}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Reviews;
