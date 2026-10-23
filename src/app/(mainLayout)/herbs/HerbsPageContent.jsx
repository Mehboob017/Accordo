'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Row, Col, Container } from 'reactstrap';
import WrapperComponent from '@/components/common/WrapperComponent';
import Breadcrumb from '@/components/common/Breadcrumb';
import HerbsGrid from '@/components/herbs/HerbsGrid';
import CommonSearchBar from '@/components/common/CommonSearchBar';
import CustomDropdown from '@/components/common/CustomDropdown';
import { useHerbs } from '@/utils/hooks/useHerbs';
import { fetchHerbSuggestions } from '@/api/herbs.api';
import useDebounce from '@/utils/hooks/useDebounce';
import { RiTimeLine } from 'react-icons/ri';
import { GiHerbsBundle } from 'react-icons/gi';

// Sort options - can be modified based on backend API definition
const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'A to Z', value: 'name_asc' },
  { label: 'Z to A', value: 'name_desc' },
];

const HerbsPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const itemsPerPage = 12;
  const currentPage = Math.abs(Number(searchParams.get('page'))) || 1;

  // Initialize state from URL params
  const searchQuery = searchParams.get('search') || '';
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all');
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.get('categories')
      ? searchParams.get('categories').split(',')
      : []
  );
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');

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

  useEffect(() => {
    const nextTab = searchParams.get('tab') || 'all';
    const nextCategories = searchParams.get('categories')
      ? searchParams.get('categories').split(',')
      : [];
    const nextSortBy = searchParams.get('sortBy') || 'newest';

    setActiveTab(nextTab);
    setSelectedCategories(nextCategories);
    setSortBy(nextSortBy);
  }, [searchParams]);

  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch herbs from API using the hook
  const { data: herbsResponse, isLoading } = useHerbs({
    limit: itemsPerPage,
    page: currentPage,
    search: debouncedSearchQuery,
    category: selectedCategories.join(','),
    filter: activeTab !== 'all' ? activeTab : '',
    sortBy: sortParams.sortBy,
    field: sortParams.field,
  });

  // Transform API herbs to match component expectations
  const apiHerbs = useMemo(() => {
    const herbs = herbsResponse?.data?.herbs || [];
    return herbs.map((herb) => {
      // Extract description from herbInfos if available
      const firstHerbInfo = herb.herbInfos?.[0];
      const shortDescription =
        herb.subtitle || firstHerbInfo?.description?.split('\n')[0] || '';

      return {
        id: herb.uid,
        slug: herb.slug,
        name: herb.name,
        subtitle: herb.subtitle,
        coverImage: herb.coverImage || '',
        coverImageAlt: herb.coverImageAlt || herb.name,
        shortDescription: shortDescription,
        herbInfos: herb.herbInfos || [],
        verifiedFlag: herb.verifiedFlag,
        verifiedBy: herb.verifiedBy,
        verifiedAt: herb.verifiedAt,
        status: herb.status,
        created_at: herb.created_at,
        updated_at: herb.updated_at,
      };
    });
  }, [herbsResponse]);

  // Transform categories to match component expectations
  // Note: API response doesn't include herbCategories, so this will be empty
  const herbCategories = useMemo(() => {
    const categories = herbsResponse?.data?.herbCategories || [];
    return categories.map((cat) => ({
      value: cat.slug,
      label: cat.name,
      uid: cat.uid,
      slug: cat.slug,
      status: cat.status,
    }));
  }, [herbsResponse]);

  // Get total count from API response
  const totalItems = herbsResponse?.data?.pagination?.total || 0;

  // Update URL when filters change
  const updateURL = useCallback(
    (params) => {
      const newParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (
          value &&
          value !== 'all' &&
          value !== 'grid' &&
          !(Array.isArray(value) && value.length === 0)
        ) {
          newParams.set(key, Array.isArray(value) ? value.join(',') : value);
        } else {
          newParams.delete(key);
        }
      });

      router.push(`?${newParams.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Handle search
  const handleSearch = useCallback(
    (query) => {
      updateURL({ search: query, page: 1 });
    },
    [updateURL]
  );

  // Handle category filter
  const handleCategoryChange = useCallback(
    (categories) => {
      setSelectedCategories(categories);
      updateURL({ categories, page: 1 });
    },
    [updateURL]
  );

  // Handle tab change
  const handleTabChange = useCallback(
    (tab) => {
      setActiveTab(tab);
      updateURL({ tab, page: 1 });
    },
    [updateURL]
  );

  // Handle sort change
  const handleSortChange = useCallback(
    (newSortBy) => {
      setSortBy(newSortBy);
      updateURL({ sortBy: newSortBy, page: 1 });
    },
    [updateURL]
  );

  // Handle search from search bar
  const handleSearchResults = useCallback(
    (query) => {
      updateURL({ search: query, page: 1 });
    },
    [updateURL]
  );

  // Transform herb API results for CommonSearchBar
  const transformHerb = useCallback((herb) => {
    return {
      id: herb.uid,
      title: herb.name,
      subtitle: herb.subtitle || '',
      slug: herb.slug,
      searchableFields: ['title', 'subtitle'],
    };
  }, []);

  const highlightText = useCallback((text, indices) => {
    if (!indices || !indices.length) return text;

    let result = '';
    let lastIndex = 0;

    indices.forEach(([start, end]) => {
      result += text.slice(lastIndex, start);
      result += `<span class="search-highlight">${text.slice(start, end + 1)}</span>`;
      lastIndex = end + 1;
    });

    result += text.slice(lastIndex);
    return result;
  }, []);

  const renderHerbResults = useCallback(
    (item, index) => {
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
            <GiHerbsBundle aria-hidden="true" />
          </div>
          <div className="suggestion-content">
            <span className="suggestion-text">
              {item.highlightMatches?.title ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html: highlightText(
                      item.title,
                      item.highlightMatches.title
                    ),
                  }}
                />
              ) : (
                item.title
              )}
            </span>
            <span className="suggestion-meta">{item.subtitle}</span>
          </div>
        </>
      );
    },
    [highlightText]
  );

  return (
    <>
      <WrapperComponent
        classes={{ sectionClass: 'section-b-space shop-section' }}
        noSectionTopSpace={true}
      >
        <div className="herbs-page">
          {/* Search Bar and Sort Filter */}
          <Row className="mb-2 mb-md-4 g-2 g-md-4">
            <Col lg={8} md={8}>
              <CommonSearchBar
                storageKey="recent_herb_searches"
                placeholderWords={[
                  'Ashwagandha',
                  'Turmeric',
                  'Tulsi',
                  'Immune Support',
                  'Digestive Health',
                ]}
                searchLabel="Search herbs"
                enableFuzzyMatch={true}
                autoSearch={false}
                fetchResults={fetchHerbSuggestions}
                transformResults={transformHerb}
                renderResultItem={renderHerbResults}
                onSearch={handleSearchResults}
                initialValue={searchQuery}
                className="mb-0 mw-100"
              />
            </Col>
            {/* Custom Sort Dropdown */}
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

          {/* Herbs Grid with Pagination */}
          <HerbsGrid
            herbs={apiHerbs}
            searchQuery={searchQuery}
            activeTab={activeTab}
            selectedCategories={selectedCategories}
            isLoading={isLoading}
            total={totalItems}
            perPage={itemsPerPage}
          />
        </div>
      </WrapperComponent>
    </>
  );
};

export default HerbsPageContent;
