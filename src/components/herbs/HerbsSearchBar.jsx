'use client';

import { Fragment, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { RiSearchLine, RiCloseLine, RiTimeLine, RiLeafLine } from 'react-icons/ri';
import { Input } from 'reactstrap';
import useDebounce from '@/utils/hooks/useDebounce';

const STORAGE_KEY = 'recent_herb_searches';
const MAX_RECENT_SEARCHES = 5;
const DEBOUNCE_DELAY = 500;
const PLACEHOLDER_ROTATE_DELAY = 2400;
const PLACEHOLDER_WORDS = [
  'Ashwagandha',
  'Turmeric',
  'Tulsi',
  'Immune Support',
  'Digestive Health',
];

/**
 * Fuzzy matching function for herbs search
 */
const fuzzyMatch = (text, query) => {
  if (!query || !text) return { matches: false, indices: [] };

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
  if (!indices || !indices.length) return text;

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

const HerbsSearchBar = ({ herbs = [], onSearchResults }) => {
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

  // Calculate match score for sorting
  const calculateScore = (indices, matchType) => {
    if (!indices || !indices.length) return 0;
    
    let score = 0;
    
    // Base score: number of matched characters
    const matchedChars = indices.reduce((sum, [start, end]) => sum + (end - start + 1), 0);
    score += matchedChars * 10;
    
    // Bonus for consecutive matches (substring matches)
    const avgMatchLength = matchedChars / indices.length;
    score += avgMatchLength * 5;
    
    // Bonus for match at the beginning
    if (indices[0][0] === 0) {
      score += 20;
    }
    
    // Priority boost based on field type
    if (matchType === 'name') score += 15;
    else if (matchType === 'scientificName') score += 12;
    else if (matchType === 'category') score += 10;
    else if (matchType === 'benefits') score += 5;
    else if (matchType === 'description') score += 3;
    
    return score;
  };

  // Filter herbs based on search query
  const filteredHerbs = useMemo(() => {
    if (!debouncedSearchValue.trim()) return [];

    return herbs
      .map((herb) => {
        // Search in name
        const nameMatch = fuzzyMatch(herb.name || '', debouncedSearchValue);
        
        // Search in scientific name
        const scientificNameMatch = fuzzyMatch(herb.scientificName || '', debouncedSearchValue);
        
        // Search in category (check both category and categoryName)
        const categoryText = herb.categoryName || herb.category || '';
        const categoryMatch = fuzzyMatch(categoryText, debouncedSearchValue);
        
        // Search in description
        const descMatch = fuzzyMatch(herb.shortDescription || herb.description || '', debouncedSearchValue);
        
        // Search in benefits (join array to string if needed)
        const benefitsText = Array.isArray(herb.benefits) 
          ? herb.benefits.join(' ') 
          : (herb.benefits || '');
        const benefitsMatch = fuzzyMatch(benefitsText, debouncedSearchValue);

        if (nameMatch.matches) {
          return { 
            ...herb, 
            matchType: 'name', 
            indices: nameMatch.indices, 
            searchField: herb.name,
            score: calculateScore(nameMatch.indices, 'name')
          };
        } else if (scientificNameMatch.matches) {
          return { 
            ...herb, 
            matchType: 'scientificName', 
            indices: scientificNameMatch.indices, 
            searchField: herb.scientificName,
            score: calculateScore(scientificNameMatch.indices, 'scientificName')
          };
        } else if (categoryMatch.matches) {
          return { 
            ...herb, 
            matchType: 'category', 
            indices: categoryMatch.indices, 
            searchField: categoryText,
            score: calculateScore(categoryMatch.indices, 'category')
          };
        } else if (benefitsMatch.matches) {
          return { 
            ...herb, 
            matchType: 'benefits', 
            indices: benefitsMatch.indices, 
            searchField: benefitsText,
            score: calculateScore(benefitsMatch.indices, 'benefits')
          };
        } else if (descMatch.matches) {
          return { 
            ...herb, 
            matchType: 'description', 
            indices: descMatch.indices, 
            searchField: herb.shortDescription || herb.description,
            score: calculateScore(descMatch.indices, 'description')
          };
        }

        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score) // Sort by score, highest first
      .slice(0, 10);
  }, [debouncedSearchValue, herbs]);

  // Trigger search - called explicitly on Enter or suggestion click
  const triggerSearch = useCallback((query) => {
    if (onSearchResults) {
      const resultsToSend = query.trim() ? filteredHerbs : [];
      onSearchResults(query, resultsToSend);
    }
  }, [onSearchResults, filteredHerbs]);

  const recentSuggestions = useMemo(
    () =>
      recentSearches.map((term, index) => ({
        id: `recent-${index}`,
        name: term,
        isRecent: true,
        indices: [],
      })),
    [recentSearches]
  );

  const suggestions = useMemo(() => {
    if (!searchValue.trim()) {
      return recentSuggestions;
    }
    return filteredHerbs;
  }, [searchValue, recentSuggestions, filteredHerbs]);

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
      const value = item.name;
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

  const showDropdown = isOpen && (suggestions.length > 0 || (searchValue.trim() && filteredHerbs.length === 0));
  const showNoResults = searchValue.trim() && debouncedSearchValue.trim() && filteredHerbs.length === 0;

  const dynamicPlaceholder = `Search for ${PLACEHOLDER_WORDS[placeholderIndex]}`;
  const inputPlaceholder = searchValue ? dynamicPlaceholder : '';

  return (
    <div
      className="herbs-search-container"
      ref={containerRef}
      role="combobox"
      aria-expanded={showDropdown}
      aria-haspopup="listbox"
      aria-owns="herbs-search-suggestions"
    >
      <div className={`herbs-searchbar-box ${isOpen ? 'is-open' : ''}`}>
        <div className="search-input-wrapper">
          <RiSearchLine className="search-icon" aria-hidden="true" />

          <Input
            innerRef={inputRef}
            id="herbs-search"
            type="text"
            className="search-input"
            value={searchValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={inputPlaceholder}
            autoComplete="off"
            aria-label="Search herbs"
            aria-autocomplete="list"
            aria-controls="herbs-search-suggestions"
            aria-activedescendant={
              focusedIndex >= 0 ? `herb-suggestion-${focusedIndex}` : undefined
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
            id="herbs-search-suggestions"
            ref={listRef}
            className="suggestions-dropdown"
            role="listbox"
            aria-label={
              searchValue.trim() ? 'Herb search results' : 'Recent searches'
            }
          >
            {showNoResults ? (
              <li className="no-results" role="presentation">
                No herbs found for "{debouncedSearchValue}"
              </li>
            ) : (
              suggestions.map((item, index) => {
                const showRecentHeader = !searchValue.trim() && item.isRecent && index === 0;

                return (
                  <Fragment key={item.id}>
                    {showRecentHeader && (
                      <li className="suggestions-header" role="presentation">
                        <RiTimeLine aria-hidden="true" />
                        <span>Recent Searches</span>
                      </li>
                    )}

                    <li
                      id={`herb-suggestion-${index}`}
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
                          <RiTimeLine className="recent-icon" aria-hidden="true" />
                          <span className="suggestion-text">{item.name}</span>
                        </>
                      ) : (
                        <>
                          <div className="suggestion-icon">
                            <RiLeafLine aria-hidden="true" />
                          </div>
                          <div className="suggestion-content">
                            <span className="suggestion-text">
                              <HighlightedText
                                text={item.name}
                                indices={item.matchType === 'name' ? item.indices : []}
                              />
                            </span>
                            {/* <span className="suggestion-meta">
                              {item.matchType === 'scientificName' && item.scientificName && (
                                <HighlightedText text={item.scientificName} indices={item.indices} />
                              )}
                              {item.matchType === 'category' && item.categoryName && (
                                <HighlightedText text={item.categoryName} indices={item.indices} />
                              )}
                              {item.matchType === 'benefits' && item.searchField && (
                                <span className="benefit-match">
                                  <HighlightedText text={item.searchField.substring(0, 50)} indices={item.indices} />
                                  {item.searchField.length > 50 && '...'}
                                </span>
                              )}
                            </span> */}
                          </div>
                          {item.categoryName && (
                            <span className="suggestion-category">{item.categoryName}</span>
                          )}
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

export default HerbsSearchBar;
