'use client';

import React, { useEffect, useState } from 'react';
import { Modal, ModalBody } from 'reactstrap';
import {
  RiMapPin2Line,
  RiMapPinLine,
  RiCloseLine,
  RiSearchLine,
  RiFocus3Line,
  RiArrowLeftLine,
} from 'react-icons/ri';

// Sample mock locations matching the design
const SAMPLE_LOCATIONS = [
  {
    id: 1,
    title: 'HYPLAP IT SOLUTION PVT LTD, Sector 30A, Vashi, Navi Mumbai, Maharashtra, India',
    subtitle: 'Sector 30A-Vashi',
  },
  {
    id: 2,
    title: 'Hyplast Industries, off Link Road, Bhagat Singh II, Goregaon West, Mumbai, Maharashtra, India',
    subtitle: 'off Link Road-Bhagat Singh II',
  },
  {
    id: 3,
    title: 'HyPlus Technologies Laptop Desktop Mobilephone Service Center, Sreekandapuram, Keralam, India',
    subtitle: 'Sreekandapuram-Keralam',
  },
  {
    id: 4,
    title: 'HYPLEX QUALITY DOOR, Pazhayangadi, Keralam, India',
    subtitle: 'Pazhayangadi-Keralam',
  },
  {
    id: 5,
    title: 'HyPlus Technology India Private Limited, opposite Sai Chowk Road, Pimple Saudagar, Pune, Maharashtra, India',
    subtitle: 'Pimple Saudagar-Pune',
  },
];

