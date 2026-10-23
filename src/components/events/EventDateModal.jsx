'use client';

import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { RiCalendarLine, RiMapPinLine, RiTimeLine, RiPriceTag3Line } from 'react-icons/ri';
import { useRouter } from 'next/navigation';

const EventDateModal = ({ date, events, isOpen, onClose }) => {
  const router = useRouter();

  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const formatEventDate = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const handleEventClick = (eventId) => {
    router.push(`/events/${eventId}`);
    onClose();
  };

  const getStatusColor = (status) => {
    const colors = {
      upcoming: 'status-upcoming',
      ongoing: 'status-ongoing',
      past: 'status-past',
    };
    return colors[status] || 'status-upcoming';
  };

  const getCategoryColor = (category) => {
    const colors = {
      conference: 'category-conference',
      workshop: 'category-workshop',
      seminar: 'category-seminar',
      networking: 'category-networking',
      webinar: 'category-webinar',
      meetup: 'category-meetup',
      training: 'category-training',
      hackathon: 'category-hackathon',
    };
    return colors[category] || 'category-default';
  };

  return (
    <Modal 
      isOpen={isOpen} 
      toggle={onClose} 
      className="event-date-modal"
      size="lg"
      centered
    >
      <ModalHeader toggle={onClose} className="event-modal-header">
        <div className="modal-header-content">
          <RiCalendarLine size={24} className="header-icon" />
          <div>
            <h3 className="modal-title">Events on</h3>
            <p className="modal-date">{formatDate(date)}</p>
          </div>
        </div>
      </ModalHeader>

      <ModalBody className="event-modal-body">
        {events.length === 0 ? (
          <div className="no-events">
            <p>No events scheduled for this date</p>
          </div>
        ) : (
          <div className="events-list">
            {events.map((event, index) => (
              <div 
                key={event.id || index} 
                className="event-card-modal"
                onClick={() => handleEventClick(event.id)}
                role="button"
                tabIndex={0}
              >
                <div className="event-image-wrapper">
                  {event.image ? (
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="event-image"
                    />
                  ) : (
                    <div className="event-image-placeholder">
                      <RiCalendarLine size={40} />
                    </div>
                  )}
                  <span className={`event-status-badge ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>

                <div className="event-details">
                  <div className="event-header">
                    <h4 className="event-title">{event.title}</h4>
                    <span className={`event-category-badge ${getCategoryColor(event.category)}`}>
                      {event.categoryName}
                    </span>
                  </div>

                  <div className="event-meta">
                    <div className="meta-item">
                      <RiCalendarLine size={16} />
                      <span>{formatEventDate(event.startDate, event.endDate)}</span>
                    </div>

                    {event.location && (
                      <div className="meta-item">
                        <RiMapPinLine size={16} />
                        <span>{event.location}</span>
                      </div>
                    )}

                    {event.time && (
                      <div className="meta-item">
                        <RiTimeLine size={16} />
                        <span>{event.time}</span>
                      </div>
                    )}
                  </div>

                  {event.description && (
                    <p className="event-description">
                      {event.description.length > 100 
                        ? `${event.description.substring(0, 100)}...` 
                        : event.description}
                    </p>
                  )}

                  <div className="event-footer">
                    {event.tags && event.tags.length > 0 && (
                      <div className="event-tags">
                        {event.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="event-tag">
                            <RiPriceTag3Line size={12} />
                            {tag}
                          </span>
                        ))}
                        {event.tags.length > 3 && (
                          <span className="event-tag">+{event.tags.length - 3}</span>
                        )}
                      </div>
                    )}

                    <div className="event-action">
                      <span className="view-details-text">
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ModalBody>

      <ModalFooter className="event-modal-footer">
        <p className="event-count">
          {events.length} {events.length === 1 ? 'event' : 'events'} scheduled
        </p>
        <button className="close-modal-btn" onClick={onClose}>
          Close
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default EventDateModal;
