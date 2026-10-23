'use client';

const HerbCardSkeleton = ({ viewMode = 'grid' }) => {
  
  return (
    <div className="herb-card herb-card--grid herb-card--skeleton">
      <div className="herb-card__image-container">
        <div className="skeleton skeleton-image" />
      </div>
      <div className="herb-card__content">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-scientific-name" />
        <div className="skeleton skeleton-description" />
        <div className="skeleton skeleton-description" />
        <div className="skeleton skeleton-benefits" />
      </div>
    </div>
  );
};

export default HerbCardSkeleton;
