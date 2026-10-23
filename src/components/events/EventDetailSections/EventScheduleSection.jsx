'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from 'reactstrap';
import {
  RiMapPinLine,
  RiTimeLine,
  RiUser3Line,
  RiCalendarScheduleLine,
} from 'react-icons/ri';
import { FiClock } from 'react-icons/fi';
import { HiOutlineArrowNarrowRight, HiOutlineVideoCamera } from 'react-icons/hi';
import { format } from 'date-fns';

const EventScheduleSection = ({ eventData, openIframeModal }) => {
  const [calendarOpenIndex, setCalendarOpenIndex] = useState(null);
  const calendarDropdownRef = useRef(null);

  const scheduleItems = eventData?.variants || [];

  const formatTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return '';
    return `${startTime} - ${endTime}`;
  };

  const formatFullDateRange = (startDate, endDate) => {
    if (!startDate) return '';
    const formattedStart = format(new Date(startDate), 'MMM dd, yyyy');
    if (!endDate || endDate === startDate) return formattedStart;
    const formattedEnd = format(new Date(endDate), 'MMM dd, yyyy');
    return `${formattedStart} - ${formattedEnd}`;
  };

  const getAddress = (variant) => {
    // if (variant?.googleAddress) {
    //   return variant.googleAddress;
    // }

    const line1 = variant?.addressLine1;
    const line2 = variant?.addressLine2;
    const city = variant?.city;
    const state = variant?.state;
    const pincode = variant?.pincode;

    const parts = [];

    if (line1) parts.push(line1);
    if (line2) parts.push(line2);
    if (city) parts.push(city);

    if (state && pincode) {
      parts.push(`${state} - ${pincode}`);
    } else if (state) {
      parts.push(state);
    } else if (pincode) {
      parts.push(pincode);
    }

    return parts.join(', ');
  };

  const getStatus = (variant) => {
    if (variant?.isUpcoming)
      return { text: 'Upcoming', className: 'badge-upcoming' };
    if (variant?.isPast) return { text: 'Past Event', className: 'badge-past' };
    return { text: '', className: '' };
  };

  // Close calendar dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        calendarDropdownRef.current &&
        !calendarDropdownRef.current.contains(e.target)
      ) {
        setCalendarOpenIndex(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const formatCalendarDateTime = (dateStr, timeStr, useTime = true) => {
    if (!dateStr) return '';
    const datePart = dateStr.replace(/-/g, ''); // 20260128
    if (!useTime || !timeStr) return datePart;
    const timePart = timeStr.replace(/:/g, '').padEnd(6, '0'); // 140000 from 14:00
    return `${datePart}T${timePart}`;
  };

  const getEventForCalendar = (variant) => {
    const start = formatCalendarDateTime(
      variant?.startDate,
      variant?.startTime ?? '00:00',
      true
    );
    const end = formatCalendarDateTime(
      variant?.endDate || variant?.startDate,
      variant?.endTime ?? variant?.startTime ?? '23:59',
      true
    );
    return {
      title: eventData?.event?.title ?? '',
      shortDescription: eventData?.event?.shortDescription ?? '',
      location:
        getAddress(variant) ||
        (variant?.type === 'Online' ? variant?.link || 'Virtual Event' : ''),
      start,
      end,
      // ISO format for Outlook
      startISO:
        variant?.startDate && variant?.startTime
          ? `${variant.startDate}T${variant.startTime}:00`
          : variant?.startDate
            ? `${variant.startDate}T00:00:00`
            : '',
      endISO:
        (variant?.endDate || variant?.startDate) &&
          (variant?.endTime || variant?.startTime)
          ? `${variant.endDate || variant.startDate}T${variant.endTime || variant.startTime}:00`
          : variant?.endDate || variant?.startDate
            ? `${variant.endDate || variant.startDate}T23:59:59`
            : '',
    };
  };

  const googleUrl = (variant) => {
    const event = getEventForCalendar(variant);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${event.start}/${event.end}&details=${encodeURIComponent(
      event.shortDescription
    )}&location=${encodeURIComponent(event.location)}`;
  };

  const outlookUrl = (variant) => {
    const event = getEventForCalendar(variant);
    return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(
      event.title
    )}&body=${encodeURIComponent(
      event.shortDescription
    )}&location=${encodeURIComponent(
      event.location
    )}&startdt=${encodeURIComponent(event.startISO)}&enddt=${encodeURIComponent(event.endISO)}`;
  };

  const yahooUrl = (variant) => {
    const event = getEventForCalendar(variant);
    return `https://calendar.yahoo.com/?v=60&title=${encodeURIComponent(
      event.title
    )}&st=${event.start}&et=${event.end}&desc=${encodeURIComponent(
      event.shortDescription
    )}&in_loc=${encodeURIComponent(event.location)}`;
  };

  const downloadICS = (variant) => {
    const event = getEventForCalendar(variant);
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

  const handleCalendarSelect = (type, variant) => {
    setCalendarOpenIndex(null);
    if (type === 'ical') downloadICS(variant);
    else if (type === 'google') window.open(googleUrl(variant), '_blank');
    else if (type === 'outlook') window.open(outlookUrl(variant), '_blank');
    else if (type === 'yahoo') window.open(yahooUrl(variant), '_blank');
  };


  if (!scheduleItems.length)
    return (
      <>
        <section className="event-schedule-section">
          <div className="event-section-card">
            <div className="event-section-header">
              <span className="event-section-indicator" />
              <h2 className="section-title">
                <span className="icon">
                  <FiClock />
                </span>{' '}
                Event Schedule
              </h2>
            </div>
            <div className="schedule-list">
              <p>No schedule available for this event.</p>
            </div>
          </div>
        </section>
      </>
    );

  return (
    <section className="event-schedule-section">
      <div className="event-section-card">
        <div className="event-section-header">
          <span className="event-section-indicator" />
          <h2 className="section-title">
            <span className="icon">
              <FiClock />
            </span>{' '}
            Event Schedule
          </h2>
        </div>

        <div className="schedule-list">
          {scheduleItems.map((variant, index) => {
            const typeValue = (variant?.type || '').toString();
            const typeLower = typeValue.toLowerCase();
            const startDate = variant?.startDate;
            const endDate = variant?.endDate;
            const startTime = variant?.displayStartTime || variant?.startTime;
            const endTime = variant?.displayEndTime || variant?.endTime;
            const status = getStatus(variant);
            const isPastEvent = getStatus(variant).text === 'Past Event';
            const address = getAddress(variant);

            const dateRange = formatFullDateRange(startDate, endDate);
            const timeRange = formatTimeRange(startTime, endTime);

            return (
              <div key={variant.uid || index} className="schedule-item">
                <div className="schedule-date-badge">
                  <div className="date-full">
                    {startDate ? new Date(startDate).getDate() : ''}
                    <small className="d-block">
                      {startDate ? format(new Date(startDate), 'MMM') : ''}
                    </small>
                  </div>
                </div>

                <div className="schedule-content">
                  <div className="schedule-header">
                    <h3 className="schedule-title">
                      {eventData?.event?.title}
                    </h3>
                    <div className="d-flex align-items-center gap-2">
                      {status.text && (
                        <span className={`schedule-badge ${status.className}`}>
                          {status.text}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="schedule-details">
                    {timeRange && (
                      <div className="schedule-detail-item">
                        <RiTimeLine className="detail-icon" />
                        <span>{timeRange}</span>
                      </div>
                    )}

                    {typeLower === 'online' ? (
                      <>
                        <div className="schedule-detail-item">
                          <RiMapPinLine className="detail-icon" />
                          <span>Virtual Event - Accessible Worldwide</span>
                          {/* {variant?.link && (
                            <button
                              onClick={() => openIframeModal(variant.link)}
                              className="schedule-link ms-2"
                              type="button"
                            >
                              Watch Live
                            </button>
                          )} */}
                        </div>
                      </>
                    ) : (
                      address && (
                        <div className="schedule-detail-item">
                          <RiMapPinLine className="detail-icon" />
                          <span>{address}</span>
                        </div>
                      )
                    )}

                    {variant?.organizer && (
                      <div className="schedule-detail-item">
                        <RiUser3Line className="detail-icon" />
                        <span>Organized by {variant.organizer}</span>
                      </div>
                    )}
                  </div>

                  <div className="schedule-actions">
                    {typeLower === 'offline' &&
                      !isPastEvent &&
                      (variant?.latitude || variant?.placeId) && (
                        <Button
                          className="btn-directions btn-secondary"
                          size="sm"
                          outline
                          onClick={() => {
                            const { latitude, longitude, placeId } = variant;
                            if (!latitude || !longitude) {
                              alert('Location coordinates not available');
                              return;
                            }
                            const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

                            window.open(url, '_blank', 'noreferrer');
                          }}
                        >
                          Get Directions{' '}
                          <HiOutlineArrowNarrowRight className="ms-1" />
                        </Button>
                      )}

                    {typeLower === 'online' && variant?.isUpcoming && (
                      <button
                        className="sidebar-action-btn calendar btn-primary bg-danger border-danger no-hover"
                        type="button"
                        onClick={() => openIframeModal(variant.link)}>
                        <HiOutlineVideoCamera className="me-1" />
                        Watch Live
                      </button>
                    )}

                    {variant?.isUpcoming && (
                      <div
                        className="calendar-dropdown-wrapper"
                        ref={calendarDropdownRef}
                      >
                        <button
                          className="sidebar-action-btn calendar btn-primary"
                          type="button"
                          onClick={() =>
                            setCalendarOpenIndex(
                              calendarOpenIndex === index ? null : index
                            )
                          }
                        >
                          <RiCalendarScheduleLine className="me-1" />
                          Add To Calendar
                        </button>

                        {calendarOpenIndex === index && (
                          <ul className="sidebar-calendar-dropdown">
                            <li
                              onClick={() =>
                                handleCalendarSelect('google', variant)
                              }
                            >
                              Google Calendar
                            </li>
                            <li
                              onClick={() =>
                                handleCalendarSelect('yahoo', variant)
                              }
                            >
                              Yahoo
                            </li>
                            <li
                              onClick={() =>
                                handleCalendarSelect('outlook', variant)
                              }
                            >
                              Outlook
                            </li>
                            <li
                              onClick={() =>
                                handleCalendarSelect('ical', variant)
                              }
                            >
                              iCal
                            </li>
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EventScheduleSection;
