'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { captureFbclid, trackMetaEvent } from '@/utils/metaPixel';

export default function MetaPixelTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstMount = useRef(true);

  // Capture fbclid once on mount if user arrived from an ad
  useEffect(() => {
    captureFbclid();
  }, []);

  // Track PageView on client-side route changes
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return; // Initial page load PageView is tracked by the layout script
    }

    trackMetaEvent('PageView');
  }, [pathname, searchParams]);

  return null;
}
