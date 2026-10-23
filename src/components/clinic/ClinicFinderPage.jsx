'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Row, Col } from 'reactstrap';
import { RiHospitalLine, RiTimeLine } from 'react-icons/ri';
import { GrClose } from "react-icons/gr";
import { BiClinic } from 'react-icons/bi';
import WrapperComponent from '../common/WrapperComponent';
import CommonSearchBar from '../common/CommonSearchBar';
import CustomDropdown from '../common/CustomDropdown';
import ClinicList from './ClinicList';
// import Pagination from '@/components/common/Pagination';
import { useInfiniteClinics } from '@/utils/hooks/useClinics';
import { fetchClinicSuggestions } from '@/api/clinics.api';

const ITEMS_PER_PAGE = 3;

const SORT_OPTIONS = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'A to Z', value: 'name_asc' },
  { label: 'Z to A', value: 'name_desc' },
];

const ClinicFinderPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get query parameters
  // const currentPage = parseInt(searchParams.get('page') || '1');
  const searchQuery = searchParams.get('search') || '';
  const specializationsParam = searchParams.get('specializations') || '';
  const sortByParam = searchParams.get('sortBy') || 'relevance';

  const [selectedClinicId, setSelectedClinicId] = useState(null);
  const [selectedSpecializations, setSelectedSpecializations] = useState(
    specializationsParam ? specializationsParam.split(',').filter(Boolean) : []
  );
  const [sortBy, setSortBy] = useState(sortByParam);

  // Map sort value to API parameters
  const getSortParams = (sortValue) => {
    switch (sortValue) {
      case 'relevance':
        return { field: '', sortBy: 'relevance' };
      case 'newest':
        return { field: 'created_at', sortBy: 'newest' };
      case 'oldest':
        return { field: 'created_at', sortBy: 'oldest' };
      case 'name_asc':
        return { field: 'clinicName', sortBy: 'name_asc' };
      case 'name_desc':
        return { field: 'clinicName', sortBy: 'name_desc' };
      default:
        return { field: '', sortBy: 'relevance' };
    }
  };

  const sortParams = getSortParams(sortBy);

  // Fetch clinics data with query parameters
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteClinics({
    limit: ITEMS_PER_PAGE,
    search: searchQuery,
    specialization: selectedSpecializations.join(','),
    sortBy: sortParams.sortBy,
    field: sortParams.field,
  });

  const clinicsData = useMemo(
    () =>
      data?.pages.flatMap((page) => page?.data?.clinics ?? []) ?? [],
    [data]
  );

  const specializations =
    data?.pages?.[0]?.data?.specializations ?? [];

  const pagination =
    data?.pages?.[data.pages.length - 1]?.data?.pagination ?? {
      total: 0,
      page: 1,
      totalPages: 1,
    };
  // Initialize clinic ID from URL
  useEffect(() => {
    const clinicId = searchParams.get('clinicId');
    if (clinicId) {
      setSelectedClinicId(clinicId);
    }
  }, [searchParams]);

  // Handle search - update URL which will trigger refetch
  const handleSearch = useCallback(
    (query) => {
      const params = new URLSearchParams();
      // params.set('page', '1'); // Reset to page 1 on new search

      if (query.trim()) {
        params.set('search', query.trim());
      }

      if (sortBy !== 'relevance') {
        params.set('sortBy', sortBy);
      }

      if (selectedSpecializations.length > 0) {
        params.set('specializations', selectedSpecializations.join(','));
      }

      router.push(`?${params.toString()}`);
    },
    [router, selectedSpecializations]
  );

  // Handle search results from CommonSearchBar
  const handleSearchResults = useCallback(
    (query, results) => {
      handleSearch(query);
    },
    [handleSearch]
  );

  // Transform clinic API results for CommonSearchBar
  const transformClinic = useCallback((clinic) => {
    const locationParts = [clinic.city, clinic.state, clinic.pincode].filter(
      Boolean
    );

    // Extract specializations from doctorClinicSpecializations
    const specializations =
      clinic.doctorClinicSpecializations
        ?.map((dcs) => dcs.doctorSpecialization?.name)
        .filter(Boolean)
        .join(', ') || '';

    return {
      id: clinic.uid,
      title: clinic.name,
      subtitle: locationParts.join(', '),
      slug: clinic.slug,
      searchableFields: ['title', 'subtitle'],
    };
  }, []);

  // Custom render for clinic search results
  const renderClinicResult = useCallback((item, index) => {
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
          <BiClinic aria-hidden="true" />
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
  }, []);

  // Helper function to highlight matched text
  const highlightText = (text, indices) => {
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
  };

  // Handle specialization filter toggle
  const toggleSpecialization = useCallback(
    (spec) => {
      const newSpecializations = selectedSpecializations.includes(spec)
        ? selectedSpecializations.filter((s) => s !== spec)
        : [...selectedSpecializations, spec];

      setSelectedSpecializations(newSpecializations);

      const params = new URLSearchParams();
      if (sortBy !== 'relevance') {
        params.set('sortBy', sortBy);
      }
      // params.set('page', '1'); // Reset to page 1 on filter change

      if (searchQuery) {
        params.set('search', searchQuery);
      }

      if (newSpecializations.length > 0) {
        params.set('specializations', newSpecializations.join(','));
      }

      router.push(`?${params.toString()}`);
    },
    [router, searchQuery, selectedSpecializations]
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSelectedSpecializations([]);
    setSelectedClinicId(null);
    const params = new URLSearchParams();

    if (sortBy !== 'relevance') {
      params.set('sortBy', sortBy);
    }

    router.push(`/find-the-clinic ${params.toString() ? `?${params}` : ''}`);
  }, [router, sortBy]);

  // Handle clinic selection
  const handleClinicClick = useCallback(
    (clinic) => {
      const newClinicId = selectedClinicId === clinic.uid ? null : clinic.uid;
      setSelectedClinicId(newClinicId);

      const params = new URLSearchParams(searchParams.toString());

      if (newClinicId) {
        params.set('clinicId', newClinicId);
      } else {
        params.delete('clinicId');
      }

      router.push(`?${params.toString()}`);
    },
    [selectedClinicId, searchParams, router]
  );

  // Handle sort change
  const handleSortChange = useCallback(
    (newSortBy) => {
      setSortBy(newSortBy);
      const params = new URLSearchParams(searchParams.toString());
      params.set('sortBy', newSortBy);
      // params.set('page', '1');
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const hasActiveFilters = selectedSpecializations.length > 0 || searchQuery;

  if (!isLoading && isError) {
    return (
      <WrapperComponent
        classes={{ sectionClass: 'clinic-finder-section section-b-space' }}
      >
        <div className="clinic-finder-container">
          <h1 className="clinic-finder-title">Find Vaidyas Nearby</h1>
          <div className="error-message">
            <p>Failed to load clinics. Please try again later.</p>
          </div>
        </div>
      </WrapperComponent>
    );
  }

  return (
    <>
      <WrapperComponent
        classes={{ sectionClass: 'clinic-finder-section section-b-space' }}
      >
        <div className="clinic-finder-containe">
          {/* <h1 className="clinic-finder-title">Find Vaidyas Nearby</h1> */}
          <div className="clinic-finder-header">
            <h1 className="clinic-finder-title">Find Vaidyas Nearby</h1>
            <h2 className="sr-only">This is a clinic finder page.</h2>
            <p className="clinic-finder-subtitle">
              Discover Ayurvedic clinics near your location by PIN code, doctor, or specialization.

            </p>
          </div>

          <div className="clinic-disclaimer-section">
            <div className="clinic-disclaimer-content">
              <h3 className="clinic-disclaimer-title">Disclaimer </h3>
              <p className="clinic-disclaimer-text">
                The details of Ayurved Physicians provided herein are shared solely for your convenience based on information available in our records for the specified locality.
              </p>
              <p className="clinic-disclaimer-text">
                You may contact any of the listed practitioners directly and seek their professional guidance regarding your health concerns.
                Please note that the inclusion of any physician's name or contact information in this communication does not constitute a recommendation, endorsement, referral, or guarantee of the quality of services provided by such practitioner. The information is being shared solely as a reference resource.
                While we strive to provide accurate and updated information, we make no representations or warranties regarding the qualifications, availability, suitability, or services of any listed practitioner. Any engagement with the medical practitioners shall be at your sole discretion and responsibility.
                We expressly disclaim any and all liability, direct or indirect, arising from the use of, reliance upon, or actions taken based on the information provided in this communication.
              </p>
            </div>
          </div>

          {/* Search Bar and Sort Filter */}
          <div className="clinic-finder-search">
            <Row className="g-2 g-md-4">
              <Col lg={8} md={8}>
                <CommonSearchBar
                  storageKey="recent_clinic_searches"
                  placeholderWords={[
                    'Specialization',
                    'Clinic Name',
                    'City',
                    'Pincode',
                    'Doctor Name',
                  ]}
                  searchLabel="Search Clinics"
                  enableFuzzyMatch={true}
                  autoSearch={false}
                  fetchResults={fetchClinicSuggestions}
                  transformResults={transformClinic}
                  renderResultItem={renderClinicResult}
                  onSearch={handleSearchResults}
                  initialValue={searchQuery}
                  className="clinic-search-container"
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

          {/* Specialization Filters */}
          <div className="clinic-filters-section">
            <div className="filters-header">
              <h3 className="filters-title">Filter by Specialization</h3>
              {hasActiveFilters && (
                <button className="clear-filters-btn" onClick={clearAllFilters}>
                  Clear All
                </button>
              )}
            </div>
            <div className="specialization-filters">
              <div
                data-lenis-prevent
                className="specialization-scroll-container"
              >
                {specializations.map((spec) => (
                  <button
                    key={spec.uid}
                    className={`specialization-filter-btn ${selectedSpecializations.includes(spec.name)
                      ? 'active'
                      : ''
                      }`}
                    onClick={() => toggleSpecialization(spec.name)}
                  >
                    {spec.name}{selectedSpecializations.includes(spec.name) && <span className='ms-1'><GrClose /></span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="clinic-results-info">
            {isLoading ? (
              <div className="results-count-skeleton" aria-hidden="true" />
            ) : (
              <p className="results-count">
                Showing {clinicsData.length} of {pagination.total} clinic
                {pagination.total !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Clinic Cards Grid */}
          <div className="clinic-grid">
            <ClinicList
              clinics={clinicsData}
              selectedClinicId={selectedClinicId}
              onClinicClick={handleClinicClick}
              isLoading={isLoading}
            />
          </div>

          {/* Pagination */}
          <div
            className="d-flex justify-content-center align-items-center py-4"
          >
            {hasNextPage ? (
              <button
                className="btn btn-primary btn-sm theme-btn"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </button>
            ) : clinicsData.length > 0 ? (
              <p className="text-muted mb-0">No more clinics to load.</p>
            ) : null}
          </div>

          {/* {!isLoading && pagination.total > ITEMS_PER_PAGE && (
            <div className="clinic-pagination custome-pagination">
              <Pagination total={pagination.total} perPage={ITEMS_PER_PAGE} />
            </div>
          )} */}
        </div>
      </WrapperComponent>
    </>
  );
};

export default ClinicFinderPage;
