'use client';

import { useMemo } from 'react';
import { Row, Col } from 'reactstrap';
import HerbCard from './HerbCard';
import HerbCardSkeleton from './HerbCardSkeleton';
import HerbsEmptyState from './HerbsEmptyState';
import Pagination from '@/components/common/Pagination';

const HerbsGrid = ({
  herbs = [],
  searchQuery = '',
  activeTab = 'all',
  selectedCategories = [],
  isLoading = false,
  total = 0,
  perPage = 12,
}) => {
  const filteredHerbs = useMemo(() => {
    // Always use herbs from the main API, not search bar suggestions
    return herbs;
  }, [herbs]);

  // Show loading skeletons
  if (isLoading) {
    const skeletonCount = 8;
    return (
      <div className={`herbs-grid-container herbs-grid-container--grid`}>
        <Row className="g-3 g-md-4">
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <Col
              key={`skeleton-${index}`}
              xs={6}
              sm={4}
              md={4}
              lg={3}
            >
              <HerbCardSkeleton />
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  // Show empty state
  if (filteredHerbs.length === 0) {
    return <HerbsEmptyState searchQuery={searchQuery} />;
  }

  return (
    <div className={`herbs-grid-container herbs-grid-container--grid`}>
      <Row className="g-3 g-md-4">
        {filteredHerbs.map((herb) => (
          <Col
            key={herb.id}
            xs={6}
            sm={4}
            md={4}
            lg={3}
          >
            <HerbCard herb={herb} />
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

export default HerbsGrid;
