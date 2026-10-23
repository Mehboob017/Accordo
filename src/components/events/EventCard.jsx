'use client';

import { formatDate, getOptimizedCdnImageUrl } from '@/utils/helpers';
import { useRouter } from 'next/navigation';
import {
  RiMapPinLine,
  RiCalendarLine,
  RiTimeLine,
  RiArrowRightSLine,
} from 'react-icons/ri';

const EventCard = ({ event, viewMode = 'grid' }) => {
  const router = useRouter();

  const isUpcoming = event.status === 'upcoming';
  const isPast = event.status === 'past';
  const typeValue = (event.type || '').toString();
  const isOnline = typeValue.toLowerCase() === 'online';
  const displayStartTime = event.displayStartTime || event.startTime;
  const displayEndTime = event.displayEndTime || event.endTime;
  const displayDate = event.startDate || event.date;
  const displayEndDate = event.endDate;
  const dateText =
    displayEndDate && displayEndDate !== displayDate
      ? `${formatDate(displayDate)} - ${formatDate(displayEndDate)}`
      : formatDate(displayDate);
  const addressText = isOnline ? 'Online Event' : event.address;

  const handleCardClick = () => {
    router.push(`/events/${event.slug}`);
  };

  const handleButtonClick = (e) => {
    e.stopPropagation();
    router.push(`/events/${event.slug}`);
  };

  if (viewMode === 'list') {
    return (
      <div
        className={`event-card event-card--list ${isPast ? 'event-card--past' : ''}`}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
      >
        <div className="event-card__image-container">
          <img
            src={getOptimizedCdnImageUrl(event.coverImage, 300, 300, 80)}
            alt={event.coverImageAlt}
            className="event-card__image"
            loading="lazy"
            decoding="async"
            width={300}
            height={300}
          />
          <span
            className={`event-card__badge ${isPast ? 'badge--past' : 'badge--upcoming'}`}
          >
            {event.categoryName}
          </span>
        </div>

        <div className="event-card__content">
          <div className="event-card__header">
            <h3 className="event-card__title" title={event.title}>
              {event.title}
            </h3>
            {isPast && <span className="event-card__status">Past Event</span>}
          </div>

          <p className="event-card__description">{event.shortDescription}</p>

          <div className="event-card__meta">
            <div className="event-card__meta-item">
              <RiCalendarLine className="meta-icon" />
              <span>{dateText}</span>
            </div>
            {displayStartTime && displayEndTime && (
              <div className="event-card__meta-item">
                <RiTimeLine className="meta-icon" />
                <span>{displayStartTime}</span> - <span>{displayEndTime}</span>
              </div>
            )}
            {addressText && (
              <div className="event-card__meta-item">
                <RiMapPinLine className="meta-icon" />
                <span>{addressText}</span>
              </div>
            )}
          </div>

          <button
            className="event-card__button btn-primary"
            onClick={handleButtonClick}
          >
            {/* {isPast ? 'View Details' : 'Learn More'} */}
            View Details
            <RiArrowRightSLine className="button-icon" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`event-card event-card--grid ${isPast ? 'event-card--past' : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <div className="event-card__image-container">
        <img
          src={getOptimizedCdnImageUrl(event.coverImage, 300, 300, 80)}
          alt={event.coverImageAlt}
          className="event-card__image"
          loading="lazy"
          decoding="async"
          width={300}
          height={300}
        />
        <span
          className={`event-card__badge ${isPast ? 'badge--past' : 'badge--upcoming'}`}
        >
          {event.categoryName}
        </span>
        {isPast && <div className="event-card__overlay">Past Event</div>}
      </div>

      <div className="event-card__content">
        <h3 className="event-card__title" title={event.title}>
          {event.title}
        </h3>
        <p className="event-card__description">{event.shortDescription}</p>

        <div className="event-card__meta">
          <div className="event-card__meta-item">
            <RiCalendarLine className="meta-icon" />
            <span>{dateText}</span>
          </div>
          {displayStartTime && displayEndTime && (
            <div className="event-card__meta-item">
              <RiTimeLine className="meta-icon" />
              <span>{displayStartTime}</span> - <span>{displayEndTime}</span>
            </div>
          )}
          <div className="event-card__meta-item">
            <RiMapPinLine className="meta-icon" />
            <span className="meta-text-truncate">{addressText}</span>
          </div>
        </div>

        <button
          className="event-card__button btn-primary"
          onClick={handleButtonClick}
        >
          {/* {isPast ? 'View Details' : 'Learn More'} */}
          View Details
          <RiArrowRightSLine className="button-icon" />
        </button>
      </div>
    </div>
  );
};

export default EventCard;
