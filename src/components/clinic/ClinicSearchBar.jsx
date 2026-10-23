'use client';

import { useEffect, useState, useRef } from 'react';
import { RiSearchLine, RiCloseLine, RiTimeLine } from 'react-icons/ri';
import { Input } from 'reactstrap';
import useDebounce from '@/utils/hooks/useDebounce';

const STORAGE_KEY = 'recent_clinic_searches';
const MAX_RECENT_SEARCHES = 5;
const DEBOUNCE_DELAY = 500;
const PLACEHOLDER_ROTATE_DELAY = 2400;
const PLACEHOLDER_WORDS = ['specialization', 'name', 'city', 'pincode'];

const ClinicSearchBar = ({ onSearch, initialValue = '' }) => {
  const [searchValue, setSearchValue] = useState(initialValue);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecent, setShowRecent] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const debouncedSearchValue = useDebounce(searchValue, DEBOUNCE_DELAY);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading recent searches:', e);
    }
  }, []);

  // Rotate placeholder words
  useEffect(() => {
    const intervalId = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_WORDS.length);
    }, PLACEHOLDER_ROTATE_DELAY);

    return () => clearInterval(intervalId);
  }, []);

  // Trigger search when debounced value changes
  useEffect(() => {
    if (debouncedSearchValue !== initialValue) {
      onSearch(debouncedSearchValue);
      
      // Save to recent searches if not empty
      if (debouncedSearchValue.trim()) {
        saveToRecentSearches(debouncedSearchValue.trim());
      }
    }
  }, [debouncedSearchValue]);

  // Save search to recent searches
  const saveToRecentSearches = (query) => {
    try {
      const updated = [
        query,
        ...recentSearches.filter((s) => s !== query),
      ].slice(0, MAX_RECENT_SEARCHES);
      
      setRecentSearches(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving recent search:', e);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    setShowRecent(value.length === 0);
  };

  // Handle input focus
  const handleFocus = () => {
    if (searchValue.length === 0 && recentSearches.length > 0) {
      setShowRecent(true);
    }
  };

  // Handle input blur
  const handleBlur = () => {
    setTimeout(() => setShowRecent(false), 200);
  };

  // Handle recent search click
  const handleRecentClick = (query) => {
    setSearchValue(query);
    onSearch(query);
    setShowRecent(false);
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(STORAGE_KEY);
    setShowRecent(false);
  };

  // Clear input
  const handleClear = () => {
    setSearchValue('');
    onSearch('');
    inputRef.current?.focus();
  };

  // Handle search submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      onSearch(searchValue.trim());
      saveToRecentSearches(searchValue.trim());
      setShowRecent(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowRecent(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasRecent = recentSearches.length > 0 && showRecent;

  return (
    <div className="clinic-search-container" ref={containerRef}>
      <form onSubmit={handleSubmit}>
        <div className={`clinic-searchbar-box ${showRecent ? 'is-open' : ''}`}>
          <div className="search-input-wrapper">
            <div className="location-icon">
              <RiSearchLine />
            </div>
            <Input
              ref={inputRef}
              type="text"
              className="search-input"
              value={searchValue}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              autoComplete="off"
              aria-label="Search for clinics"
            />

            {!searchValue && (
              <div className="animated-placeholder" aria-hidden="true">
                <span className="placeholder-static">Search for</span>
                <span className="placeholder-dynamic">
                  "{PLACEHOLDER_WORDS[placeholderIndex]}"
                </span>
              </div>
            )}

            {searchValue && (
              <button
                className="clear-button"
                onClick={handleClear}
                aria-label="Clear search"
                type="button"
              >
                <RiCloseLine />
              </button>
            )}
          </div>

          {/* Recent Searches Dropdown */}
          {hasRecent && (
            <div className="search-results-dropdown">
              <div className="search-section">
                <div className="search-section-header">
                  <span>Recent Searches</span>
                  <button
                    className="clear-recent-btn"
                    onClick={clearRecentSearches}
                    type="button"
                  >
                    <RiCloseLine />
                  </button>
                </div>
                <div className="recent-searches-list">
                  {recentSearches.map((query, index) => (
                    <div
                      key={`recent-${index}`}
                      className="search-result-item recent-item"
                      onClick={() => handleRecentClick(query)}
                      role="button"
                      tabIndex={0}
                    >
                      <RiTimeLine className="recent-icon" />
                      <span className="recent-text">{query}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default ClinicSearchBar;
