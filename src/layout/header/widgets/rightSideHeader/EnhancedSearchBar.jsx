'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RiCloseLine, RiSearchLine, RiTimeLine } from 'react-icons/ri';
import { Input } from 'reactstrap';
import useDebounce from '@/utils/hooks/useDebounce';
import { useSearch } from '@/utils/hooks/useSearch';
import SearchDropdown from './SearchDropdown';

const STORAGE_KEY = 'recent_searches';
const MAX_RECENT_SEARCHES = 5;
const DEBOUNCE_DELAY = 750;
const PLACEHOLDER_ROTATE_DELAY = 2400;
const PLACEHOLDER_WORDS = ['Products', 'Categories', 'Blogs', 'Herbs'];
const LISTBOX_ID = 'global-search-listbox';

/** @param {number} index @returns {string} */
const getOptionId = (index) => `search-option-${index}`;

// ── Recent search helpers ─────────────────────────────────────────────────────

const loadRecentSearches = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const persistRecentSearch = (term) => {
  if (!term?.trim()) return null;
  try {
    const prev = loadRecentSearches();
    const deduped = prev.filter(
      (item) => item.toLowerCase() !== term.toLowerCase()
    );
    const updated = [term, ...deduped].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return null;
  }
};

// ── Component ─────────────────────────────────────────────────────────────────

