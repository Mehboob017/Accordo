'use client';

import {
  Fragment,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { RiSearchLine, RiCloseLine, RiTimeLine } from 'react-icons/ri';
import { Input } from 'reactstrap';
import useDebounce from '@/utils/hooks/useDebounce';

const DEBOUNCE_DELAY = 500;
const PLACEHOLDER_ROTATE_DELAY = 2400;

/**
 * Fuzzy matching function for search
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
    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }

    parts.push(
      <span key={`match-${i}`} className="search-highlight">
        {text.slice(start, end + 1)}
      </span>
    );
    lastIndex = end + 1;
  });

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
};

/**
 * Common SearchBar Component
 *
 * @param {Object} props
 * @param {Function} props.onSearch - Callback when search is triggered (query, results)
 * @param {Function} props.fetchResults - Function to fetch results (query) => Promise<results>
 * @param {Function} props.transformResults - Transform API results to common format
 * @param {Function} props.renderResultItem - Custom render for each result item
 * @param {string} props.storageKey - LocalStorage key for recent searches
 * @param {Array<string>} props.placeholderWords - Words to rotate in placeholder
 * @param {string} props.searchLabel - Aria label for search input
 * @param {number} props.maxRecentSearches - Maximum recent searches to store
 * @param {number} props.debounceDelay - Debounce delay in ms
 * @param {boolean} props.enableFuzzyMatch - Enable fuzzy matching
 * @param {boolean} props.autoSearch - Trigger search on debounce vs manual enter
 * @param {Function} props.onSelectItem - Optional callback when user selects an API result (item) - if provided and item has slug, called instead of onSearch
 */
const CommonSearchBar = ({
  onSearch,
  onSelectItem,
  fetchResults,
  transformResults,
  renderResultItem,
  storageKey = 'recent_searches',
  placeholderWords = ['Type here to search...'],
  searchLabel = 'Search',
  maxRecentSearches = 5,
  debounceDelay = DEBOUNCE_DELAY,
  enableFuzzyMatch = true,
  autoSearch = false,
  initialValue = '',
  className = '',
}) => {
  const [searchValue, setSearchValue] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderTick, setPlaceholderTick] = useState(0);
  const [apiResults, setApiResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  // Derive a stable DOM-safe ID slug from the searchLabel so all related
  // ARIA IDs (input, listbox, options) stay in sync with the label prop.
  const searchId = useMemo(
    () => searchLabel.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    [searchLabel]
  );

  const debouncedSearchValue = useDebounce(searchValue, debounceDelay);

  useEffect(() => {
    setSearchValue(initialValue || '');
  }, [initialValue]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading recent searches:', e);
    }
  }, [storageKey]);

  // Rotate placeholder words
  useEffect(() => {
    const intervalId = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholderWords.length);
      setPlaceholderTick((prev) => prev + 1);
    }, PLACEHOLDER_ROTATE_DELAY);

    return () => clearInterval(intervalId);
  }, [placeholderWords.length]);

  // Fetch results when debounced value changes
  useEffect(() => {
    const fetchData = async () => {
      if (!debouncedSearchValue.trim() || !fetchResults) {
        setApiResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await fetchResults(debouncedSearchValue);
        setApiResults(results || []);
        // console.log('Fetched herb suggestions:', results);
      } catch (error) {
        console.error('Error fetching results:', error);
        setApiResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [debouncedSearchValue, fetchResults]);

  // Auto-trigger search if enabled
  useEffect(() => {
    if (autoSearch && debouncedSearchValue !== initialValue) {
      triggerSearch(debouncedSearchValue);
    }
  }, [debouncedSearchValue, autoSearch]);

  // Process API results with fuzzy matching for highlighting
  const processedResults = useMemo(() => {
    if (!debouncedSearchValue.trim() || !apiResults.length) return [];

    const transformed = transformResults
      ? apiResults.map(transformResults)
      : apiResults;

    if (!enableFuzzyMatch) return transformed;

    return transformed.map((item) => {
      // Apply fuzzy matching to searchable fields
      const matches = {};

      if (item.searchableFields) {
        item.searchableFields.forEach((field) => {
          const text = item[field] || '';
          const match = fuzzyMatch(text, debouncedSearchValue);
          if (match.matches) {
            matches[field] = match.indices;
          }
        });
      }

      return {
        ...item,
        highlightMatches: matches,
      };
    });
  }, [apiResults, debouncedSearchValue, transformResults, enableFuzzyMatch]);

  // Trigger search - called explicitly on Enter or suggestion click
  const triggerSearch = useCallback(
    (query) => {
      if (onSearch) {
        const resultsToSend = query.trim() ? processedResults : [];
        onSearch(query, resultsToSend);
      }
    },
    [onSearch, processedResults]
  );

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
    return processedResults;
  }, [searchValue, recentSuggestions, processedResults]);

  // Save to recent searches
  const saveToRecentSearches = useCallback(
    (term) => {
      if (!term.trim()) return;

      setRecentSearches((prev) => {
        const filtered = prev.filter(
          (item) => item.toLowerCase() !== term.toLowerCase()
        );
        const updated = [term, ...filtered].slice(0, maxRecentSearches);

        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (e) {
          console.error('Error saving recent searches:', e);
        }

        return updated;
      });
    },
    [storageKey, maxRecentSearches]
  );

  // Handle selection
  const handleSelect = useCallback(
    (item) => {
      const value = item.title;
      setSearchValue(value);
      saveToRecentSearches(value);

      // If onSelectItem is provided and item has slug (API result), navigate/act on item
      if (onSelectItem && item.slug && !item.isRecent) {
        onSelectItem(item);
        setIsOpen(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
        return;
      }

      if (!autoSearch) {
        triggerSearch(value);
      }

      setIsOpen(false);
      setFocusedIndex(-1);
      inputRef.current?.blur();
    },
    [saveToRecentSearches, triggerSearch, autoSearch, onSelectItem]
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

          if (!autoSearch) {
            triggerSearch(searchValue);
          }

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

    if (!autoSearch) {
      triggerSearch('');
    }

    setIsOpen(true);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const handleClearRecents = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.error('Error clearing recent searches:', e);
    }
  };

  const showDropdown =
    isOpen &&
    (suggestions.length > 0 ||
      (searchValue.trim() && processedResults.length === 0) ||
      isLoading);
  const showNoResults =
    searchValue.trim() &&
    debouncedSearchValue.trim() &&
    processedResults.length === 0 &&
    !isLoading;

  const dynamicPlaceholder = `Search for ${placeholderWords[placeholderIndex]}`;
  const inputPlaceholder = searchValue ? dynamicPlaceholder : '';

  // Default render function for result items
  const defaultRenderResultItem = (item, index) => {
    if (item.isRecent) {
      return (
        <>
          <RiTimeLine className="recent-icon" aria-hidden="true" />
          <span className="suggestion-text">{item.title}</span>
        </>
      );
    }

    return (
      <>
        <div className="suggestion-icon">
          <RiSearchLine aria-hidden="true" />
        </div>
        <div className="suggestion-content">
          <span className="suggestion-text">
            {item.highlightMatches?.title ? (
              <HighlightedText
                text={item.title}
                indices={item.highlightMatches.title}
              />
            ) : (
              item.title
            )}
          </span>
          {item.subtitle && (
            <span className="suggestion-meta">
              {item.highlightMatches?.subtitle ? (
                <HighlightedText
                  text={item.subtitle}
                  indices={item.highlightMatches.subtitle}
                />
              ) : (
                item.subtitle
              )}
            </span>
          )}
        </div>
      </>
    );
  };

  const itemRenderer = renderResultItem || defaultRenderResultItem;

  return (
    <div
      className={`events-search-container ${className}`}
      ref={containerRef}
    >
      <div className={`events-searchbar-box ${isOpen ? 'is-open' : ''}`}>
        <div className="search-input-wrapper">
          <RiSearchLine className="search-icon" aria-hidden="true" />

          <Input
            innerRef={inputRef}
            id={searchId}
            type="text"
            role="combobox"
            className="search-input input-common"
            value={searchValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={inputPlaceholder}
            autoComplete="off"
            aria-label={searchLabel}
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-expanded={showDropdown ? 'true' : 'false'}
            aria-controls={showDropdown ? `${searchId}-suggestions` : undefined}
            aria-activedescendant={
              showDropdown && !isLoading && !showNoResults && focusedIndex >= 0
                ? `${searchId}-option-${focusedIndex}`
                : undefined
            }
          />

          {!searchValue && (
            <div className="animated-placeholder" aria-hidden="true">
              <span className="placeholder-static">Search for</span>
              <span key={placeholderTick} className="placeholder-dynamic">
                "{placeholderWords[placeholderIndex]}"
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
            id={`${searchId}-suggestions`}
            ref={listRef}
            className="suggestions-dropdown"
            role="listbox"
            aria-label={
              searchValue.trim() ? 'Search results' : 'Recent searches'
            }
          >
            {isLoading && searchValue.trim() ? (
              <li className="loading-results no-results" role="presentation">
                <div className="loading-spinner"></div>
                <span>Searching...</span>
              </li>
            ) : showNoResults ? (
              <li className="no-results" role="presentation">
                No results found for "{debouncedSearchValue}"
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
                      id={`${searchId}-option-${index}`}
                      role="option"
                      aria-selected={focusedIndex === index}
                      className={`suggestion-item ${
                        focusedIndex === index ? 'is-focused' : ''
                      } ${item.isRecent ? 'is-recent' : ''}`}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setFocusedIndex(index)}
                    >
                      {itemRenderer(item, index)}
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

export default CommonSearchBar;
