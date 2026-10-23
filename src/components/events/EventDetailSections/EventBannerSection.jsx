'use client';

import Image from "next/image";

const EventBannerSection = ({ eventData }) => {
  const coverImage = eventData.event?.coverImage;

  if (!coverImage) return null;

  return (
    <>
      {coverImage && (
        <section className="event-banner-section">
          <Image src={coverImage} alt={eventData.event?.coverImageAlt || eventData.event?.title || 'Event Banner'} layout="responsive" width={700} height={400} quality={100} />
        </section>
      )}
    </>
  );
};

export default EventBannerSection;
