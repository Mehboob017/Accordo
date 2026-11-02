'use client';

import { useEffect, useRef, useState } from 'react';
import { RiMapPin2Line } from 'react-icons/ri';
import HeaderLocationModal from './HeaderLocationModal';

const HeaderLocation = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const triggerRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user_delivery_location') || 'Vashi, Navi Mumbai, 400069';
    }
    return 'Vashi, Navi Mumbai, 400069';
  });

  // Auto-open modal on first visit (once per session)
  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('location_popup_shown');
    if (!alreadyShown) {
      const timer = setTimeout(() => {
        setIsModalOpen(true);
        sessionStorage.setItem('location_popup_shown', 'true');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleUseCurrentLocation = () => {
    // UI only — integration will be done later
    const loc = 'Vashi, Navi Mumbai, 400069';
    setSelectedLocation(loc);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_delivery_location', loc);
    }
    setIsModalOpen(false);
  };

  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_delivery_location', loc);
    }
    setIsModalOpen(false);
  };

  const handleTypeManually = () => {
    // UI only — integration will be done later
  };

  const displayText = selectedLocation || 'Vashi, Navi Mumbai, 400069';

  return (
    <div className="header-location-wrapper">
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        className={`header-location-trigger ${isModalOpen ? 'is-active' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={isModalOpen}
        aria-label="Select delivery location"
        onClick={() => setIsModalOpen(true)}
      >
        <span className="header-location-pin-icon">
          <RiMapPin2Line />
        </span>
        <span className="header-location-text">
          <span className="header-location-label">Deliver To</span>
          <span className="header-location-value" title={displayText}>
            {displayText}
          </span>
        </span>
      </button>

      {/* Location Modal */}
      <HeaderLocationModal
        modal={isModalOpen}
        setModal={setIsModalOpen}
        triggerRef={triggerRef}
        onUseCurrentLocation={handleUseCurrentLocation}
        onTypeManually={handleTypeManually}
        onSelectLocation={handleSelectLocation}
      />
    </div>
  );
};

export default HeaderLocation;
