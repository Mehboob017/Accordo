'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Row, Col } from 'reactstrap';
import EventsCarousel from './EventsCarousel';
import EventsFilter from './EventsFilter';
import EventsGrid from './EventsGrid';
import EventsCalendar from './EventsCalendar';
import { useCalendarEvents, useEvents } from '@/utils/hooks/useEvents';
import useDebounce from '@/utils/hooks/useDebounce';
import CommonSearchBar from '../common/CommonSearchBar';
import CustomDropdown from '../common/CustomDropdown';
import { fetchEventSuggestions } from '@/api/events.api';

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'A to Z', value: 'name_asc' },
  { label: 'Z to A', value: 'name_desc' },
];

const EventsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const itemsPerPage = 12;
  const currentPage = Math.abs(Number(searchParams.get('page'))) || 1;

  // Initialize state from URL params
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all');
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.get('categories')
      ? searchParams.get('categories').split(',')
      : []
  );
  const [viewMode, setViewMode] = useState(searchParams.get('view') || 'grid');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');

  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Map sort value to API parameters
  const getSortParams = (sortValue) => {
    switch (sortValue) {
      case 'newest':
        return { field: 'created_at', sortBy: 'newest' };
      case 'oldest':
        return { field: 'created_at', sortBy: 'oldest' };
      case 'name_asc':
        return { field: 'clinicName', sortBy: 'name_asc' };
      case 'name_desc':
        return { field: 'clinicName', sortBy: 'name_desc' };
      default:
        return { field: 'created_at', sortBy: 'newest' };
    }
  };

  const sortParams = getSortParams(sortBy);

  // Fetch events from API using the hook
  const { data: eventsResponse, isLoading } = useEvents({
    search: debouncedSearchQuery,
    category: selectedCategories.join(','),
    filter: activeTab !== 'all' ? activeTab : '',
    page: currentPage,
    limit: itemsPerPage,
    sortBy: sortParams.sortBy,
    field: sortParams.field,
  });

  // Fetch calendar events only for calendar view
  const { data: calendarResponse } = useCalendarEvents(
    {
      search: debouncedSearchQuery,
      category: selectedCategories.join(','),
      filter: activeTab !== 'all' ? activeTab : '',
    },
    {
      enabled: viewMode === 'calendar',
    }
  );

  const mapEvents = useCallback((events) => {
    return events.map((event) => {
      const variant = event.eventVariant || {};
      const type = variant?.type || 'Offline';
      const isOnline = type.toLowerCase() === 'online';
      const addressParts = [
        variant?.addressLine1,
        variant?.addressLine2,
        variant?.city,
        variant?.state,
        variant?.pincode,
        variant?.country,
      ].filter(Boolean);
      const address = isOnline
        ? 'Online Event'
        : variant?.googleAddress || addressParts.join(', ');

      return {
        id: event.uid,
        uid: event.eventUid,
        variantUid: event.variantUid,
        coverImage: event.coverImage || '/assets/images/logo/1.png',
        coverImageAlt: event.coverImageAlt || event.title,
        title: event.title,
        slug: event.slug,
        tag: event.tag,
        shortDescription: event.shortDescription,
        description: event.description,
        category: event.eventCategory?.slug || '',
        categoryName: event.eventCategory?.name || '',
        categoryUid: event.eventCategory?.uid || '',
        type,
        link: variant?.link,
        organizer: variant?.organizer,
        startDate: variant?.startDate,
        endDate: variant?.endDate,
        startTime: variant?.displayStartTime || variant?.startTime,
        displayStartTime: variant?.displayStartTime,
        endTime: variant?.displayEndTime || variant?.endTime,
        displayEndTime: variant?.displayEndTime,
        address,
        addressLine1: variant?.addressLine1,
        addressLine2: variant?.addressLine2,
        country: variant?.country,
        state: variant?.state,
        city: variant?.city,
        pincode: variant?.pincode,
        latitude: variant?.latitude,
        longitude: variant?.longitude,
        location: `${variant?.city || ''}, ${variant?.state || ''}`
          .trim()
          .replace(/^,\s*|,\s*$/g, ''),
        time:
          (variant?.displayStartTime || variant?.startTime) &&
            (variant?.displayEndTime || variant?.endTime)
            ? `${variant?.displayStartTime || variant?.startTime} - ${variant?.displayEndTime || variant?.endTime}`
            : '',
        date: variant?.startDate,
        status: event.isUpcoming
          ? 'upcoming'
          : event.isPast
            ? 'past'
            : 'upcoming',
        isUpcoming: event.isUpcoming,
        isPast: event.isPast,
        eventVariant: variant,
        created_at: event.created_at,
        updated_at: event.updated_at,
      };
    });
  }, []);

  // Transform API events to match component expectations
  const apiEvents = useMemo(() => {
    const events = eventsResponse?.data?.events || [];
    return mapEvents(events);
  }, [eventsResponse, mapEvents]);

  const calendarEvents = useMemo(() => {
    const events = calendarResponse?.data?.events || [];
    return mapEvents(events);
  }, [calendarResponse, mapEvents]);

  // Transform categories to match component expectations
  const eventCategories = useMemo(() => {
    const categories = eventsResponse?.data?.eventCategories || [];
    return categories.map((cat) => ({
      value: cat.slug,
      label: cat.name,
      uid: cat.uid,
      slug: cat.slug,
      status: cat.status,
    }));
  }, [eventsResponse]);

  // Get total count from API response
  const totalItems = eventsResponse?.data?.pagination?.total || 0;

  const eventBanners = eventsResponse?.data?.banners || [];

  // Update URL when filters change
  const updateURL = useCallback(
    (params) => {
      const currentParams = Object.fromEntries(searchParams.entries());

      const mergedParams = {
        ...currentParams,
        ...params,
      };

      const queryString = Object.entries(mergedParams)
        .filter(([key, value]) => {
          if (value === undefined || value === null) return false;
          if (value === 'all' || value === 'grid') return false;
          if (Array.isArray(value) && value.length === 0) return false;
          if (typeof value === 'string' && value.trim() === '') return false;
          return true;
        })
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return `${key}=${value.map((v) => encodeURIComponent(String(v).replace(/\s+/g, '-'))).join(',')}`;
          }
          return `${key}=${encodeURIComponent(String(value).replace(/\s+/g, '-'))}`;
        })
        .join('&');

      const newURL = queryString ? `?${queryString}` : '/events';

      router.push(newURL, { scroll: false });
    },
    [searchParams, router]
  );

  const handleSearchResults = useCallback(
    (query, results) => {
      setSearchQuery(query);
      setSearchResults(results);
      updateURL({ search: query });
    },
    [updateURL]
  );

  const handleFilterChange = useCallback(
    (changes) => {
      const updates = {};

      if ('tab' in changes) {
        setActiveTab(changes.tab);
        updates.tab = changes.tab;
      }
      if ('categories' in changes) {
        setSelectedCategories(changes.categories);
        updates.categories = changes.categories;
      }
      if ('viewMode' in changes) {
        setViewMode(changes.viewMode);
        updates.view = changes.viewMode;
      }

      updateURL({
        search: searchQuery,
        tab: updates.tab !== undefined ? updates.tab : activeTab,
        categories:
          updates.categories !== undefined
            ? updates.categories
            : selectedCategories,
        view: updates.view !== undefined ? updates.view : viewMode,
      });
    },
    [searchQuery, activeTab, selectedCategories, viewMode, updateURL]
  );

  const handleSortChange = useCallback((newSortBy) => {
    setSortBy(newSortBy);
  }, []);

  // Transform event API results for CommonSearchBar
  const transformEvent = useCallback((event) => {
    return {
      id: event.uid,
      title: event.title,
      subtitle: event.eventCategory?.name || '',
      slug: event.slug,
      categoryUid: event.eventCategoryUid,
      searchableFields: ['title', 'subtitle'],
    };
  }, []);

  return (
    <div className="events-page">
      <EventsCarousel banners={eventBanners} />

      {/* Main Content */}
      <section className="container-fluid-lg events-main-section">
        <div className="events-content-section">
          <Row>
            <Col>
              <div className="events-header">
                <h1 className="events-title">Discover Our Events</h1>
                <h2 className="sr-only">This is an events listing page.</h2>
                <p className="events-subtitle">
                  Join us at exciting conferences, workshops, and networking
                  events happening across India
                </p>
              </div>

              {/* Search Bar */}
              {/* <EventsSearchBar 
                events={apiEvents} 
                onSearchResults={handleSearchResults}
              /> */}
              <div className="events-search-sort-row">
                <Row className="g-2 g-md-4">
                  <Col lg={8} md={8}>
                    <CommonSearchBar
                      storageKey="recent_event_searches"
                      placeholderWords={[
                        'Technology Summit',
                        'Networking Meetup',
                        'Training Program',
                      ]}
                      searchLabel="Search events"
                      enableFuzzyMatch={true}
                      autoSearch={false}
                      fetchResults={fetchEventSuggestions}
                      transformResults={transformEvent}
                      onSearch={handleSearchResults}
                      initialValue={searchQuery}
                    />
                  </Col>
                  <Col lg={4} md={4}>
                    <CustomDropdown
                      label=""
                      value={sortBy}
                      options={SORT_OPTIONS}
                      onChange={handleSortChange}
                      className="h-100"
                    />
                  </Col>
                </Row>
              </div>

              {/* Filter Section */}
              <EventsFilter
                categories={eventCategories}
                activeTab={activeTab}
                selectedCategories={selectedCategories}
                viewMode={viewMode}
                onFilterChange={handleFilterChange}
              />

              {/* Events Grid or Calendar */}
              {viewMode === 'calendar' ? (
                <EventsCalendar
                  events={calendarEvents}
                  activeTab={activeTab}
                  selectedCategories={selectedCategories}
                />
              ) : (
                <EventsGrid
                  events={apiEvents}
                  searchResults={searchResults}
                  searchQuery={searchQuery}
                  activeTab={activeTab}
                  selectedCategories={selectedCategories}
                  viewMode={viewMode}
                  isLoading={isLoading}
                  total={totalItems}
                  perPage={itemsPerPage}
                />
              )}
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
};

export default EventsPage;
