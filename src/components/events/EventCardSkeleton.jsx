'use client';

const EventCardSkeleton = ({ viewMode = 'grid' }) => {
  if (viewMode === 'list') {
    return (
      <div className="event-card event-card--list event-card--skeleton">
        <div className="event-card__image-container skeleton-shimmer"></div>
        <div className="event-card__content">
          <div className="event-card__header">
            <div className="skeleton-title" style={{ width: '50%' }}></div>
          </div>
          <div className="skeleton-box skeleton-description-line"></div>
          <div className="skeleton-box skeleton-description-line" style={{ width: '80%' }}></div>
          <div className="event-card__meta" style={{ marginTop: 'auto' }}>
            <div className="skeleton-box skeleton-meta-item"></div>
            <div className="skeleton-box skeleton-meta-item"></div>
            <div className="skeleton-box skeleton-meta-item"></div>
          </div>
          <div className="skeleton-box skeleton-button"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="event-card event-card--grid event-card--skeleton">
      <div className="event-card__image-container skeleton-shimmer"></div>
      <div className="event-card__content">
        <div className="skeleton-badge"></div>
        <div className="skeleton-title"></div>
        <div className="skeleton-title" style={{ width: '80%', marginBottom: '12px' }}></div>
        <div className="skeleton-box skeleton-description-line"></div>
        <div className="skeleton-box skeleton-description-line" style={{ width: '90%', marginBottom: '12px' }}></div>
        <div className="event-card__meta" style={{ marginTop: 'auto' }}>
          <div className="skeleton-box skeleton-meta-item"></div>
          <div className="skeleton-box skeleton-meta-item"></div>
          <div className="skeleton-box skeleton-meta-item"></div>
        </div>
        <div className="skeleton-box skeleton-button"></div>
      </div>
    </div>
  );
};

export default EventCardSkeleton;
