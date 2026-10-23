'use client';

import { loadGoogleMaps } from '@/utils/helpers';
import { useEffect, useState } from 'react';
import { GoogleMapsContext, MapsStatus } from './context';

export const GoogleMapsProvider = ({ children }) => {
  const [mapsStatus, setMapsStatus] = useState(MapsStatus.LOADING);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_MAPS_API_KEY;

    if (!apiKey) {
      setMapsStatus(MapsStatus.FAILED);
      return;
    }

    loadGoogleMaps(apiKey, ['places'])
      .then(() => {
        setMapsStatus(MapsStatus.READY);
      })
      .catch(() => {
        setMapsStatus(MapsStatus.FAILED);
      });
  }, []);

  return (
    <GoogleMapsContext.Provider value={mapsStatus}>
      {children}
    </GoogleMapsContext.Provider>
  );
};
