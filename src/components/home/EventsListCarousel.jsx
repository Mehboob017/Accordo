'use client';

import { useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Slider from 'react-slick';
import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';
import WrapperComponent from '@/components/common/WrapperComponent';
import CustomHeading from '@/components/common/CustomHeading';
import EventCard from '@/components/events/EventCard';
import styles from './EventsListCarousel.module.scss';
import Btn from '@/elements/buttons/Btn';
import { useHome, useUpcomingEvents } from '@/utils/hooks/useHome';

const CarouselArrow = ({ className, onClick, direction }) => {
  const Icon = direction === 'prev' ? RiArrowLeftSLine : RiArrowRightSLine;

  return (
    <button
      type="button"
      aria-label={direction === 'prev' ? 'Previous events' : 'Next events'}
      className={[
        className,
        styles['events-carousel__nav'],
        styles[`events-carousel__nav--${direction}`],
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
    >
      <Icon />
    </button>
  );
};

const EventsListCarousel = ({ events = [] }) => {
  const sliderRef = useRef(null);
  // const { data } = useHome();
  const { data } = useUpcomingEvents();

  const items = useMemo(() => {
    const upcomingEvents = data?.data?.upcomingEvents || [];

    return upcomingEvents.map((event) => ({
      id: event.uid,
      slug: event.slug,
      title: event.title,
      shortDescription: event.shortDescription,
      coverImage: event.coverImage,
      coverImageAlt: event.coverImageAlt,
      categoryName: event.eventCategory?.name,
      status: event.isUpcoming ? 'upcoming' : 'past',
      type: event.eventVariant?.type,
      address:
        event.eventVariant?.googleAddress ||
        [event.eventVariant?.city, event.eventVariant?.state]
          .filter(Boolean)
          .join(', '),
      startDate: event.eventVariant?.startDate,
      endDate: event.eventVariant?.endDate,
      displayStartTime: event.eventVariant?.displayStartTime,
      displayEndTime: event.eventVariant?.displayEndTime,
    }));
  }, [data]);

  useEffect(() => {
    if (!items.length) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      sliderRef.current?.slickGoTo?.(0, true);
    }, 120);

    return () => window.clearTimeout(timer);
  }, [items.length]);

  const slidesToShow = (max) => Math.min(Math.max(items.length, 1), max);

  const sliderSettings = {
    dots: true,
    arrows: items.length > 1,
    infinite: items.length > 3,
    speed: 550,
    slidesToShow: slidesToShow(3),
    slidesToScroll: 1,
    adaptiveHeight: false,
    pauseOnHover: true,
    nextArrow: <CarouselArrow direction="next" />,
    prevArrow: <CarouselArrow direction="prev" />,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: slidesToShow(3) } },
      { breakpoint: 992, settings: { slidesToShow: slidesToShow(2) } },
      { breakpoint: 576, settings: { slidesToShow: 1 } },
    ],
  };

  if (!items) return null;

  return (
    <WrapperComponent
      classes={{
        sectionClass: `section-b-space ${styles['events-carousel-section']}`,
      }}
      noRowCol
    >
      <div className={styles['events-carousel__shell']}>
        <CustomHeading
          title="Our Popular Events"
          customTitleClass={`${styles['events-carousel__header']} title`}
        >
          <Link href="/events">
            <Btn color="primary" size="md">
              View More
            </Btn>
          </Link>
        </CustomHeading>

        <div
          className={`${styles['events-carousel__slider-wrap']} hero-carousel-section`}
        >
          <Slider ref={sliderRef} {...sliderSettings}>
            {items.map((event) => (
              <div key={event.id} className={styles['events-carousel__slide']}>
                <EventCard event={event} />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </WrapperComponent>
  );
};

export default EventsListCarousel;
