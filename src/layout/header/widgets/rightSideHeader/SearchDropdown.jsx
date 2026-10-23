'use client';

import { memo } from 'react';
import { RiRefreshLine } from 'react-icons/ri';

/**
 * @typedef {'product'|'category'|'department'|'health interest'|'herb'|'event category'|'event subcategory'|'event'|'blog category'|'blog'|'resource category'|'resource subcategory'|'resources'} SearchResultType
 */

/**
 * Per-type display config — subtext, badge label, and icon CSS variable names.
 * @type {Record<string, {subtext: string, badge: string, bgVar: string, colorVar: string}>}
 */
const TYPE_CONFIG_MAP = {
  product: {
    subtext: 'View product',
    badge: 'Product',
    bgVar: '--search-icon-product-bg',
    colorVar: '--search-icon-product-color',
  },
  category: {
    subtext: 'Browse collection',
    badge: 'Category',
    bgVar: '--search-icon-category-bg',
    colorVar: '--search-icon-category-color',
  },
  department: {
    subtext: 'Browse department',
    badge: 'Department',
    bgVar: '--search-icon-department-bg',
    colorVar: '--search-icon-department-color',
  },
  'healthinterest': {
    subtext: 'Explore health concerns',
    badge: 'Health Concern',
    bgVar: '--search-icon-healthinterest-bg',
    colorVar: '--search-icon-healthinterest-color',
  },
  herb: {
    subtext: 'Herb detail',
    badge: 'Herb',
    bgVar: '--search-icon-herb-bg',
    colorVar: '--search-icon-herb-color',
  },
  'eventCategory': {
    subtext: 'Browse event category',
    badge: 'Event Category',
    bgVar: '--search-icon-eventcategory-bg',
    colorVar: '--search-icon-eventcategory-color',
  },
  'eventSubcategory': {
    subtext: 'Browse event subcategory',
    badge: 'Event Subcategory',
    bgVar: '--search-icon-eventsubcategory-bg',
    colorVar: '--search-icon-eventsubcategory-color',
  },
  event: {
    subtext: 'View event',
    badge: 'Event',
    bgVar: '--search-icon-event-bg',
    colorVar: '--search-icon-event-color',
  },
  'blogCategory': {
    subtext: 'Browse blog categories',
    badge: 'Blog Category',
    bgVar: '--search-icon-blogcategory-bg',
    colorVar: '--search-icon-blogcategory-color',
  },
  blog: {
    subtext: 'Read blog',
    badge: 'Blog',
    bgVar: '--search-icon-blog-bg',
    colorVar: '--search-icon-blog-color',
  },
  'resourceCategory': {
    subtext: 'Browse resource categories',
    badge: 'Resource Category',
    bgVar: '--search-icon-resourcecategory-bg',
    colorVar: '--search-icon-resourcecategory-color',
  },
  'resourceSubcategory': {
    subtext: 'Browse resource subcategories',
    badge: 'Resource Subcategory',
    bgVar: '--search-icon-resourcesubcategory-bg',
    colorVar: '--search-icon-resourcesubcategory-color',
  },
  resources: {
    subtext: 'Open resource',
    badge: 'Resource',
    bgVar: '--search-icon-resources-bg',
    colorVar: '--search-icon-resources-color',
  },
};

/**
 * Normalizes API type strings to a consistent key used by TYPE_CONFIG_MAP.
 * Handles casing, separators, and camelCase values.
 * @param {string} value
 * @returns {string}
 */
const normalizeTypeKey = (value) =>
  String(value || '')
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase();

const DEFAULT_TYPE = {
  subtext: 'View',
  badge: '',
  bgVar: '--search-icon-product-bg',
  colorVar: '--search-icon-product-color',
};

/** @param {string} name @returns {string} */
const getInitials = (name) =>
  String(name || '')
    .trim()
    .slice(0, 2)
    .toUpperCase();

/**
 * Wraps matched query substring in <mark>.
 * @param {string} text
 * @param {string} query
 */
const HighlightMatch = ({ text, query }) => {
  if (!query || !text) return <>{text}</>;

  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, index)}
      <mark>{text.slice(index, index + query.length)}</mark>
      {text.slice(index + query.length)}
    </>
  );
};

