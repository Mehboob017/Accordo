'use client';

import { RiCalendarLine, RiMapPinLine, RiArrowRightSLine, RiTimeLine } from 'react-icons/ri';
import { format } from 'date-fns';
import Link from 'next/link';
import { formatDate } from '@/utils/helpers';

const EventsCalendarSidebar = ({ selectedDate, events }) => {
  const isUpcoming = (event) => event.status === 'upcoming';
  const isPast = (event) => event.status === 'past';

  return (
    <div className="events-calendar-sidebar common-scrollbar " data-lenis-prevent>
      <div className="sidebar-header">
        <div>
          <h3>
            Events on{' '}
            {selectedDate ? formatDate(selectedDate) : 'Select a Date'}
          </h3>
          <p className="event-count">
            {events && events.length > 0
              ? `${events.length} ${events.length === 1 ? 'Event' : 'Events'}`
              : 'No events'}
          </p>
        </div>
      </div>

      <div className="sidebar-content">
        {!events || events.length === 0 ? (
          <div className="no-events-state">
            <div className="no-events-icon">
              <RiCalendarLine size={48} />
            </div>
            <h4>No Events Found</h4>
            <p>There are no events scheduled for this date.</p>
          </div>
        ) : (
          events.map((event, index) => (
            <div
              key={index}
              className={`sidebar-event-card ${isPast(event) ? 'sidebar-event-card--past' : ''}`}
            >
              <div className="sidebar-event-card__image-container">
                <img
                  src={event.coverImage}
                  alt={event.coverImageAlt || event.title}
                  className="sidebar-event-card__image"
                  loading="lazy"
                />
                <span
                  className={`sidebar-event-card__badge ${isPast(event) ? 'badge--past' : 'badge--upcoming'}`}
                >
                  {event.categoryName}
                </span>
                {isPast(event) && (
                  <div className="sidebar-event-card__overlay">Past Event</div>
                )}
              </div>

              <div className="sidebar-event-card__content">
                <h4 className="sidebar-event-card__title">{event.title}</h4>

                <p className="sidebar-event-card__description">
                  {event.shortDescription}
                </p>

                <div className="sidebar-event-card__meta">
                  <div className="sidebar-event-card__meta-item">
                    <RiCalendarLine className="meta-icon" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  {event.startTime && event.endTime && (
                    <div className="sidebar-event-card__meta-item">
                      <RiTimeLine className="meta-icon" />
                      <span>{event.startTime}</span> -{' '}
                      <span>{event.endTime}</span>
                    </div>
                  )}
                  <div className="sidebar-event-card__meta-item">
                    <RiMapPinLine className="meta-icon" />
                    <span className="meta-text-truncate">{event.address}</span>
                  </div>
                </div>

                <Link
                  href={`/events/${event.slug}`}
                  className="sidebar-event-card__button"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isPast(event) ? 'View Details' : 'Learn More'}
                  <RiArrowRightSLine className="button-icon" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventsCalendarSidebar;
