'use client';

const EventsEmptyState = ({ searchQuery = '' }) => {
  return (
    <div className="events-empty-state">
      <div className="empty-state-content">
        <svg 
          className="empty-state-icon" 
          width="120" 
          height="120" 
          viewBox="0 0 120 120" 
          fill="none"
        >
          <circle cx="60" cy="60" r="50" fill="#f8f9fa" stroke="#e9ecef" strokeWidth="2"/>
          <path 
            d="M40 45C40 42.2386 42.2386 40 45 40H75C77.7614 40 80 42.2386 80 45V75C80 77.7614 77.7614 80 75 80H45C42.2386 80 40 77.7614 40 75V45Z" 
            fill="white" 
            stroke="#dee2e6" 
            strokeWidth="2"
          />
          <line x1="40" y1="50" x2="80" y2="50" stroke="#dee2e6" strokeWidth="2"/>
          <circle cx="50" cy="45" r="2" fill="#adb5bd"/>
          <circle cx="56" cy="45" r="2" fill="#adb5bd"/>
          <circle cx="62" cy="45" r="2" fill="#adb5bd"/>
          <rect x="48" y="58" width="10" height="10" rx="1" fill="#e9ecef"/>
          <rect x="62" y="58" width="10" height="10" rx="1" fill="#e9ecef"/>
          <rect x="48" y="70" width="10" height="10" rx="1" fill="#e9ecef"/>
        </svg>
        <h3 className="empty-state-title">No Events Found</h3>
        <p className="empty-state-message">
          {searchQuery.trim() 
            ? `We couldn't find any events matching "${searchQuery}"`
            : 'No events match your current filters'}
        </p>
      </div>
    </div>
  );
};

export default EventsEmptyState;
