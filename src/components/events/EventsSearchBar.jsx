'use client';

import { Fragment, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { RiSearchLine, RiCloseLine, RiTimeLine, RiCalendarLine, RiMapPinLine } from 'react-icons/ri';
import { Input } from 'reactstrap';
import useDebounce from '@/utils/hooks/useDebounce';
import { useEventSuggestions } from '@/utils/hooks/useEventSuggestions';

const STORAGE_KEY = 'recent_event_searches';
const MAX_RECENT_SEARCHES = 5;
const DEBOUNCE_DELAY = 500;
const PLACEHOLDER_ROTATE_DELAY = 2400;
const PLACEHOLDER_WORDS = [
  'Technology Summit',
  'Networking Meetup',
  'Training Program',
  'Bengaluru',
  'March 2026',
];

/**
 * Fuzzy matching function for events search
 */
const fuzzyMatch = (text, query) => {
  if (!query) return { matches: false, indices: [] };

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Check for substring match
  const index = lowerText.indexOf(lowerQuery);
  if (index !== -1) {
    return {
      matches: true,
      indices: [[index, index + query.length - 1]],
    };
  }

  // Fuzzy match - characters appear in order
  let queryIndex = 0;
  const indices = [];

  for (let i = 0; i < text.length && queryIndex < lowerQuery.length; i++) {
    if (lowerText[i] === lowerQuery[queryIndex]) {
      indices.push([i, i]);
      queryIndex++;
    }
  }

  if (queryIndex === lowerQuery.length) {
    // Merge consecutive indices
    const mergedIndices = [];
    for (const [start, end] of indices) {
      const last = mergedIndices[mergedIndices.length - 1];
      if (last && last[1] === start - 1) {
        last[1] = end;
      } else {
        mergedIndices.push([start, end]);
      }
    }
    return { matches: true, indices: mergedIndices };
  }

  return { matches: false, indices: [] };
};

/**
 * Highlights matched text while preserving all whitespace
 */
const HighlightedText = ({ text, indices }) => {
  if (!indices.length) return text;

  const parts = [];
  let lastIndex = 0;

  indices.forEach(([start, end], i) => {
    // Add text before the match (preserving spaces)
    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }
    
    // Add the highlighted match (preserving spaces within)
    parts.push(
      <span key={`match-${i}`} className="search-highlight">
        {text.slice(start, end + 1)}
      </span>
    );
    lastIndex = end + 1;
  });

  // Add remaining text after the last match (preserving spaces)
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
};

