'use client';

import { useState, useRef, useEffect } from 'react';
import { RiCloseLine, RiArrowDownSLine, RiGridFill, RiListCheck, RiCalendarLine } from 'react-icons/ri';

const EventsFilter = ({
  categories = [],
  onFilterChange,
  activeTab = 'all',
  selectedCategories = [],
  viewMode = 'grid'
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabChange = (tab) => {
    onFilterChange({ tab });
  };

  const handleCategoryToggle = (categoryValue) => {
    const newSelected = selectedCategories.includes(categoryValue)
      ? selectedCategories.filter((c) => c !== categoryValue)
      : [...selectedCategories, categoryValue];

    onFilterChange({ categories: newSelected });
  };

  const handleViewModeChange = (mode) => {
    onFilterChange({ viewMode: mode });
  };

  const handleRemoveCategory = (categoryValue) => {
    const newSelected = selectedCategories.filter((c) => c !== categoryValue);
    onFilterChange({ categories: newSelected });
  };

  const clearAllFilters = () => {
    onFilterChange({ categories: [], tab: 'all' });
  };

  const hasActiveFilters = selectedCategories.length > 0 || activeTab !== 'all';

  return (
    <div className="events-filter-section">
      {/* Filter Controls */}
      <div className="events-filter-controls">
        {/* Tabs */}
        <div className="filter-tabs">
          <button
            type="button"
            className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => handleTabChange('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`filter-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => handleTabChange('upcoming')}
          >
            Upcoming
          </button>
          <button
            type="button"
            className={`filter-tab ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => handleTabChange('past')}
          >
            Past
          </button>
        </div>

        {/* Category Dropdown & View Toggle */}
        <div className="filter-actions">
          {/* Category Multiselect Dropdown */}
          <div className="category-dropdown" ref={dropdownRef}>
            <button
              type="button"
              className={`category-dropdown-button ${isDropdownOpen ? 'open' : ''}`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>
                {selectedCategories.length > 0
                  ? `Categories (${selectedCategories.length})`
                  : 'All Categories'}
              </span>
              <RiArrowDownSLine className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="category-dropdown-menu" data-lenis-prevent>
                {categories.map((category) => (
                  <label
                    key={category.label}
                    className="category-dropdown-item"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.slug)}
                      onChange={() => handleCategoryToggle(category.slug)}
                    />
                    <span className="checkbox-custom"></span>
                    <span className="category-label">{category.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="view-mode-toggle">
            <button
              type="button"
              className={`view-mode-button ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('grid')}
              aria-label="Grid view"
              title="Grid view"
            >
              <RiGridFill />
            </button>
            <button
              type="button"
              className={`view-mode-button ${viewMode === 'list' ? 'active' : ''} d-none d-md-flex`}
              onClick={() => handleViewModeChange('list')}
              aria-label="List view"
              title="List view"
            >
              <RiListCheck />
            </button>
            <button
              type="button"
              className={`view-mode-button ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('calendar')}
              aria-label="Calendar view"
              title="Calendar view"
            >
              <RiCalendarLine />
            </button>
          </div>
        </div>
      </div>

      {/* Selected Filters Pills */}
      {hasActiveFilters && (
        <div className="selected-filters">
          <div className="events-selected-filters-content ">
            {/* Status Filter Pill */}
            {activeTab !== 'all' && (
              <button
                type="button"
                className="filter-pill"
                onClick={() => handleTabChange('all')}
              >
                <span className="filter-pill-text">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </span>
                <RiCloseLine className="filter-pill-icon" />
              </button>
            )}

            {/* Category Filter Pills */}
            {selectedCategories.map((categoryValue) => {
              const category = categories.find((c) => c.slug === categoryValue);
              return (
                <button
                  key={categoryValue}
                  type="button"
                  className="filter-pill"
                  onClick={() => handleRemoveCategory(categoryValue)}
                >
                  <span className="filter-pill-text">
                    {category?.label || categoryValue}
                  </span>
                  <RiCloseLine className="filter-pill-icon" />
                </button>
              );
            })}

            {/* Clear All Button */}
            <button
              type="button"
              className="clear-all-button"
              onClick={clearAllFilters}
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsFilter;