/** Loading skeleton — 3 placeholder rows */
const SearchSkeleton = () => (
  <div className="search-skeleton-wrap" aria-hidden="true">
    {[0, 1, 2].map((i) => (
      <div className="search-skeleton-row" key={i}>
        <div className="search-skeleton-avatar" />
        <div className="search-skeleton-lines">
          <div className="search-skeleton-line search-skeleton-line--title" />
          <div className="search-skeleton-line search-skeleton-line--sub" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * SearchDropdown renders all states: loading, error, empty, flat results.
 *
 * @param {{
 *   query: string,
 *   results: import('@/api/search.api').SearchResult[],
 *   totalCount: number,
 *   isLoading: boolean,
 *   isError: boolean,
 *   refetch: function,
 *   focusedIndex: number,
 *   onSelect: function,
 *   onViewAll: function,
 *   listboxId: string,
 *   getOptionId: function,
 * }} props
 */
const SearchDropdown = ({
  query,
  results,
  totalCount,
  isLoading,
  isError,
  refetch,
  focusedIndex,
  onSelect,
  onViewAll,
  listboxId,
  getOptionId,
}) => {
  if (isLoading) {
    return (
      <ul
        id={listboxId}
        role="listbox"
        aria-label="Search results loading"
        className="suggestions-dropdown"
        data-lenis-prevent
      >
        <li role="presentation">
          <SearchSkeleton />
        </li>
      </ul>
    );
  }

  if (isError) {
    return (
      <ul
        id={listboxId}
        role="listbox"
        className="suggestions-dropdown"
        data-lenis-prevent
      >
        <li role="presentation">
          <div className="search-error-state" role="alert">
            <p>Something went wrong. Try again.</p>
            <button
              type="button"
              className="search-retry-btn"
              onClick={refetch}
            >
              <RiRefreshLine aria-hidden="true" />
              Retry
            </button>
          </div>
        </li>
      </ul>
    );
  }

  if (query.trim().length >= 2 && totalCount === 0) {
    return (
      <ul
        id={listboxId}
        role="listbox"
        className="suggestions-dropdown"
        data-lenis-prevent
      >
        <li role="presentation">
          <div className="search-empty-state">
            No results found for &ldquo;{query}&rdquo;
          </div>
        </li>
      </ul>
    );
  }

  if (totalCount === 0) return null;

  return (
    <ul
      id={listboxId}
      role="listbox"
      aria-label="Search results"
      className="suggestions-dropdown"
      data-lenis-prevent
    >
      {results.map((item, index) => {
        const normalizedType = normalizeTypeKey(item?.type);
        const { subtext, badge, bgVar, colorVar } =
          TYPE_CONFIG_MAP[normalizedType] ?? DEFAULT_TYPE;
        const isFocused = focusedIndex === index;

        return (
          <li
            key={item.uid}
            id={getOptionId(index)}
            role="option"
            aria-selected={isFocused}
            className={`search-result-row${isFocused ? ' is-focused' : ''}`}
            onClick={() => onSelect(item)}
            data-flat-index={index}
          >
            <span
              className="search-type-icon"
              aria-hidden="true"
              style={{
                background: `var(${bgVar})`,
                color: `var(${colorVar})`,
              }}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.imageAlt || item.name}
                  className="search-type-icon__img"
                />
              ) : (
                getInitials(item.name)
              )}
            </span>

            <span className="search-result-main">
              <span className="search-result-name">
                <HighlightMatch text={item.name} query={query} />
              </span>
              <span className="search-result-sub">{subtext}</span>
            </span>

            <span
              className="search-type-badge"
              style={{
                background: `var(${bgVar})`,
                color: `var(${colorVar})`,
              }}
            >
              {badge}
            </span>
          </li>
        );
      })}

      {/* <li role="presentation">
        <button
          type="button"
          className="search-view-all-row"
          onClick={onViewAll}
        >
          <span>
            View all results for &ldquo;<strong>{query}</strong>&rdquo;
          </span>
          <span className="search-view-all-count">{totalCount} results</span>
        </button>
      </li> */}
    </ul>
  );
};

export default memo(SearchDropdown);
