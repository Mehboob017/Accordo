'use client';

import { Row, Col, Button } from 'reactstrap';
import { RiCalendarLine, RiCalendarScheduleLine, RiArrowRightUpLine } from 'react-icons/ri';
import { HiOutlineArrowNarrowRight, HiOutlineVideoCamera } from 'react-icons/hi';
import { MdEventAvailable } from "react-icons/md";
import { formatDate } from '@/utils/helpers';
import { useState, useEffect, useRef } from 'react';

const EventHeroSection = ({ eventData, onReadMoreClick, openIframeModal }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const handleToggle = () => setOpen((prev) => !prev);

  // Calendar – use first variant
  const getAddress = (variant) => {
    if (!variant) return '';
    const { addressLine1, addressLine2, city, state, pincode } = variant;
    const parts = [];
    if (addressLine1) parts.push(addressLine1);
    if (addressLine2) parts.push(addressLine2);
    if (city) parts.push(city);
    if (state && pincode) parts.push(`${state} - ${pincode}`);
    else if (state) parts.push(state);
    else if (pincode) parts.push(pincode);
    return parts.join(', ') || (variant.type === 'Online' ? variant.link || 'Virtual Event' : '');
  };

  const formatCalendarDateTime = (dateStr, timeStr, useTime = true) => {
    if (!dateStr) return '';
    const datePart = dateStr.replace(/-/g, '');
    if (!useTime || !timeStr) return datePart;
    const timePart = timeStr.replace(/:/g, '').padEnd(6, '0');
    return `${datePart}T${timePart}`;
  };

  const getEventForCalendar = () => {
    const variant = eventData?.variants?.[0];
    if (!variant) return null;
    const start = formatCalendarDateTime(
      variant.startDate,
      variant.startTime ?? '00:00',
      true
    );
    const end = formatCalendarDateTime(
      variant.endDate || variant.startDate,
      variant.endTime ?? variant.startTime ?? '23:59',
      true
    );
    return {
      title: eventData?.event?.title ?? '',
      shortDescription: eventData?.event?.shortDescription ?? '',
      location: getAddress(variant),
      start,
      end,
      startISO:
        variant.startDate && variant.startTime
          ? `${variant.startDate}T${variant.startTime}:00`
          : variant.startDate
            ? `${variant.startDate}T00:00:00`
            : '',
      endISO:
        (variant.endDate || variant.startDate) && (variant.endTime || variant.startTime)
          ? `${variant.endDate || variant.startDate}T${variant.endTime || variant.startTime}:00`
          : variant.endDate || variant.startDate
            ? `${variant.endDate || variant.startDate}T23:59:59`
            : '',
    };
  };

  const googleUrl = () => {
    const event = getEventForCalendar();
    if (!event) return '#';
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${event.start}/${event.end}&details=${encodeURIComponent(
      event.shortDescription
    )}&location=${encodeURIComponent(event.location)}`;
  };

  const outlookUrl = () => {
    const event = getEventForCalendar();
    if (!event) return '#';
    return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(
      event.title
    )}&body=${encodeURIComponent(event.shortDescription)}&location=${encodeURIComponent(
      event.location
    )}&startdt=${encodeURIComponent(event.startISO)}&enddt=${encodeURIComponent(event.endISO)}`;
  };

  const yahooUrl = () => {
    const event = getEventForCalendar();
    if (!event) return '#';
    return `https://calendar.yahoo.com/?v=60&title=${encodeURIComponent(
      event.title
    )}&st=${event.start}&et=${event.end}&desc=${encodeURIComponent(
      event.shortDescription
    )}&in_loc=${encodeURIComponent(event.location)}`;
  };

  const downloadICS = () => {
    const event = getEventForCalendar();
    if (!event) return;
    const icsContent = `
      BEGIN:VCALENDAR
      VERSION:2.0
      BEGIN:VEVENT
      SUMMARY:${event.title.replace(/\n/g, '\\n')}
      DESCRIPTION:${event.shortDescription.replace(/\n/g, '\\n')}
      LOCATION:${event.location.replace(/\n/g, '\\n')}
      DTSTART:${event.start}
      DTEND:${event.end}
      END:VEVENT
      END:VCALENDAR`.trim();

    const blob = new Blob([icsContent], {
      type: 'text/calendar;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'event.ics';
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSelect = (type) => {
    setOpen(false);
    if (type === 'ical') downloadICS();
    else if (type === 'google') window.open(googleUrl(), '_blank');
    else if (type === 'outlook') window.open(outlookUrl(), '_blank');
    else if (type === 'yahoo') window.open(yahooUrl(), '_blank');
  };

  return (
    <section className={`event-detail-hero`}>
      <div className="event-hero-bg">
        {eventData.event?.coverImage && (
          <img
            src={
              eventData.event?.coverImage
              // || '/assets/images/cake/banner/people-taking-part-high-protocol-event.jpg'
            }
            alt={eventData.event?.coverImageAlt || eventData.event?.title}
            className="hero-bg-image"
          />
        )}
        <div className="hero-overlay"></div>
      </div>

      <div className="container-fluid-lg">
        <Row className="">
          <Col>
            <div className="event-hero-content">
              {eventData.event.eventCategory.name && (
                <div className="event-badge">
                  <span className="badge-text">
                    {eventData.event.eventCategory.name}
                  </span>
                </div>
              )}

              {eventData.event.title && (
                <h1 className="event-hero-title">{eventData.event.title}</h1>
              )}

              <div className="event-hero-meta">
                {eventData.event.dateRange.startDate && (
                  <div className="meta-item">
                    <RiCalendarLine className="meta-icon" />
                    <span>
                      {`${formatDate(eventData.event.dateRange.startDate)} - ${formatDate(eventData.event.dateRange.endDate)}`}
                    </span>
                  </div>
                )}

                {/* NOT POSSIBLE TO DISPLAY TIME */}
                {/* {eventData.event.displayStartTime && eventData.event.displayEndTime && (
                  <div className="meta-item">
                    <RiTimeLine className="meta-icon" />
                    <span>
                      {eventData.event.displayStartTime} - {eventData.event.displayEndTime}
                    </span>
                  </div>
                )} */}

                {/* NOT POSSIBLE TO DISPLAY LOCATION */}
                {/* {eventData.event.location && (
                  <div className="meta-item">
                    <RiMapPinLine className="meta-icon" />
                    <span>{eventData.event.location}</span>
                  </div>
                )} */}
              </div>

              {eventData.event.shortDescription && (
                <p className="event-hero-description">
                  {eventData.event.shortDescription}
                </p>
              )}

              {/* dropdown for Add to Calendar with options as Google Calendar, Yahoo, Outlook, and iCal */}
              <div
                className={`event-hero-actions ${open ? 'open' : ''}`}
                ref={wrapperRef}
              >
                {/* read more button (onclick go down to about section) */}
                <Button
                  color="secondary"
                  className="btn-secondary btn-read-more"
                  onClick={onReadMoreClick}
                  type="button"
                >
                  Read More
                </Button>
                {eventData?.variants?.[0]?.type === "Online" && (
                  <Button
                    color="primary"
                    className="btn-ticket bg-danger border-danger no-hover"
                    type="button"
                    onClick={() => openIframeModal(eventData?.variants?.[0]?.link)}
                  >
                    <HiOutlineVideoCamera className="btn-icon" />
                    Watch Live
                    <RiArrowRightUpLine className="btn-icon" />
                  </Button>
                )}
                {eventData?.variants?.some((v) => v.isUpcoming) && (
                  <Button
                    color="primary"
                    className="btn-ticket"
                    onClick={handleToggle}
                    type="button"
                  >
                    <RiCalendarScheduleLine className="btn-icon" />
                    Add To Calendar
                    <HiOutlineArrowNarrowRight className="btn-icon" />
                    <ul className="calendar-dropdown">
                      <li onClick={() => handleSelect('google')}>
                        Google Calendar
                      </li>
                      <li onClick={() => handleSelect('yahoo')}>Yahoo</li>
                      <li onClick={() => handleSelect('outlook')}>Outlook</li>
                      <li onClick={() => handleSelect('ical')}>iCal</li>
                    </ul>
                  </Button>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Mobile Hero Image */}
      {eventData.event.coverImage && (
        <div className="event-hero-mobile-image">
          <img
            src={eventData.event.coverImage}
            alt={eventData.event.coverImageAlt || eventData.event.title}
          />
        </div>
      )}
    </section>
  );
};

export default EventHeroSection;
