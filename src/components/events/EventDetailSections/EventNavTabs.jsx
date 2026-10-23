'use client';

import { useState, useEffect } from 'react';

const EventNavTabs = ({ activeTab, onTabClick, eventData }) => {
  const [isSticky, setIsSticky] = useState(false);

  const tabs = [
    eventData?.event?.description
      ? { id: 'about', label: 'About' }
      : { id: 'about', label: 'About' },
    eventData?.variants && eventData.variants.length > 0
      ? { id: 'schedule', label: 'Schedule' }
      : { id: 'schedule', label: 'Schedule' },
    eventData?.images && eventData.images.length > 0
      ? { id: 'gallery', label: 'Gallery' }
      : { id: 'gallery', label: 'Gallery' },
    eventData?.videos && eventData.videos.length > 0
      ? { id: 'videos', label: 'Videos' }
      : { id: 'videos', label: 'Videos' },
  ].filter(Boolean);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (tabs.length === 0) return null;

  return (
    <div className={`event-nav-tabs-wrapper px-0 ${isSticky ? 'sticky' : ''}`}>
      <div className="container-fluid-lg">
        <nav className="event-nav-tabs">
          <ul className="nav-tabs-list">
            {tabs.map((tab) => (
              <li key={tab.id} className="nav-tab-item">
                <button
                  className={`nav-tab-link ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => onTabClick(tab.id)}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default EventNavTabs;
