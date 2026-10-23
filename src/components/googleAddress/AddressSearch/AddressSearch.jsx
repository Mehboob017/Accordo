'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './AddressSearch.module.scss';
import AddressSearchDropdown from './AddressSearchDropdown';
import useDebounce from '@/utils/hooks/useDebounce';
import { useGooglePlacesPredictions } from '@/utils/hooks/useGooglePlacesPredictions';
import { parseGooglePlace, useGooglePlaces, useGoogleMapsStatus, MapsStatus } from '@/utils/helpers';
import { GoogleMapsProvider } from '@/helper/mapsContext/googleMapsProvider';

const AddressSearch = ({
  value,
  placeholder = 'Search address',
  variant = 'outlined',
  size = 'md',
  country = 'IN',
  disabled,
  className,
  onSelect,
}) => {
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(true);

  const debouncedQuery = useDebounce(query, 500);

  const { results, loading, error } = useGooglePlacesPredictions(
    debouncedQuery,
    country
  );

  const mapsStatus = useGoogleMapsStatus();
  const mapsUnavailable = mapsStatus !== MapsStatus.READY;

  const handleSelect = (placeId) => {
    // console.log('[AddressSearch.handleSelect] Place selected:', placeId);

    if (!window.google?.maps?.places) {
      console.error('[AddressSearch.handleSelect] ❌ Google Maps not loaded');
      return;
    }

    // console.log('[AddressSearch.handleSelect] Creating PlacesService...');
    const service = new google.maps.places.PlacesService(
      document.createElement('div')
    );

    // console.log('[AddressSearch.handleSelect] Fetching place details...');
    service.getDetails({ placeId }, (place) => {
      // console.log('[AddressSearch.handleSelect] Place details received:', place);

      if (place) {
        // console.log('[AddressSearch.handleSelect] Parsing place details...', place);
        const parsedAddress = parseGooglePlace(place);
        // console.log('[AddressSearch.handleSelect] Setting query to:', parsedAddress);
        setQuery(parsedAddress.mainText || parsedAddress.googleAddress || '');
        // console.log('[AddressSearch.handleSelect] Calling onSelect with:', parsedAddress);
        onSelect(parsedAddress);
      } else {
        console.warn('[AddressSearch.handleSelect] ⚠️ No place data received');
      }
    });
  };

  useGooglePlaces({
    inputRef,
    country,
    onSelect,
  });

  useEffect(() => {
    setQuery(value || '');
    // console.log(results);
  }, [value]);

  // Close on outside click
   useEffect(() => {
     const handleClickOutside = (e) => {
       if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
         setShowDropdown(false);
         setSelectedIndex(-1);
       }
     };

     document.addEventListener('mousedown', handleClickOutside);
     return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);

  return (
    <div
      ref={wrapperRef}
      className={`${styles.addressSearch} ${styles[`variant-${variant}`]} ${styles[`size-${size}`]} ${className}`}
    >
      {mapsUnavailable ? (
        <small className="text-danger fs-6 d-block mb-2">
          ⚠️ Address auto-suggest is currently unavailable. Please enter your
          address manually in the fields below.
        </small>
      ) : (
        <>
          <label className={styles.label}>Search Address</label>
          <input
            ref={inputRef}
            value={query}
            placeholder={placeholder}
            disabled={disabled}
            className={`input-common ${styles.input}`}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => {
              setTimeout(() => setShowDropdown(false), 120);
            }}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
              setSelectedIndex(-1);
            }}
            onKeyDown={(e) => {
              const validResults = results && results.length > 0;

              if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (validResults) {
                  setSelectedIndex((prev) =>
                    prev < results.length - 1 ? prev + 1 : 0
                  );
                }
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (validResults) {
                  setSelectedIndex((prev) =>
                    prev > 0 ? prev - 1 : results.length - 1
                  );
                }
              } else if (e.key === 'Enter') {
                e.preventDefault();
                if (validResults && selectedIndex >= 0) {
                  handleSelect(results[selectedIndex].place_id);
                  setShowDropdown(false);
                }
              } else if (e.key === 'Escape') {
                setShowDropdown(false);
                setSelectedIndex(-1);
              }
            }}
            autoComplete="off"
          />
          {showDropdown && (
            <AddressSearchDropdown
              results={results}
              error={error}
              onSelect={(placeId) => {
                handleSelect(placeId);
                setShowDropdown(false);
                setSelectedIndex(-1);
              }}
              selectedIndex={selectedIndex}
            />
          )}
        </>
      )}
    </div>
  );
};

export default function AddressSearchWithProvider(props) {
  return (
    <GoogleMapsProvider>
      <AddressSearch {...props} />
    </GoogleMapsProvider>
  );
}
