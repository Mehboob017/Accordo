'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Row, Col } from 'reactstrap';
import { RiStoreLine, RiTimeLine } from 'react-icons/ri';

import WrapperComponent from '../common/WrapperComponent';
import CommonSearchBar from '../common/CommonSearchBar';
import StoreList from './StoreList';

import { useInfiniteStores } from '@/utils/hooks/useStores';
import { fetchStoreSuggestions } from '@/api/stores.api';
import CustomDropdown from '../common/CustomDropdown';

const ITEMS_PER_PAGE = 3;
const SORT_OPTIONS = [
  {
    label: 'Relevance',
    value: 'relevance',
  },
  {
    label: 'Newest First',
    value: 'newest',
  },
  {
    label: 'Oldest First',
    value: 'oldest',
  },
  {
    label: 'A to Z',
    value: 'name_asc',
  },
  {
    label: 'Z to A',
    value: 'name_desc',
  },
];


const StoreFinderPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sortParam = searchParams.get('sort') || 'relevance';
  const searchQuery = searchParams.get('search') || '';
  
  const [sortBy, setSortBy] = useState(sortParam);
  const [selectedStoreId, setSelectedStoreId] = useState(null);

  const getSortParams = (value) => {
  switch (value) {
    case 'oldest':
      return {
        field: 'created_at',
        sortBy: 'oldest',
      };

    case 'name_asc':
      return {
        field: 'name',
        sortBy: 'name_asc',
      };

    case 'name_desc':
      return {
        field: 'name',
        sortBy: 'name_desc',
      };

    case 'relevance':
      return {
        field: '',
        sortBy: 'relevance',
      }

    case 'newest':
      return {
        field: 'created_at',
        sortBy: 'newest',
      }
      
    default:
      return {
        field: '',
        sortBy: 'relevance',
      };
    }
  };


  const sortParams = getSortParams(sortBy);

  const {
    data,
    isError,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteStores({
    limit: ITEMS_PER_PAGE,
    search: searchQuery,
    sortBy: sortParams.sortBy,
    field: sortParams.field,
  });


  const stores = useMemo(
    () =>
      data?.pages?.flatMap((page) => page?.data?.stores || []) || [],
    [data]
  );

  const pagination = data?.pages?.[0]?.data?.pagination || {
    total: 0,
  };

  const handleSearch = useCallback(
    (query) => {
      const params = new URLSearchParams();

      if (query.trim()) {
        params.set('search', query.trim());
      }

      router.push(`?${params.toString()}`);
    },
    [router]
  );

  const handleSearchResults = useCallback(
    (query) => {
      handleSearch(query);
    },
    [handleSearch]
  );

  const handleContactClick = useCallback((store) => {
  if (store.phone) {
    window.location.href = `tel:${store.phone}`;
  }
}, []);

const handleDirectionClick = useCallback((store) => {
  const address = [
    store.addressLine1,
    store.addressLine2,
    store.city,
    store.state,
    store.pincode,
  ]
    .filter(Boolean)
    .join(', ');

  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`;

  window.open(url, '_blank');
}, []);


  const handleStoreClick = useCallback((store) => {
    setSelectedStoreId((prev) =>
      prev === store.uid ? null : store.uid
    );
  }, []);

  const transformStore = useCallback((store) => {
    const location = [
      store.city,
      store.state,
      store.pincode,
    ]
      .filter(Boolean)
      .join(', ');

    return {
      id: store.uid,
      title: store.name,
      subtitle: store.googleAddress || location,
      slug: store.slug,
      searchableFields: ['title', 'subtitle'],
    };
  }, []);

  const highlightText = (text, indices) => {
    if (!indices?.length) return text;

    let result = '';
    let lastIndex = 0;

    indices.forEach(([start, end]) => {
      result += text.slice(lastIndex, start);
      result += `<span class="search-highlight">${text.slice(
        start,
        end + 1
      )}</span>`;
      lastIndex = end + 1;
    });

    result += text.slice(lastIndex);

    return result;
  };

  const renderStoreResult = useCallback((item) => {
    if (item.isRecent) {
      return (
        <>
          <RiTimeLine className="recent-icon" />
          <span className="suggestion-text">
            {item.title}
          </span>
        </>
      );
    }

    return (
      <>
        <div className="suggestion-icon">
          <RiStoreLine />
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

          <span className="suggestion-meta">
            {item.subtitle}
          </span>
        </div>
      </>
    );
  }, []);

  if (!isLoading && isError) {
    return (
      <WrapperComponent
        classes={{
          sectionClass:
            'store-finder-section section-b-space',
        }}
      >
        <div className="store-finder-container">
          <h1 className="store-finder-title">
            Find Stores Nearby
          </h1>
          <div className="error-message">
            Failed to load stores.
          </div>
        </div>
      </WrapperComponent>
    );
  }

  return (
    <WrapperComponent
      classes={{
        sectionClass:
        'clinic-finder-section section-b-space',
      }}
    >
      <div className="clinic-finder-containe">
        <div className="clinic-finder-header">
          <h1 className="clinic-finder-title">
            Find Stores Nearby
          </h1>
          <h2 className="sr-only">This is a store finder page.</h2>
          <p className="clinic-finder-subtitle">
            Search our stores by name, city, or pincode.
            View contact details and locate the nearest
            store.
          </p>
        </div>

        <div className="clinic-finder-search">
          <Row className="g-2 g-md-4">
            <Col lg={8} md={8}>
              <CommonSearchBar
                storageKey="recent_store_searches"
                placeholderWords={[
                  'Store Name',
                  'City',
                  'Pincode',
                ]}
                searchLabel="Search Stores"
                enableFuzzyMatch
                autoSearch={false}
                fetchResults={fetchStoreSuggestions}
                transformResults={transformStore}
                renderResultItem={renderStoreResult}
                onSearch={handleSearchResults}
                initialValue={searchQuery}
              />
            </Col>

            <Col lg={4} md={4}>
              <CustomDropdown
                value={sortBy}
                options={SORT_OPTIONS}
                onChange={(value) => {
                  setSortBy(value);

                  const params = new URLSearchParams(
                    searchParams.toString()
                  );

                  params.set('sortBy', value);

                  router.push(`?${params.toString()}`, {
                    scroll: false,
                  });
                }}
                className="h-100"
              />
            </Col>
          </Row>
        </div>

        {/* <div className="clinic-results-info">
          <p className="results-count">
            Showing {stores.length} of {pagination.total}{' '}
            store
            {pagination.total !== 1 ? 's' : ''}
          </p>
        </div> */}

        <div className="clinic-grid">
          <StoreList
            stores={stores}
            selectedStoreId={selectedStoreId}
            onStoreClick={handleStoreClick}
            totalStores={pagination.total}
            isLoading={isLoading}
            onContactClick={handleContactClick}
            onDirectionClick={handleDirectionClick}
          />
        </div>

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
          ) : stores.length > 0 ? (
            <p className="text-muted mb-0">No more stores to load.</p>
          ) : null}
        </div>
      </div>
    </WrapperComponent>
  );
};

export default StoreFinderPage;





// 'use client';

// import { useState, useCallback, useEffect, useRef } from 'react';
// import { useRouter, useSearchParams, usePathname } from 'next/navigation';
// import { RiStoreLine, RiSearchLine, RiTimeLine } from 'react-icons/ri';
// import WrapperComponent from '../common/WrapperComponent';
// import CommonSearchBar from '../common/CommonSearchBar';
// import StoreList from './StoreList';
// import StoreMap from './StoreMap';
// import { useStores } from '@/utils/hooks/useStores';
// import { fetchStoreSuggestions } from '@/api/stores.api';
// import Loader from '@/layout/loader';

// const StoreFinderPage = () => {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   const searchQuery = searchParams.get('search') || '';
//   const storeIdParam = searchParams.get('storeId');
//   const [selectedStoreId, setSelectedStoreId] = useState(storeIdParam || null);
//   const isSearchUpdateRef = useRef(false);

//   // Clear search from URL on page refresh so the finder starts fresh
//   useEffect(() => {
//     const navEntry = performance.getEntriesByType('navigation')[0];
//     const isReload = navEntry?.type === 'reload';

//     if (!isReload || !searchParams.get('search')) {
//       return;
//     }

//     const newParams = new URLSearchParams(searchParams.toString());
//     newParams.delete('search');
//     const query = newParams.toString();
//     router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
//     // Only run on initial mount (page refresh)
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Fetch stores based on search query
//   const { data: response, isLoading } = useStores(searchQuery, 15);

//   const stores = response?.data?.stores || [];
//   const pagination = response?.data?.pagination || {};

//   // Handle store selection from list
//   const handleStoreClick = useCallback((store) => {
//     setSelectedStoreId((prev) => (prev === store.uid ? null : store.uid));
//   }, []);

//   // Handle marker click from map
//   const handleMarkerClick = useCallback((store) => {
//     setSelectedStoreId(store.uid);
//   }, []);

//   // Update only storeId query param when store selection changes.
//   // Search query is managed in handleSearch.
//   useEffect(() => {
//     if (isSearchUpdateRef.current) {
//       isSearchUpdateRef.current = false;
//       return;
//     }

//     const newParams = new URLSearchParams(searchParams.toString());

//     if (selectedStoreId) {
//       newParams.set('storeId', selectedStoreId);
//     } else {
//       newParams.delete('storeId');
//     }

//     const query = newParams.toString();
//     const nextUrl = query ? `${pathname}?${query}` : pathname;
//     const currentUrl = searchParams.toString()
//       ? `${pathname}?${searchParams.toString()}`
//       : pathname;

//     if (nextUrl !== currentUrl) {
//       router.push(nextUrl, { scroll: false });
//     }
//   }, [selectedStoreId, router, pathname, searchParams]);

//   // Keep selected state aligned with URL when browser navigation changes query param
//   useEffect(() => {
//     setSelectedStoreId(storeIdParam || null);
//   }, [storeIdParam]);

//   // Handle search from search bar
//   const handleSearch = useCallback(
//     (query) => {
//       isSearchUpdateRef.current = true;
//       setSelectedStoreId(null);

//       const newParams = new URLSearchParams();
//       const trimmedQuery = query.trim();

//       if (trimmedQuery) {
//         newParams.set('search', trimmedQuery);
//       }

//       const queryString = newParams.toString();
//       router.push(queryString ? `${pathname}?${queryString}` : pathname, {
//         scroll: false,
//       });
//     },
//     [router, pathname]
//   );

//   // Handle search results from CommonSearchBar
//   const handleSearchResults = useCallback(
//     (query) => {
//       handleSearch(query);
//     },
//     [handleSearch]
//   );

//   // Transform store API results for CommonSearchBar
//   const transformStore = useCallback((store) => {
//     const locationParts = [store.city, store.state, store.pincode].filter(
//       Boolean
//     );

//     return {
//       id: store.uid,
//       title: store.name,
//       subtitle: store.googleAddress || locationParts.join(', '),
//       slug: store.slug,
//       searchableFields: ['title', 'subtitle'],
//     };
//   }, []);

//   // Custom render for store search results
//   const renderStoreResult = useCallback((item, index) => {
//     if (item.isRecent) {
//       return (
//         <>
//           <RiTimeLine className="recent-icon" aria-hidden="true" />
//           <span className="suggestion-text">{item.title}</span>
//         </>
//       );
//     }

//     return (
//       <>
//         <div className="suggestion-icon">
//           <RiStoreLine aria-hidden="true" />
//         </div>
//         <div className="suggestion-content">
//           <span className="suggestion-text">
//             {item.highlightMatches?.title ? (
//               <span
//                 dangerouslySetInnerHTML={{
//                   __html: highlightText(
//                     item.title,
//                     item.highlightMatches.title
//                   ),
//                 }}
//               />
//             ) : (
//               item.title
//             )}
//           </span>
//           <span className="suggestion-meta">{item.subtitle}</span>
//         </div>
//       </>
//     );
//   }, []);

//   // Helper function to highlight matched text
//   const highlightText = (text, indices) => {
//     if (!indices || !indices.length) return text;

//     let result = '';
//     let lastIndex = 0;

//     indices.forEach(([start, end]) => {
//       result += text.slice(lastIndex, start);
//       result += `<span class="search-highlight">${text.slice(start, end + 1)}</span>`;
//       lastIndex = end + 1;
//     });

//     result += text.slice(lastIndex);
//     return result;
//   };

//   if (isLoading) {
//     return <Loader />;
//   }

//   return (
//     <>
//       <WrapperComponent
//         classes={{ sectionClass: 'store-finder-section section-b-space' }}
//       >
//         <div className="store-finder-container">
//           <div className="store-finder-header">
//             <h1 className="store-finder-title">Find Stores Nearby</h1>
//             <p className="store-finder-subtitle">
//               Search and find our stores near you. Browse by Store Name, City,
//               and Pincode. Get contact information and directions to our stores.
//             </p>
//           </div>
          
//           <div className="store-finder-grid">
//             {/* Left Panel - Map */}
//             <div className="store-finder-map">
//               <StoreMap
//                 stores={stores}
//                 selectedStoreId={selectedStoreId}
//                 onMarkerClick={handleMarkerClick}
//               />
//             </div>

//             {/* Right Panel - Search & Results */}
//             <div className="store-finder-sidebar">
//               <CommonSearchBar
//                 storageKey="recent_store_searches"
//                 placeholderWords={['store name', 'city', 'pincode']}
//                 searchLabel="Search stores"
//                 enableFuzzyMatch={true}
//                 autoSearch={false}
//                 fetchResults={fetchStoreSuggestions}
//                 transformResults={transformStore}
//                 renderResultItem={renderStoreResult}
//                 onSearch={handleSearchResults}
//                 initialValue={searchQuery}
//               />

//               {/* Store Results List */}
//               <StoreList
//                 stores={stores}
//                 selectedStoreId={selectedStoreId}
//                 onStoreClick={handleStoreClick}
//                 totalStores={pagination.total}
//               />
//             </div>
//           </div>
//         </div>
//       </WrapperComponent>
//     </>
//   );
// };

// export default StoreFinderPage;
