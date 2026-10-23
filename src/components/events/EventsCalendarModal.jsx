'use client';

import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { RiCalendarLine, RiMapPinLine, RiArrowRightSLine } from 'react-icons/ri';
import { format } from 'date-fns';
import Link from 'next/link';

const EventsCalendarModal = ({ isOpen, toggle, selectedDate, events }) => {

  const formatDate = (date) => {
    try {
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      return '';
    }
  };

  const formatEventDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (error) {
      return '';
    }
  };

  const isUpcoming = (event) => event.status === 'upcoming';
  const isPast = (event) => event.status === 'past';

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" className="events-calendar-modal" centered>
      <ModalHeader toggle={toggle}>
        <div className="modal-header-content">
          <RiCalendarLine size={24} className="header-icon" />
          <div>
            <h3>{selectedDate ? formatDate(selectedDate) : 'Select a Date'}</h3>
            <p className="event-count">{events && events.length > 0 ? `${events.length} ${events.length === 1 ? 'Event' : 'Events'}` : 'No events'}</p>
          </div>
        </div>
      </ModalHeader>
      <ModalBody>
        {(!events || events.length === 0) ? (
          <div className="no-events-state">
            <div className="no-events-icon">
              <RiCalendarLine size={48} />
            </div>
            <h4>No Events Found</h4>
            <p>There are no events scheduled for this date.</p>
          </div>
        ) : (
          <div className="modal-events-list">
            {events.map((event, index) => (
              <div key={index} className={`modal-event-card ${isPast(event) ? 'modal-event-card--past' : ''}`}>
                <div className="modal-event-card__image-container">
                  <img
                    src={event.coverImage}
                    alt={event.coverImageAlt || event.title}
                    className="modal-event-card__image"
                    loading="lazy"
                  />
                  <span className={`modal-event-card__badge ${isPast(event) ? 'badge--past' : 'badge--upcoming'}`}>
                    {event.categoryName}
                  </span>
                  {isPast(event) && <div className="modal-event-card__overlay">Past Event</div>}
                </div>
                
                <div className="modal-event-card__content">
                  <h4 className="modal-event-card__title">{event.title}</h4>
                  
                  <p className="modal-event-card__description">
                    {event.shortDescription}
                  </p>
                  
                  <div className="modal-event-card__meta">
                    <div className="modal-event-card__meta-item">
                      <RiCalendarLine className="meta-icon" />
                      <span>{formatEventDate(event.date)}</span>
                    </div>
                    
                    <div className="modal-event-card__meta-item">
                      <RiMapPinLine className="meta-icon" />
                      <span className="meta-text-truncate">{event.address}</span>
                    </div>
                  </div>

                  <Link 
                    href={`/events/${event.id}`} 
                    className="modal-event-card__button"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isPast(event) ? 'View Details' : 'Learn More'}
                    <RiArrowRightSLine className="button-icon" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};

export default EventsCalendarModal;
