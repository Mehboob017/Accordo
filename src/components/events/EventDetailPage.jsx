'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Row, Col, UncontrolledAccordion, AccordionItem, AccordionHeader, AccordionBody } from 'reactstrap';
import EventNavTabs from './EventDetailSections/EventNavTabs';
import EventAboutSection from './EventDetailSections/EventAboutSection';
import EventBannerSection from './EventDetailSections/EventBannerSection';
import EventGallerySection from './EventDetailSections/EventGallerySection';
import EventVideosSection from './EventDetailSections/EventVideosSection';
import EventScheduleSection from './EventDetailSections/EventScheduleSection';
import { RiArrowRightUpLine, RiCalendarScheduleLine, RiShareLine } from 'react-icons/ri';
import { FaArrowRightLong, FaArrowLeftLong } from 'react-icons/fa6';
import { useParams } from 'next/navigation';
import { useEventDetail } from '@/utils/hooks/useEvents';
import Link from 'next/link';
import { EventHeroSection } from './EventDetailSections';
import { MdEventAvailable } from 'react-icons/md';
import { HiOutlineVideoCamera } from 'react-icons/hi';

const EventDetailPage = () => {
  const [activeTab, setActiveTab] = useState('about');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState('');
  const [iframeModalOpen, setIframeModalOpen] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('');
  const aboutRef = useRef(null);
  const galleryRef = useRef(null);
  const videosRef = useRef(null);
  const scheduleRef = useRef(null);
  const calendarDropdownRef = useRef(null);

  const router = useParams();
  const { eventSlug } = router || {};

  const { data: eventDetail, isLoading } = useEventDetail(eventSlug, {
    enabled: !!eventSlug,
  });

  const { data: eventData } = eventDetail || {};

  // Close calendar dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarDropdownRef.current && !calendarDropdownRef.current.contains(e.target)) {
        setCalendarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close iframe modal on Escape key
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && iframeModalOpen) closeIframeModal();
    };
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [iframeModalOpen]);

  // Prevent body scroll when iframe modal is open
  useEffect(() => {
    document.body.style.overflow = iframeModalOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [iframeModalOpen]);

  // Returns true for services that block iframe embedding
  const isNonEmbeddable = (url) => {
    if (!url) return false;
    try {
      const h = new URL(url).hostname.toLowerCase();
      return (
        h.includes('zoom.us') ||
        h.includes('zoom.com') ||
        h.includes('meet.google.com') ||
        h.includes('teams.microsoft.com') ||
        h.includes('teams.live.com')
      );
    } catch { return false; }
  };

  const normalizeEmbedUrl = (url) => {
    if (!url) return url;
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase().replace('www.', '');

      // ── YouTube (regular, live, shorts, /v/) ──────────────────────────────
      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
        let videoId = '';

        if (hostname.includes('youtu.be')) {
          // https://youtu.be/VIDEO_ID
          videoId = urlObj.pathname.split('/').filter(Boolean)[0] || '';
        } else if (urlObj.pathname.includes('/embed/')) {
          // Already an embed URL – return as-is
          return url;
        } else if (urlObj.searchParams.has('v')) {
          // https://youtube.com/watch?v=VIDEO_ID
          videoId = urlObj.searchParams.get('v');
        } else {
          // Handle /live/ID, /shorts/ID, /v/ID
          const pathParts = urlObj.pathname.split('/').filter(Boolean);
          const knownPrefixes = ['live', 'shorts', 'v'];
          const prefixIdx = pathParts.findIndex((p) =>
            knownPrefixes.includes(p.toLowerCase())
          );
          if (prefixIdx !== -1 && pathParts[prefixIdx + 1]) {
            videoId = pathParts[prefixIdx + 1].split('?')[0];
          }
        }

        if (videoId) {
          // Use enablejsapi so the player API works; origin locks the domain
          const origin =
            typeof window !== 'undefined'
              ? encodeURIComponent(window.location.origin)
              : '';
          return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&enablejsapi=1${origin ? `&origin=${origin}` : ''}`;
        }
        // If no videoId found, fall through and return original
        return url;
      }

      // ── Vimeo ─────────────────────────────────────────────────────────────
      if (hostname.includes('vimeo.com')) {
        if (urlObj.pathname.includes('/video/')) return url; // already embed
        const videoId = urlObj.pathname.split('/').filter(Boolean).pop();
        if (videoId) return `https://player.vimeo.com/video/${videoId}`;
      }

      // ── Twitch ────────────────────────────────────────────────────────────
      if (hostname.includes('twitch.tv')) {
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        if (pathParts.length > 0) {
          const parentDomain =
            typeof window !== 'undefined' ? window.location.hostname : 'localhost';
          if (pathParts[0] === 'videos' && pathParts[1]) {
            return `https://player.twitch.tv/?video=${pathParts[1]}&parent=${parentDomain}`;
          }
          return `https://player.twitch.tv/?channel=${pathParts[0]}&parent=${parentDomain}`;
        }
      }

      // ── Dailymotion ───────────────────────────────────────────────────────
      if (hostname.includes('dailymotion.com') || hostname.includes('dai.ly')) {
        const videoId = urlObj.pathname.split('/').filter(Boolean).pop();
        if (videoId) return `https://www.dailymotion.com/embed/video/${videoId}`;
      }

      return url;
    } catch (error) {
      console.error('Error normalizing URL:', error);
      return url;
    }
  };

  const openIframeModal = useCallback((url) => {
    // Services that block iframes open in a new tab instead
    if (isNonEmbeddable(url)) {
      window.open(url, '_blank', 'noreferrer');
      return;
    }
    setIframeUrl(normalizeEmbedUrl(url));
    setIframeModalOpen(true);
  }, []);

  const closeIframeModal = useCallback(() => {
    setIframeModalOpen(false);
    setIframeUrl('');
  }, []);

  // Calendar functions – use first variant for sidebar Add to Calendar
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

  const handleCalendarSelect = (type) => {
    setCalendarOpen(false);
    if (type === 'ical') downloadICS();
    else if (type === 'google') window.open(googleUrl(), '_blank');
    else if (type === 'outlook') window.open(outlookUrl(), '_blank');
    else if (type === 'yahoo') window.open(yahooUrl(), '_blank');
  };

  const handleShareEvent = async () => {
    const shareData = {
      title: eventData?.event?.title || 'Event',
      text: eventData?.event?.shortDescription || '',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Event link copied to clipboard!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        // Fallback: copy to clipboard
        try {
          await navigator.clipboard.writeText(window.location.href);
          alert('Event link copied to clipboard!');
        } catch (clipboardError) {
          console.error('Clipboard error:', clipboardError);
        }
      }
    }
  };

  // Scroll to section when tab changes
  const scrollToSection = (sectionRef) => {
    if (sectionRef.current) {
      const offset = 100; // Offset for fixed header
      const elementPosition = sectionRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);

    switch (tab) {
      case 'about':
        scrollToSection(aboutRef);
        break;
      case 'gallery':
        scrollToSection(galleryRef);
        break;
      case 'videos':
        scrollToSection(videosRef);
        break;
      case 'schedule':
        scrollToSection(scheduleRef);
        break;
      default:
        break;
    }
  };

  // Update active tab based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { ref: aboutRef, name: 'about' },
        { ref: scheduleRef, name: 'schedule' },
        { ref: galleryRef, name: 'gallery' },
        { ref: videosRef, name: 'videos' },
      ];

      const offset = 150;

      // Find the last section whose top has scrolled past the offset line.
      // This always yields exactly one winner — even when scrolling back up.
      let activeSection = null;
      for (const section of sections) {
        if (section.ref.current) {
          const rect = section.ref.current.getBoundingClientRect();
          if (rect.top <= offset) {
            activeSection = section.name;
          }
        }
      }

      if (activeSection) {
        setActiveTab((prev) => (prev !== activeSection ? activeSection : prev));
      }
    };

    // Throttle scroll events for better performance
    let timeoutId;
    const throttledHandleScroll = () => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        handleScroll();
        timeoutId = null;
      }, 100);
    };

    window.addEventListener('scroll', throttledHandleScroll);
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const tags = (eventData.event?.tag || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  const categoryList = eventData.eventCategories || [];

  // Determine which accordions should be open by default
  const defaultOpenAccordions = [];
  if (categoryList.length > 0) defaultOpenAccordions.push('1');
  if (tags.length > 0) defaultOpenAccordions.push('2');

  if (!eventDetail) return null;

  return (
    <div className="event-detail-page">
      <EventHeroSection
        eventData={eventData}
        onReadMoreClick={() => scrollToSection(aboutRef)}
        openIframeModal={openIframeModal}
      />

      <EventNavTabs
        activeTab={activeTab}
        onTabClick={handleTabClick}
        eventData={eventData}
      />

      <div className="event-detail-content">
        <div className="container-fluid-lg">
          <Row className="g-4">
            <Col lg={8}>
              <div className="event-detail-main">
                {eventData.event?.coverImage && (
                  <div>
                    <EventBannerSection eventData={eventData} />
                  </div>
                )}

                {/* {eventData.event?.description && ( */}
                <div id="about-event" ref={aboutRef}>
                  <EventAboutSection eventData={eventData} />
                </div>
                {/* )} */}

                {/* {eventData?.variants.length > 0 && ( */}
                <div ref={scheduleRef}>
                  <EventScheduleSection eventData={eventData} openIframeModal={openIframeModal} />
                </div>
                {/* )} */}

                {/* {eventData?.images.length > 0 && ( */}
                <div ref={galleryRef}>
                  <EventGallerySection eventData={eventData} />
                </div>
                {/* )} */}

                {/* {eventData?.videos.length > 0 && ( */}
                <div ref={videosRef}>
                  <EventVideosSection eventData={eventData} />
                </div>
                {/* )} */}
              </div>
            </Col>
            <Col lg={4}>
              <aside className="event-detail-sidebar">
                <div className="event-sidebar-card">
                  <h3 className="sidebar-title">Quick Actions</h3>
                  <div className="sidebar-actions">
                    {eventData?.variants?.[0]?.type === "Online" && (
                      <button
                        className="sidebar-action-btn btn-primary bg-danger border-danger no-hover"
                        type="button"
                        onClick={() => openIframeModal(eventData?.variants?.[0]?.link)}
                      >
                        <HiOutlineVideoCamera className="btn-icon" />
                        Watch Live
                        <RiArrowRightUpLine className="btn-icon" />
                      </button>
                    )}
                    {eventData?.variants?.some((v) => v.isUpcoming) && (
                      <div
                        className="calendar-dropdown-wrapper"
                        ref={calendarDropdownRef}
                      >
                        <button
                          className="sidebar-action-btn calendar btn-primary"
                          type="button"
                          onClick={() => setCalendarOpen(!calendarOpen)}
                        >
                          <RiCalendarScheduleLine className="me-1" />
                          Add To Calendar
                        </button>
                        {calendarOpen && (
                          <ul className="sidebar-calendar-dropdown">
                            <li onClick={() => handleCalendarSelect('google')}>
                              Google Calendar
                            </li>
                            <li onClick={() => handleCalendarSelect('yahoo')}>
                              Yahoo
                            </li>
                            <li onClick={() => handleCalendarSelect('outlook')}>
                              Outlook
                            </li>
                            <li onClick={() => handleCalendarSelect('ical')}>
                              iCal
                            </li>
                          </ul>
                        )}
                      </div>
                    )}
                    <button
                      className="sidebar-action-btn btn-secondary"
                      type="button"
                      onClick={handleShareEvent}
                    >
                      <RiShareLine className="me-1 stroke-w-1" />
                      Share Event
                    </button>
                    {/* <button className="sidebar-action-btn" type="button">
                      Contact Organizer
                    </button> */}
                  </div>
                </div>

                {/* <div className="event-sidebar-card">
                  <UncontrolledAccordion
                    className="left-accordion-box"
                    open={accordionOpen}
                    toggle={(id) => {
                      if (accordionOpen === id) {
                        setAccordionOpen('');
                      } else {
                        setAccordionOpen(id);
                      }
                    }}
                    defaultOpen={defaultOpenAccordions}
                  >
                    {categoryList.length > 0 && (
                      <AccordionItem>
                        <AccordionHeader targetId="1">Event Categories</AccordionHeader>
                        <AccordionBody accordionId="1" className="p-0">
                          <div className="category-list-box">
                            <ul>
                              {categoryList.map((category) => (
                                <li key={category.uid}>
                                  <Link
                                    prefetch={false}
                                    href={`/events?categories=${category.name}`}
                                  >
                                    <div className="category-name">
                                      <h5>{category.name}</h5>
                                      <span>({category._count?.events || 0})</span>
                                    </div>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </AccordionBody>
                      </AccordionItem>
                    )}
                  </UncontrolledAccordion>
                </div> */}

                {categoryList.length > 0 && (
                  <div className="event-sidebar-card">
                    <UncontrolledAccordion
                      className="left-accordion-box"
                      open={accordionOpen}
                      toggle={(id) => {
                        if (accordionOpen === id) {
                          setAccordionOpen('');
                        } else {
                          setAccordionOpen(id);
                        }
                      }}
                      defaultOpen={defaultOpenAccordions}
                    >
                      <AccordionItem>
                        <AccordionHeader targetId="1">Event Categories</AccordionHeader>
                        <AccordionBody accordionId="1" className="p-0">
                          <div className="category-list-box">
                            <ul>
                              {categoryList.map((category) => (
                                <li key={category.uid}>
                                  <Link
                                    prefetch={false}
                                    href={`/events?categories=${category.slug}`}
                                  >
                                    <div className="category-name">
                                      <h5>{category.name}</h5>
                                      <span>({category._count?.events || 0})</span>
                                    </div>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </AccordionBody>
                      </AccordionItem>
                    </UncontrolledAccordion>
                  </div>
                )}

                {tags.length > 0 && (
                  <div className="event-sidebar-card">
                    <UncontrolledAccordion
                      className="left-accordion-box"
                      open={accordionOpen}
                      toggle={(id) => {
                        if (accordionOpen === id) {
                          setAccordionOpen('');
                        } else {
                          setAccordionOpen(id);
                        }
                      }}
                      defaultOpen={defaultOpenAccordions}
                    >
                      <AccordionItem>
                        <AccordionHeader targetId="2">Tags</AccordionHeader>
                        <AccordionBody accordionId="2" className="pt-0">
                          <div className="product-tags-box">
                            <ul>
                              {tags.map((tag, idx) => (
                                <li key={idx}>
                                  <span>{tag}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </AccordionBody>
                      </AccordionItem>
                    </UncontrolledAccordion>
                  </div>
                )}
              </aside>
            </Col>
            {/* Event Navigation Pagination */}
            <Col xs={12}>
              <div className="event-navigation-wrapper">
                <div className="event-navigation">
                  {eventData?.previousEvent ? (
                    <a
                      href={`/events/${eventData.previousEvent.slug}`}
                      className="event-nav-button prev-event"
                    >
                      <span className="nav-arrow">
                        <FaArrowLeftLong />
                      </span>
                      <div className="nav-content">
                        <span className="nav-label">Previous Event</span>
                        <span className="nav-title">
                          {eventData.previousEvent.title}
                        </span>
                      </div>
                    </a>
                  ) : (
                    <div
                      aria-disabled="true"
                      className="event-nav-button prev-event"
                    >
                      <span className="nav-arrow">
                        <FaArrowLeftLong />
                      </span>
                      <div className="nav-content">
                        <span className="nav-label">Previous Event</span>
                        {/* <span className="nav-title"></span> */}
                      </div>
                    </div>
                  )}

                  {eventData?.nextEvent ? (
                    <a
                      href={`/events/${eventData.nextEvent.slug}`}
                      className="event-nav-button next-event"
                    >
                      <div className="nav-content">
                        <span className="nav-label">Next Event</span>
                        <span className="nav-title">
                          {eventData.nextEvent.title}
                        </span>
                      </div>
                      <span className="nav-arrow">
                        <FaArrowRightLong />
                      </span>
                    </a>
                  ) : (
                    <div
                      aria-disabled="true"
                      className="event-nav-button next-event"
                    >
                      <div className="nav-content">
                        <span className="nav-label">Next Event</span>
                        {/* <span className="nav-title"></span> */}
                      </div>
                      <span className="nav-arrow">
                        <FaArrowRightLong />
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Iframe Modal – rendered once at the top level */}
      {/* onClick={closeIframeModal} */}
      {iframeModalOpen && (
        <div className="iframe-modal-overlay" >
          <div
            className="iframe-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="iframe-modal-close"
              onClick={(e) => {
                e.stopPropagation();
                closeIframeModal();
              }}
              type="button"
              aria-label="Close"
            >
              ×
            </button>
            <div className="iframe-wrapper">
              <iframe
                src={iframeUrl}
                title="Event Link"
                className="event-iframe"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; microphone; camera; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailPage;