const EnhancedSearchBar = () => {
  const router = useRouter();
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const [searchValue, setSearchValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderTick, setPlaceholderTick] = useState(0);

  const debouncedQuery = useDebounce(searchValue, DEBOUNCE_DELAY);

  // ── Live search ──
  const {
    data: searchResults,
    isLoading,
    isError,
    refetch,
  } = useSearch(debouncedQuery);

  const flatItems = searchResults;
  const totalCount = searchResults.length;

  // ── Bootstrap ──
  useEffect(() => {
    setRecentSearches(loadRecentSearches());
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1200px)');
    const handle = () => setIsMobile(mq.matches);
    handle();
    mq.addEventListener('change', handle);
    return () => mq.removeEventListener('change', handle);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderIndex((p) => (p + 1) % PLACEHOLDER_WORDS.length);
      setPlaceholderTick((t) => t + 1);
    }, PLACEHOLDER_ROTATE_DELAY);
    return () => clearInterval(id);
  }, []);

  // ── Ctrl+K / Cmd+K ──
  useEffect(() => {
    const handle = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isMobile) {
          setIsModalOpen(true);
          setIsOpen(true);
        }
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [isMobile]);

  // ── Outside click ──
  useEffect(() => {
    const handle = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // ── Escape key ──
  useEffect(() => {
    const handle = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
        if (isMobile) setIsModalOpen(false);
      }
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [isOpen, isMobile]);

  // ── Scroll focused option into view ──
  useEffect(() => {
    if (focusedIndex < 0) return;
    document
      .getElementById(getOptionId(focusedIndex))
      ?.scrollIntoView({ block: 'nearest' });
  }, [focusedIndex]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleInputChange = (e) => {
    setSearchValue(e.target.value);
    setFocusedIndex(-1);
    if (!isOpen) setIsOpen(true);
  };

  const handleFocus = () => setIsOpen(true);

  const handleClear = useCallback(() => {
    setSearchValue('');
    setFocusedIndex(-1);
    setIsOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const handleSelect = useCallback(
    /** @param {import('@/api/search.api').SearchResult} item */
    (item) => {
      const isResource = item?.type === 'resources';
      const updated = persistRecentSearch(item.name);
      if (updated) setRecentSearches(updated);
      setSearchValue('');
      setIsOpen(false);
      setFocusedIndex(-1);
      if (isMobile) setIsModalOpen(false);
      if (isResource) {
        // router.push(`${item?.redirectUrl}#${item?.uid}`);
        window.location.href = `${item.redirectUrl}#${item.uid}`;
        return;
      }
      // router.push(item.redirectUrl);
      window.location.href = `${item.redirectUrl}`;
    },
    [isMobile, router]
  );

  const handleRecentSelect = useCallback((term) => {
    setSearchValue(term);
    setIsOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const handleClearRecents = useCallback((e) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { }
  }, []);

  const handleViewAll = useCallback(() => {
    if (!debouncedQuery.trim()) return;
    const updated = persistRecentSearch(debouncedQuery);
    if (updated) setRecentSearches(updated);
    setIsOpen(false);
    if (isMobile) setIsModalOpen(false);
    // router.push(`/search?q=${encodeURIComponent(debouncedQuery)}`);
  }, [debouncedQuery, isMobile, router]);

  const handleKeyDown = (e) => {
    const total = flatItems.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          return;
        }
        setFocusedIndex((p) => (p < total - 1 ? p + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          return;
        }
        setFocusedIndex((p) => (p > 0 ? p - 1 : total - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && flatItems[focusedIndex]) {
          handleSelect(flatItems[focusedIndex]);
        } else if (searchValue.trim()) {
          handleViewAll();
        }
        break;
      case 'Tab':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
      default:
        break;
    }
  };

  const openMobileSearch = () => {
    setIsModalOpen(true);
    setIsOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const closeMobileSearch = () => {
    setIsModalOpen(false);
    setIsOpen(false);
    setFocusedIndex(-1);
    inputRef.current?.blur();
  };

  // ── Derived state ─────────────────────────────────────────────────────────

  const isQueryActive = debouncedQuery.trim().length >= 2;
  const showLiveDropdown = isOpen && isQueryActive;
  const showStaticDropdown =
    isOpen && !isQueryActive && recentSearches.length > 0;

  const ariaExpanded = isOpen && (showLiveDropdown || showStaticDropdown);
  const activeDescendant =
    focusedIndex >= 0 ? getOptionId(focusedIndex) : undefined;

  // ── Search body (shared between desktop + mobile modal) ───────────────────

  const searchBody = (
    <div
      className={`enhanced-searchbar-box ${isOpen ? 'is-open' : ''}`}
      role="combobox"
      aria-expanded={ariaExpanded}
      aria-haspopup="listbox"
      aria-owns={ariaExpanded ? LISTBOX_ID : undefined}
    >
      <div className="search-input-wrapper">
        <RiSearchLine className="search-icon" aria-hidden="true" />

        <Input
          innerRef={inputRef}
          id="global-search-input"
          type="text"
          className="search-input input-common"
          value={searchValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder=""
          autoComplete="off"
          aria-label="Search"
          aria-autocomplete="list"
          aria-controls={ariaExpanded ? LISTBOX_ID : undefined}
          aria-activedescendant={ariaExpanded ? activeDescendant : undefined}
        />

        {!searchValue && (
          <div className="animated-placeholder" aria-hidden="true">
            <span className="placeholder-static">Search for</span>
            <span key={placeholderTick} className="placeholder-dynamic">
              &ldquo;{PLACEHOLDER_WORDS[placeholderIndex]}&rdquo;
            </span>
          </div>
        )}

        {searchValue && (
          <button
            type="button"
            className="clear-button"
            aria-label="Clear search"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClear}
          >
            <RiCloseLine />
          </button>
        )}
      </div>

      {/* ── Live API results ── */}
      {showLiveDropdown && (
        <SearchDropdown
          query={debouncedQuery}
          results={searchResults}
          totalCount={totalCount}
          isLoading={isLoading}
          isError={isError}
          refetch={refetch}
          focusedIndex={focusedIndex}
          onSelect={handleSelect}
          onViewAll={handleViewAll}
          listboxId={LISTBOX_ID}
          getOptionId={getOptionId}
        />
      )}

      {/* ── Recent searches (idle state) ── */}
      {showStaticDropdown && (
        <ul
          id={LISTBOX_ID}
          role="listbox"
          aria-label="Recent searches"
          className="suggestions-dropdown"
        >
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
          {recentSearches.map((term, idx) => (
            <li
              key={`recent-${idx}`}
              id={getOptionId(idx)}
              role="option"
              aria-selected={false}
              className="suggestion-item is-recent"
              onClick={() => handleRecentSelect(term)}
            >
              <RiTimeLine className="recent-icon" aria-hidden="true" />
              <span className="suggestion-text">{term}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {isMobile && (
        <button
          type="button"
          className="search-trigger-mobile"
          aria-label="Open search"
          onClick={openMobileSearch}
        >
          <RiSearchLine />
        </button>
      )}

      {!isMobile && (
        <div className="enhanced-search-container" ref={containerRef}>
          {searchBody}
        </div>
      )}

      {isMobile && (
        <div
          className={`search-modal ${isModalOpen ? 'open' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          onClick={closeMobileSearch}
        >
          <div
            className="search-modal__content"
            role="document"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="search-modal__header">
              <div className="fw-bold fs-6">Search</div>
              <button
                type="button"
                className="search-modal__close"
                aria-label="Close search"
                onClick={closeMobileSearch}
              >
                <RiCloseLine />
              </button>
            </div>
            <div className="search-modal__body">
              <div className="enhanced-search-container" ref={containerRef}>
                {searchBody}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EnhancedSearchBar;
