import { useEffect, useRef, useState } from 'react';

const STATUS_MESSAGES = {
  OVER_QUERY_LIMIT: 'You have exceeded your rate-limit for this API. Please try again later.',
  REQUEST_DENIED: 'Address search unavailable.',
  INVALID_REQUEST: 'Invalid search request.',
  ZERO_RESULTS: 'No results were found. Try a different search term.',
};

export const useGooglePlacesPredictions = (query, country) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const serviceRef = useRef(null);
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    // console.log('[useGooglePlacesPredictions] Query changed:', { query, country });
    
    if (!query?.trim()) {
      // console.log('[useGooglePlacesPredictions] Empty query, clearing results');
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    if (!window.google?.maps?.places) {
      console.error('[useGooglePlacesPredictions] ❌ Maps service not loaded');
      setError('Maps service not loaded');
      setLoading(false);
      return;
    }

    if (!serviceRef.current) {
      // console.log('[useGooglePlacesPredictions] Creating new AutocompleteService');
      serviceRef.current = new google.maps.places.AutocompleteService();
    }

    const currentRequestId = ++requestIdRef.current;
    // console.log('[useGooglePlacesPredictions] 🔍 Starting prediction request #' + currentRequestId);
    setLoading(true);
    setError(null);

    serviceRef.current.getPlacePredictions(
      {
        input: query,
        componentRestrictions: { country },
      },
      (predictions, status) => {
        // console.log('[useGooglePlacesPredictions] API Response:', { 
        //   requestId: currentRequestId, 
        //   status, 
        //   predictionsCount: predictions?.length || 0,
        //   mounted: mountedRef.current,
        //   predictions
        // });
        
        if (currentRequestId !== requestIdRef.current) {
          // console.log('[useGooglePlacesPredictions] ⚠️ Stale request, ignoring');
          return;
        }

        if (!mountedRef.current) {
          // console.log('[useGooglePlacesPredictions] ⚠️ Component unmounted, ignoring response');
          return;
        }

        setLoading(false);

        if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          // console.log('[useGooglePlacesPredictions] ℹ️ Zero results returned');
          setResults([]);
          setError('No results were found. Try a different search term.');
          return;
        }

        if (status !== google.maps.places.PlacesServiceStatus.OK) {
          console.error('[useGooglePlacesPredictions] ❌ API Error:', status);
          const errorMessage = STATUS_MESSAGES[status] || 'Unable to fetch addresses';
          // console.log('[useGooglePlacesPredictions] Error message:', errorMessage);
          setResults([]);
          setError(errorMessage);
          return;
        }

        // console.log('[useGooglePlacesPredictions] ✅ Success, predictions:', predictions);
        setResults(predictions || []);
        setError(null);
      }
    );
  }, [query, country]);

  return {
    results,
    loading,
    error,
    isAvailable: !error,
  };
};