const HeaderLocationModal = ({
  modal,
  setModal,
  triggerRef,
  onUseCurrentLocation,
  onTypeManually,
  onSelectLocation,
}) => {
  const [view, setView] = useState('prompt'); // 'prompt' | 'manual'
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogStyle, setDialogStyle] = useState({});

  // Reset to prompt view and clear query when modal closes
  useEffect(() => {
    if (!modal) {
      const timer = setTimeout(() => {
        setView('prompt');
        setSearchQuery('');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [modal]);

  // Position calculation for prompt view (anchored directly under header trigger)
  const calculatePosition = () => {
    if (triggerRef?.current && typeof window !== 'undefined') {
      const rect = triggerRef.current.getBoundingClientRect();
      const isRtl =
        document.dir === 'rtl' || document.documentElement.dir === 'rtl';
      const modalWidth = 400;

      if (window.innerWidth > 576) {
        const top = rect.bottom + 12;

        if (isRtl) {
          const right = Math.max(16, window.innerWidth - rect.right);
          return {
            position: 'absolute',
            top: `${top}px`,
            right: `${right}px`,
            left: 'auto',
            margin: 0,
          };
        } else {
          let left = rect.left;
          if (left + modalWidth > window.innerWidth - 16) {
            left = Math.max(16, window.innerWidth - modalWidth - 16);
          }
          return {
            position: 'absolute',
            top: `${top}px`,
            left: `${left}px`,
            right: 'auto',
            margin: 0,
          };
        }
      } else {
        return { margin: '1rem auto' };
      }
    }
    return {};
  };

  useEffect(() => {
    if (!modal || view !== 'prompt') return;

    const updatePosition = () => {
      setDialogStyle(calculatePosition());
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [modal, view, triggerRef]);

  const toggle = () => setModal((prev) => !prev);

  const handleUseCurrentLocation = () => {
    if (onUseCurrentLocation) {
      onUseCurrentLocation();
    }
    setModal(false);
  };

  const handleTypeManuallyClick = () => {
    if (onTypeManually) {
      onTypeManually();
    }
    setView('manual');
  };

  const handleSelectLocationItem = (item) => {
    if (onSelectLocation) {
      onSelectLocation(item.subtitle || item.title);
    }
    setModal(false);
  };

  const hasSearchQuery = searchQuery.trim().length > 0;

  // Filter locations by search query
  const filteredLocations = SAMPLE_LOCATIONS.filter((loc) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      loc.title.toLowerCase().includes(q) ||
      loc.subtitle.toLowerCase().includes(q)
    );
  });

  const isManualView = view === 'manual';

  return (
    <Modal
      isOpen={modal}
      toggle={toggle}
      centered={isManualView}
      className={`theme-modal header-location-modal ${isManualView
          ? 'header-location-modal--manual'
          : 'header-location-modal--prompt'
        }`}
      style={isManualView ? {} : dialogStyle}
    >
      <ModalBody
        className={`header-location-modal__body ${isManualView ? 'header-location-modal__body--manual' : ''
          }`}
      >
        {/* ─── VIEW 1: Initial Prompt Popover ─── */}
        {!isManualView ? (
          <>
            {/* Close button */}
            <button
              type="button"
              className="header-location-modal__close"
              aria-label="Close location modal"
              onClick={() => setModal(false)}
            >
              <RiCloseLine />
            </button>

            {/* Icon + message */}
            <div className="header-location-modal__content">
              <div className="header-location-modal__icon-wrap">
                <RiMapPin2Line className="header-location-modal__pin" />
              </div>
              <p className="header-location-modal__message">
                To deliver as quickly as possible, we would like your current location
              </p>
            </div>

            {/* Actions */}
            <div className="header-location-modal__actions">
              <button
                type="button"
                className="header-location-modal__btn header-location-modal__btn--outline"
                onClick={handleTypeManuallyClick}
              >
                Type Manually
              </button>
              <button
                type="button"
                className="header-location-modal__btn header-location-modal__btn--primary"
                onClick={handleUseCurrentLocation}
              >
                Use Current Location
              </button>
            </div>
          </>
        ) : (
          /* ─── VIEW 2: Manual Location Search Modal ─── */
          <div className="location-manual-view">
            {/* Header: Back + Title + Close Button */}
            <div className="location-manual-view__header">
              <div className="location-manual-view__title-group">
                {/* <button
                  type="button"
                  className="location-manual-view__back-btn"
                  onClick={() => {
                    setView('prompt');
                    setSearchQuery('');
                  }}
                  aria-label="Back to prompt"
                  title="Back"
                >
                  <RiArrowLeftLine />
                </button> */}
                <h4 className="location-manual-view__title">YOUR LOCATION</h4>
              </div>
              <button
                type="button"
                className="location-manual-view__close-btn"
                aria-label="Close"
                onClick={() => setModal(false)}
              >
                <RiCloseLine />
              </button>
            </div>

            {/* Search Input Box (styled like header search bar) */}
            <div className="location-search-box">
              <RiSearchLine
                className="location-search-box__search-icon"
                aria-hidden="true"
              />
              <input
                type="text"
                className="location-search-box__input"
                placeholder='Search for "Address, area or landmark"...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {hasSearchQuery && (
                <button
                  type="button"
                  className="location-search-box__clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  title="Clear"
                >
                  <RiCloseLine />
                </button>
              )}
            </div>

            {/* FIRST VIEW: Only Current Location Enable option (no suggestions) */}
            {!hasSearchQuery && (
              <div className="current-location-row">
                <div className="current-location-row__left">
                  <span className="current-location-row__icon">
                    <RiFocus3Line />
                  </span>
                  <div className="current-location-row__info">
                    <h6 className="current-location-row__title">Current Location</h6>
                    <p className="current-location-row__subtitle">
                      Enable your current location for better services
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="current-location-row__enable-btn"
                  onClick={handleUseCurrentLocation}
                >
                  ENABLE
                </button>
              </div>
            )}

            {/* SEARCH VIEW: When user types, Current Location is hidden and suggestions are shown */}
            {hasSearchQuery && (
              <div className="location-results-container">
                <ul className="location-results-list">
                  {filteredLocations.map((loc, idx) => (
                    <li
                      key={loc.id}
                      className={`location-results-list__item ${idx === 0 ? 'is-active' : ''
                        }`}
                      onClick={() => handleSelectLocationItem(loc)}
                    >
                      <span className="location-results-list__icon">
                        <RiMapPinLine />
                      </span>
                      <div className="location-results-list__details">
                        <p className="location-results-list__title">{loc.title}</p>
                        <span className="location-results-list__subtitle">
                          {loc.subtitle}
                        </span>
                      </div>
                    </li>
                  ))}
                  {filteredLocations.length === 0 && (
                    <li className="location-results-list__empty">
                      <p>No locations found matching &ldquo;{searchQuery}&rdquo;</p>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};

export default HeaderLocationModal;
