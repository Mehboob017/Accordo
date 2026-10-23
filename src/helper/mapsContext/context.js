import { createContext } from 'react';

export const MapsStatus = {
  READY: 'ready',
  FAILED: 'failed',
  LOADING: 'loading',
};

export const GoogleMapsContext = createContext(MapsStatus.LOADING);