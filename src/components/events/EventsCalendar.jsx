'use client';

import { useState, useMemo, useEffect } from 'react';
import { Row, Col } from 'reactstrap';
import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';
import EventsCalendarModal from './EventsCalendarModal';
import EventsCalendarSidebar from './EventsCalendarSidebar';

const EventsCalendar = ({ events, activeTab, selectedCategories }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Month names
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Filter events based on active filters
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesTab = activeTab === 'all' || event.status === activeTab;
      const matchesCategories =
        selectedCategories.length === 0 ||
        selectedCategories.includes(event.category);
      return matchesTab && matchesCategories;
    });
  }, [events, activeTab, selectedCategories]);

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Create events map by date
  const eventsByDate = useMemo(() => {
    const map = new Map();
    filteredEvents.forEach((event) => {
      if (event.startDate) {
        const startDate = new Date(event.startDate);
        const endDate = event.endDate ? new Date(event.endDate) : startDate;

        // Add event to all dates in range
        const currentDateIter = new Date(startDate);
        while (currentDateIter <= endDate) {
          const dateKey = `${currentDateIter.getFullYear()}-${currentDateIter.getMonth()}-${currentDateIter.getDate()}`;
          if (!map.has(dateKey)) {
            map.set(dateKey, []);
          }
          map.get(dateKey).push(event);
          currentDateIter.setDate(currentDateIter.getDate() + 1);
        }
      }
    });
    return map;
  }, [filteredEvents]);

  // Get events for a specific date
  const getEventsForDate = (year, month, day) => {
    const dateKey = `${year}-${month}-${day}`;
    return eventsByDate.get(dateKey) || [];
  };

  // Check if date has events
  const hasEvents = (year, month, day) => {
    return getEventsForDate(year, month, day).length > 0;
  };

  // Check if date is today
  const isToday = (year, month, day) => {
    return (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      day === today.getDate()
    );
  };

  // Check if date is in the past
  const isPast = (year, month, day) => {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Navigate to previous/next year
  const goToPrevYear = () => {
    setCurrentDate(new Date(currentYear - 1, currentMonth, 1));
  };

  const goToNextYear = () => {
    setCurrentDate(new Date(currentYear + 1, currentMonth, 1));
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = [];

    // Previous month days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const month = currentMonth === 0 ? 11 : currentMonth - 1;
      const year = currentMonth === 0 ? currentYear - 1 : currentYear;
      days.push({
        day,
        month,
        year,
        isCurrentMonth: false,
        isPrevMonth: true,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
        isPrevMonth: false,
      });
    }

    // Next month days to fill the grid
    const remainingDays = 35 - days.length; // 5 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const month = currentMonth === 11 ? 0 : currentMonth + 1;
      const year = currentMonth === 11 ? currentYear + 1 : currentYear;
      days.push({
        day,
        month,
        year,
        isCurrentMonth: false,
        isPrevMonth: false,
      });
    }

    return days;
  }, [
    currentMonth,
    currentYear,
    firstDayOfMonth,
    daysInMonth,
    daysInPrevMonth,
  ]);

  // Navigate to previous month
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Handle date click
  const handleDateClick = (dateInfo) => {
    const clickedDate = new Date(dateInfo.year, dateInfo.month, dateInfo.day);
    setSelectedDate(clickedDate);

    // Only open modal on mobile
    if (isMobile) {
      setShowModal(true);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Get CSS classes for a date cell
  const getDateClasses = (dateInfo) => {
    const classes = ['calendar-day', 'clickable'];
    const hasEventsForDate = hasEvents(
      dateInfo.year,
      dateInfo.month,
      dateInfo.day
    );

    if (!dateInfo.isCurrentMonth) {
      classes.push('other-month');
    }

    if (isToday(dateInfo.year, dateInfo.month, dateInfo.day)) {
      classes.push('today');
    }

    if (isPast(dateInfo.year, dateInfo.month, dateInfo.day)) {
      classes.push('past');
    }

    if (hasEventsForDate) {
      classes.push('has-events');
    }

    return classes.join(' ');
  };

  // Get category color for event
  const getCategoryColor = (category) => {
    const colors = {
      conference: '#0da487',
      workshop: '#0da487',
      seminar: '#0da487',
      networking: '#0da487',
      webinar: '#0da487',
      meetup: '#0da487',
      training: '#0da487',
      hackathon: '#0da487',
    };
    return colors[category] || '#0da487';
  };

  return (
    <div className="events-calendar-wrapper sidebar-open">
      <Row>
        <Col xs={12} md={7}>
          <div className="events-calendar">
            {/* Calendar Header */}
            <div className="calendar-header">
              <div className="calendar-year-nav">
                <button
                  className="nav-button year-nav-btn"
                  onClick={goToPrevYear}
                  aria-label="Previous year"
                >
                  <RiArrowLeftSLine size={16} />
                  <RiArrowLeftSLine size={16} className="chevron-overlap" />
                </button>
                <span className="year-display">{currentYear}</span>
                <button
                  className="nav-button year-nav-btn"
                  onClick={goToNextYear}
                  aria-label="Next year"
                >
                  <RiArrowRightSLine size={16} className="chevron-overlap" />
                  <RiArrowRightSLine size={16} />
                </button>
              </div>

              <div className="calendar-month-nav">
                <button
                  className="nav-button nav-prev"
                  onClick={goToPrevMonth}
                  aria-label="Previous month"
                >
                  <RiArrowLeftSLine size={20} />
                </button>

                <div className="calendar-title">
                  <h2>
                    {monthNames[currentMonth]} {currentYear}
                  </h2>
                </div>

                <button
                  className="nav-button nav-next"
                  onClick={goToNextMonth}
                  aria-label="Next month"
                >
                  <RiArrowRightSLine size={20} />
                </button>
              </div>

              <button className="today-button" onClick={goToToday}>
                Today
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="calendar-grid">
              {/* Day names header */}
              <div className="calendar-days-header">
                {dayNames.map((day, index) => (
                  <div key={index} className="calendar-day-name">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="calendar-days">
                {calendarDays.map((dateInfo, index) => {
                  const eventsForDate = getEventsForDate(
                    dateInfo.year,
                    dateInfo.month,
                    dateInfo.day
                  );
                  const isSelectedDate =
                    selectedDate &&
                    selectedDate.getDate() === dateInfo.day &&
                    selectedDate.getMonth() === dateInfo.month &&
                    selectedDate.getFullYear() === dateInfo.year;

                  return (
                    <div
                      key={index}
                      className={`${getDateClasses(dateInfo)} ${isSelectedDate ? 'selected' : ''}`}
                      onClick={() => handleDateClick(dateInfo)}
                    >
                      <span className="day-number">{dateInfo.day}</span>
                      {eventsForDate.length > 0 && (
                        <div className="date-events-dots">
                          {eventsForDate.slice(0, 1).map((event, idx) => (
                            <span
                              key={idx}
                              className="event-dot"
                              style={{
                                backgroundColor: getCategoryColor(
                                  event.categoryName
                                ),
                              }}
                              title={event.title}
                            ></span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Col>

        {/* Event Sidebar - Desktop Only */}
        {!isMobile && (
          <Col md={5} lg={5}>
            <EventsCalendarSidebar
              selectedDate={selectedDate}
              events={
                selectedDate
                  ? getEventsForDate(
                      selectedDate.getFullYear(),
                      selectedDate.getMonth(),
                      selectedDate.getDate()
                    )
                  : []
              }
            />
          </Col>
        )}
      </Row>

      {/* Events Modal - Mobile Only */}
      {isMobile && (
        <EventsCalendarModal
          isOpen={showModal}
          toggle={handleCloseModal}
          selectedDate={selectedDate}
          events={
            selectedDate
              ? getEventsForDate(
                  selectedDate.getFullYear(),
                  selectedDate.getMonth(),
                  selectedDate.getDate()
                )
              : []
          }
        />
      )}
    </div>
  );
};

export default EventsCalendar;
