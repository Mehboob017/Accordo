'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useGoogleMapsStatus, MapsStatus } from '@/utils/helpers';
import { GoogleMapsProvider } from '@/helper/mapsContext/googleMapsProvider';

// Default center (Mumbai)
const DEFAULT_CENTER = { lat: 19.076, lng: 72.8777 };
const DEFAULT_ZOOM = 11;

const StoreMap = ({ stores = [], selectedStoreId, onMarkerClick }) => {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef({});
  const infoWindowRef = useRef(null);
  const mapsStatus = useGoogleMapsStatus();

  // Calculate bounds from stores
  const bounds = useMemo(() => {
    if (stores.length === 0 || !window.google?.maps) return null;

    const validStores = stores.filter((s) => s.latitude && s.longitude);
    if (validStores.length === 0) return null;

    const bounds = new window.google.maps.LatLngBounds();
    validStores.forEach((store) => {
      bounds.extend({
        lat: parseFloat(store.latitude),
        lng: parseFloat(store.longitude),
      });
    });

    return bounds;
  }, [stores]);

  // Initialize Google Map
  useEffect(() => {
    if (mapsStatus !== MapsStatus.READY || !mapRef.current || googleMapRef.current) {
      return;
    }

    googleMapRef.current = new window.google.maps.Map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: window.google.maps.ControlPosition.TOP_RIGHT,
        mapTypeIds: ['roadmap', 'satellite', 'hybrid'],
      },
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
    });

    // Initialize info window
    infoWindowRef.current = new window.google.maps.InfoWindow();
  }, [mapsStatus]);

  // Create custom marker icon
  const getMarkerIcon = (isSelected) => {
    return {
      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      fillColor: isSelected ? '#0DA487' : '#2563EB',
      fillOpacity: 1,
      strokeColor: '#fefefe',
      strokeWeight: 2,
      scale: 1.5,
      anchor: new window.google.maps.Point(12, 22),
    };
  };

  // Format address for info window
  const formatAddress = (store) => {
    const parts = [
      store.addressLine1,
      store.addressLine2,
      store.city,
      store.pincode,
    ].filter(Boolean);
    return parts.join(', ');
  };

  // Get directions URL
  const getDirectionsUrl = (store) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
  };

  // Create info window content
  const createInfoWindowContent = (store) => {
    return `
      <div class="store-popup">
        <div class="popup-content">
          <h4 class="popup-title">${store.name}</h4>
          ${store.phone ? `<p class="popup-phone"><a href="tel:${store.phone}">${store.phone}</a></p>` : ''}
          ${store.email ? `<p class="popup-email"><a href="mailto:${store.email}">${store.email}</a></p>` : ''}
          <p class="popup-address">${formatAddress(store)}</p>
          <a
            href="${getDirectionsUrl(store)}"
            target="_blank"
            rel="noopener noreferrer"
            class="popup-directions"
          >
            Directions
          </a>
        </div>
      </div>
    `;
  };

  // Update markers when stores change
  useEffect(() => {
    if (!googleMapRef.current || mapsStatus !== MapsStatus.READY) return;

    // Remove markers that are no longer in stores
    Object.keys(markersRef.current).forEach((uid) => {
      if (!stores.find((s) => s.uid === uid)) {
        markersRef.current[uid].setMap(null);
        delete markersRef.current[uid];
      }
    });

    // Add or update markers for current stores
    stores.forEach((store) => {
      if (!store.latitude || !store.longitude) return;

      const position = {
        lat: parseFloat(store.latitude),
        lng: parseFloat(store.longitude),
      };

      if (markersRef.current[store.uid]) {
        // Update existing marker
        markersRef.current[store.uid].setPosition(position);
      } else {
        // Create new marker
        const marker = new window.google.maps.Marker({
          position,
          map: googleMapRef.current,
          title: store.name,
          icon: getMarkerIcon(false),
        });

        // Add click listener
        marker.addListener('click', () => {
          onMarkerClick(store);
          infoWindowRef.current.setContent(createInfoWindowContent(store));
          infoWindowRef.current.open(googleMapRef.current, marker);
        });

        markersRef.current[store.uid] = marker;
      }
    });

    // Fit bounds if we have stores
    if (bounds && stores.length > 0) {
      googleMapRef.current.fitBounds(bounds, { padding: 50 });
    }
  }, [stores, mapsStatus, bounds, onMarkerClick]);

  // Handle selected store changes
  useEffect(() => {
    if (!googleMapRef.current || mapsStatus !== MapsStatus.READY) return;

    // Update all markers to reflect selection state
    Object.entries(markersRef.current).forEach(([uid, marker]) => {
      const isSelected = uid === selectedStoreId;
      marker.setIcon(getMarkerIcon(isSelected));
    });

    // Pan to selected store and open info window
    if (selectedStoreId) {
      const selectedStore = stores.find((s) => s.uid === selectedStoreId);
      const selectedMarker = markersRef.current[selectedStoreId];

      if (selectedStore?.latitude && selectedStore?.longitude && selectedMarker) {
        const position = {
          lat: parseFloat(selectedStore.latitude),
          lng: parseFloat(selectedStore.longitude),
        };

        googleMapRef.current.panTo(position);
        googleMapRef.current.setZoom(14);

        infoWindowRef.current.setContent(createInfoWindowContent(selectedStore));
        infoWindowRef.current.open(googleMapRef.current, selectedMarker);
      }
    } else {
      // Close info window when no store is selected
      infoWindowRef.current.close();
    }
  }, [selectedStoreId, stores, mapsStatus]);

  // Cleanup markers on unmount
  useEffect(() => {
    return () => {
      Object.values(markersRef.current).forEach((marker) => {
        marker.setMap(null);
      });
      markersRef.current = {};
    };
  }, []);

  if (mapsStatus === MapsStatus.LOADING) {
    return (
      <div className="store-map-loading">
        <span>Loading map...</span>
      </div>
    );
  }

  if (mapsStatus === MapsStatus.FAILED) {
    return (
      <div className="store-map-loading">
        <span>Failed to load Google Maps. Please check your API key.</span>
      </div>
    );
  }

  return (
    <div className="store-map-container">
      <div
        ref={mapRef}
        className="store-map"
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
};

export default function StoreMapWithProvider(props) {
  return (
    <GoogleMapsProvider>
      <StoreMap {...props} />
    </GoogleMapsProvider>
  );
}