const EventsSearchBar = ({ onSearchResults }) => {
  const [searchValue, setSearchValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderTick, setPlaceholderTick] = useState(0);

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  const debouncedSearchValue = useDebounce(searchValue, DEBOUNCE_DELAY);

  // Fetch event suggestions from API
  const { data: apiEvents = [], isLoading } = useEventSuggestions(debouncedSearchValue);

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

  // Process API events with fuzzy matching for highlighting
  const processedEvents = useMemo(() => {
    if (!debouncedSearchValue.trim() || !apiEvents.length) return [];

    return apiEvents.map((event) => {
      // Apply fuzzy matching to highlight matched portions
      const titleMatch = fuzzyMatch(event.title, debouncedSearchValue);
      const categoryText = event.eventCategory?.name || '';
      const categoryMatch = fuzzyMatch(categoryText, debouncedSearchValue);

      // Determine which field matched best
      let matchType = 'title';
      let indices = titleMatch.indices;

      if (categoryMatch.matches && categoryMatch.indices.length > 0) {
        matchType = 'category';
        indices = categoryMatch.indices;
      }

      return {
        id: event.uid,
        title: event.title,
        slug: event.slug,
        category: categoryText,
        categoryUid: event.eventCategoryUid,
        matchType,
        indices,
      };
    });
  }, [apiEvents, debouncedSearchValue]);

  // Trigger search - called explicitly on Enter or suggestion click
  const triggerSearch = useCallback((query) => {
    if (onSearchResults) {
      const resultsToSend = query.trim() ? processedEvents : [];
      onSearchResults(query, resultsToSend);
    }
  }, [onSearchResults, processedEvents]);

  const recentSuggestions = useMemo(
    () =>
      recentSearches.map((term, index) => ({
        id: `recent-${index}`,
        title: term,
        isRecent: true,
        indices: [],
      })),
    [recentSearches]
  );

  const suggestions = useMemo(() => {
    if (!searchValue.trim()) {
      return recentSuggestions;
    }
    return processedEvents;
  }, [searchValue, recentSuggestions, processedEvents]);

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

  // Handle selection
  const handleSelect = useCallback(
    (item) => {
      const value = item.title;
      setSearchValue(value);
      saveToRecentSearches(value);
      triggerSearch(value);
      setIsOpen(false);
      setFocusedIndex(-1);
      inputRef.current?.blur();
    },
    [saveToRecentSearches, triggerSearch]
  );

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      items[focusedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen && e.key !== 'Escape') {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && suggestions[focusedIndex]) {
          handleSelect(suggestions[focusedIndex]);
        } else if (searchValue.trim()) {
          saveToRecentSearches(searchValue);
          triggerSearch(searchValue);
          setIsOpen(false);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
        break;

      case 'Tab':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;

      default:
        break;
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setSearchValue(e.target.value);
    setFocusedIndex(-1);
    if (!isOpen) setIsOpen(true);
  };

  // Handle focus
  const handleFocus = () => {
    setIsOpen(true);
  };

  // Clear search
  const handleClear = () => {
    setSearchValue('');
    setFocusedIndex(-1);
    triggerSearch('');
    setIsOpen(true);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const handleClearRecents = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing recent searches:', e);
    }
  };

  const showDropdown = isOpen && (suggestions.length > 0 || (searchValue.trim() && processedEvents.length === 0) || isLoading);
  const showNoResults = searchValue.trim() && debouncedSearchValue.trim() && processedEvents.length === 0 && !isLoading;

  const dynamicPlaceholder = `Search for ${PLACEHOLDER_WORDS[placeholderIndex]}`;
  const inputPlaceholder = searchValue ? dynamicPlaceholder : '';

  return (
    <div
      className="events-search-container"
      ref={containerRef}
      role="combobox"
      aria-expanded={showDropdown}
      aria-haspopup="listbox"
      aria-owns="events-search-suggestions"
    >
      <div className={`events-searchbar-box ${isOpen ? 'is-open' : ''}`}>
        <div className="search-input-wrapper">
          <RiSearchLine className="search-icon" aria-hidden="true" />

          <Input
            innerRef={inputRef}
            id="events-search"
            type="text"
            className="search-input"
            value={searchValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={inputPlaceholder}
            autoComplete="off"
            aria-label="Search events"
            aria-autocomplete="list"
            aria-controls="events-search-suggestions"
            aria-activedescendant={
              focusedIndex >= 0 ? `event-suggestion-${focusedIndex}` : undefined
            }
          />

          {!searchValue && (
            <div className="animated-placeholder" aria-hidden="true">
              <span className="placeholder-static">Search for</span>
              <span key={placeholderTick} className="placeholder-dynamic">
                "{PLACEHOLDER_WORDS[placeholderIndex]}"
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
        </div>

        {showDropdown && (
          <ul
            id="events-search-suggestions"
            ref={listRef}
            className="suggestions-dropdown"
            role="listbox"
            aria-label={
              searchValue.trim() ? 'Event search results' : 'Recent searches'
            }
          >
            {isLoading && searchValue.trim() ? (
              <li className="loading-results no-results" role="presentation">
                <div className="loading-spinner"></div>
                <span>Searching events...</span>
              </li>
            ) : showNoResults ? (
              <li className="no-results" role="presentation">
                No events found for "{debouncedSearchValue}"
              </li>
            ) : (
              suggestions.map((item, index) => {
                const showRecentHeader =
                  !searchValue.trim() && item.isRecent && index === 0;

                return (
                  <Fragment key={item.id}>
                    {showRecentHeader && (
                      <li className="suggestions-header" role="presentation">
                        <RiTimeLine aria-hidden="true" />
                        <span>Recent Searches</span>
                        {/* clear recents */}
                        <button
                          type="button"
                          className="clear-recents-button"
                          aria-label="Clear recent searches"
                          onClick={handleClearRecents}
                        >
                          <RiCloseLine />
                        </button>
                      </li>
                    )}

                    <li
                      id={`event-suggestion-${index}`}
                      role="option"
                      aria-selected={focusedIndex === index}
                      className={`suggestion-item ${
                        focusedIndex === index ? 'is-focused' : ''
                      } ${item.isRecent ? 'is-recent' : ''}`}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setFocusedIndex(index)}
                    >
                      {item.isRecent ? (
                        <>
                          <RiTimeLine
                            className="recent-icon"
                            aria-hidden="true"
                          />
                          <span className="suggestion-text">{item.title}</span>
                        </>
                      ) : (
                        <>
                          <div className="suggestion-icon">
                            {item.matchType === 'category' ? (
                              <RiCalendarLine aria-hidden="true" />
                            ) : (
                              <RiSearchLine aria-hidden="true" />
                            )}
                          </div>
                          <div className="suggestion-content">
                            <span className="suggestion-text">
                              <HighlightedText
                                text={item.title}
                                indices={
                                  item.matchType === 'title' ? item.indices : []
                                }
                              />
                            </span>
                            {item.category && (
                              <span className="suggestion-meta">
                                <HighlightedText
                                  text={item.category}
                                  indices={
                                    item.matchType === 'category'
                                      ? item.indices
                                      : []
                                  }
                                />
                              </span>
                            )}
                          </div>
                          {/* {item.category && (
                            <span className="suggestion-category">{item.category}</span>
                          )} */}
                        </>
                      )}
                    </li>
                  </Fragment>
                );
              })
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EventsSearchBar;
