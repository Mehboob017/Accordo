'use client';

import { RiLeafLine } from 'react-icons/ri';

const HerbsEmptyState = ({ searchQuery = '' }) => {
  return (
    <div className="herbs-empty-state">
      <div className="herbs-empty-state__icon">
        <RiLeafLine size={64} />
      </div>
      <h3 className="herbs-empty-state__title">
        {searchQuery ? 'No Herbs Found' : 'No Herbs Available'}
      </h3>
      <p className="herbs-empty-state__description">
        {searchQuery
          ? `We couldn't find any herbs matching "${searchQuery}". Try adjusting your search or filters.`
          : 'There are currently no herbs available. Please check back later.'}
      </p>
    </div>
  );
};

export default HerbsEmptyState;
