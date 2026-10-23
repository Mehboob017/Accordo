'use client';

import { useMemo } from 'react';
import { Row, Col } from 'reactstrap';
import EventCard from './EventCard';
import EventCardSkeleton from './EventCardSkeleton';
import EventsEmptyState from './EventsEmptyState';
import Pagination from '@/components/common/Pagination';

const EventsGrid = ({
  events = [],
  searchResults = [],
  searchQuery = '',
  activeTab = 'all',
  selectedCategories = [],
  viewMode = 'grid',
  isLoading = false,
  total = 0,
  perPage = 12,
}) => {
  const filteredEvents = useMemo(() => {
    if (searchQuery.trim()) {
      return events.length > 0 ? events : [];
    }

    return events;
  }, [events, searchResults, searchQuery]);

  // Show loading skeletons
  if (isLoading) {
    const skeletonCount = viewMode === 'grid' ? 8 : 4;
    return (
      <div
        className={`events-grid-container events-grid-container--${viewMode}`}
      >
        <Row className="g-3 g-md-4">
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <Col
              key={`skeleton-${index}`}
              xs={12}
              sm={viewMode === 'grid' ? 12 : 12}
              md={viewMode === 'grid' ? 6 : 12}
              lg={viewMode === 'grid' ? 4 : 12}
              xl={viewMode === 'grid' ? 3 : 12}
            >
              <EventCardSkeleton viewMode={viewMode} />
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  // Show empty state
  if (filteredEvents.length === 0) {
    return <EventsEmptyState searchQuery={searchQuery} />;
  }

  return (
    <div className={`events-grid-container events-grid-container--${viewMode}`}>
      <Row className="g-3 g-md-4">
        {filteredEvents.map((event) => (
          <Col
            key={event.id}
            xs={12}
            sm={viewMode === 'grid' ? 12 : 12}
            md={viewMode === 'grid' ? 6 : 12}
            lg={viewMode === 'grid' ? 4 : 12}
            xl={viewMode === 'grid' ? 3 : 12}
          >
            <EventCard event={event} viewMode={viewMode} />
          </Col>
        ))}
      </Row>
      {total > perPage && (
        <nav className="custome-pagination mt-4">
          <Pagination total={total} perPage={perPage} />
        </nav>
      )}
    </div>
  );
};

export default EventsGrid;
