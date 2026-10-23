'use client';

import {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  RiSearchLine,
  RiCloseLine,
  RiTimeLine,
} from 'react-icons/ri';
import { Input, Button } from 'reactstrap';
import useDebounce from '@/utils/hooks/useDebounce';

const STORAGE_KEY = 'recent_store_searches';
const MAX_RECENT_SEARCHES = 5;
const DEBOUNCE_DELAY = 1000;
const PLACEHOLDER_ROTATE_DELAY = 2400;
const PLACEHOLDER_WORDS = [
  'store name',
  'city',
  'pincode',
];

const StoreSearchBar = ({ initialQuery = '', onSearch }) => {
  const [searchValue, setSearchValue] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderTick, setPlaceholderTick] = useState(0);

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  // Debounce search value
  const debouncedSearchValue = useDebounce(searchValue, DEBOUNCE_DELAY);

  // Update search value when initialQuery changes
  useEffect(() => {
    setSearchValue(initialQuery);
  }, [initialQuery]);

  // Trigger search when debounced value changes
  useEffect(() => {
    if (onSearch && debouncedSearchValue !== initialQuery) {
      onSearch(debouncedSearchValue);
    }
  }, [debouncedSearchValue, onSearch, initialQuery]);

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
      setPlaceholderTick((prev) => prev + 1);
    }, PLACEHOLDER_ROTATE_DELAY);

    return () => clearInterval(intervalId);
  }, []);

  // Recent suggestions for display
  const recentSuggestions = useMemo(
    () =>
      recentSearches.map((term, index) => ({
        id: `recent-${index}`,
        name: term,
        isRecent: true,
      })),
    [recentSearches]
  );

  const clearRecentSearches = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setRecentSearches([]);
    } catch (e) {
      console.error('Error clearing recent searches:', e);
    }
  }, []);

  // Save to recent searches
  const saveToRecentSearches = useCallback((term) => {
    if (!term.trim()) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (item) => item.toLowerCase() !== term.toLowerCase()
      );
      const updated = [term, ...filtered].slice(0, MAX_RECENT_SEARCHES);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving recent searches:', e);
      }

      return updated;
    });
  }, []);

  // Handle selection from recent searches
  const handleSelect = useCallback(
    (item) => {
      const value = item.name || '';
      setSearchValue(value);
      saveToRecentSearches(value);
      setIsOpen(false);
      inputRef.current?.blur();
    },
    [saveToRecentSearches]
  );

  // Handle search button click
  const handleSearchClick = useCallback(() => {
    if (searchValue.trim()) {
      saveToRecentSearches(searchValue);
      setIsOpen(false);
      inputRef.current?.blur();
    }
  }, [searchValue, saveToRecentSearches]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen && e.key !== 'Escape') {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (searchValue.trim()) {
          saveToRecentSearches(searchValue);
          setIsOpen(false);
          inputRef.current?.blur();
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;

      case 'Tab':
        setIsOpen(false);
        break;

      default:
        break;
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setSearchValue(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  // Handle focus
  const handleFocus = () => {
    setIsOpen(true);
  };

  // Clear search
  const handleClear = () => {
    setSearchValue('');
    setIsOpen(true);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const showDropdown = isOpen && recentSuggestions.length > 0 && !searchValue.trim();

  const dynamicPlaceholder = `Search for city or pincode...`;
  const inputPlaceholder = searchValue ? dynamicPlaceholder : '';

  return (
    <div
      className="store-search-container"
      ref={containerRef}
      role="combobox"
      aria-expanded={showDropdown}
      aria-haspopup="listbox"
      aria-owns="store-search-suggestions"
    >
      <div className={`store-searchbar-box ${isOpen ? 'is-open' : ''}`}>
        <div className="search-input-wrapper">
          <RiSearchLine
            className="search-icon location-icon"
            aria-hidden="true"
          />

          <Input
            innerRef={inputRef}
            id="store-search"
            type="text"
            className="search-input"
            value={searchValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={inputPlaceholder}
            autoComplete="off"
            aria-label="Search stores"
            aria-autocomplete="list"
            aria-controls="store-search-suggestions"
          />

          {!searchValue && (
            <div className="animated-placeholder" aria-hidden="true">
              <span
                key={placeholderTick}
                className="placeholder-static"
              >
                Search for {" "}
                <span className="placeholder-fade-in">
                  "{PLACEHOLDER_WORDS[placeholderIndex]}"
                </span>
              </span>
            </div>
          )}

          {searchValue && (
            <button
              type="button"
              className="clear-button"
              aria-label="Clear search"
              onMouseDown={(e) => e.preventDefault()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClear();
                  inputRef.current?.focus();
                }
                if (e.key === 'Escape' && searchValue) {
                  handleClear();
                }
              }}
              onClick={handleClear}
            >
              <RiCloseLine />
            </button>
          )}

          <Button
            className="search-button"
            color="primary"
            onClick={handleSearchClick}
          >
            <RiSearchLine />
          </Button>
        </div>

        {showDropdown && (
          <ul
            id="store-search-suggestions"
            ref={listRef}
            className="suggestions-dropdown"
            role="listbox"
            aria-label="Recent searches"
          >
            <li className="suggestions-header" role="presentation">
              <RiTimeLine aria-hidden="true" />
              <span>Recent Searches</span>
              <button
                className="clear-recent-btn"
                onClick={clearRecentSearches}
                aria-label="Clear recent searches"
              >
                <RiCloseLine />
              </button>
            </li>

            {recentSuggestions.map((item, index) => (
              <li
                key={item.id}
                id={`store-suggestion-${index}`}
                role="option"
                className="suggestion-item is-recent"
                onClick={() => handleSelect(item)}
              >
                <RiTimeLine className="recent-icon" aria-hidden="true" />
                <span className="suggestion-text">{item.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StoreSearchBar;