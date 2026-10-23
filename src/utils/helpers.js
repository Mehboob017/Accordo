
import { GoogleMapsContext, MapsStatus } from '@/helper/mapsContext/context';
import { useContext, useEffect, useState } from 'react';
import { SDL_BASE_URL } from '@/utils/constants';

export { MapsStatus };

export const buildProductUrl = (slug) => {
  if (typeof window === 'undefined') return '';
  const baseUrl = window.location.origin;
  return slug ? `${baseUrl}/products/${slug}` : baseUrl;
};

export const getShareLinks = (productUrl, productName = '') => ({
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
  twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(productName)}`,
  whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${productName} ${productUrl}`)}`,
  linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(productUrl)}`,
});

export const openShareWindow = (url, onClose) => {
  if (!url) return;
  window.open(url, '_blank');
  if (typeof onClose === 'function') onClose();
};

export const copyLinkToClipboard = (text, onCopy) => {
  if (typeof navigator === 'undefined' || !text) return;
  navigator.clipboard.writeText(text);
  if (typeof onCopy === 'function') onCopy();
};

let googleMapsPromise = null;

export function loadGoogleMaps(apiKey, libraries = ["places"]) {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps) return Promise.resolve();

  if (!googleMapsPromise) {
    googleMapsPromise = new Promise((resolve, reject) => {
      // Check for an already appended script
      const existingScript = document.querySelector(
        'script[src^="https://maps.googleapis.com/maps/api/js"]'
      );

      if (existingScript) {
        if (window.google?.maps) {
          resolve();
        } else {
          existingScript.addEventListener("load", () => resolve());
          existingScript.addEventListener("error", (err) => reject(err));
        }
        return;
      }

      // ── Modern, Recommended Loading Pattern ──
      // Define a transient global callback named '__initGoogleMaps' 
      // which Google Maps will invoke once it executes completely.
      window.__initGoogleMaps = () => {
        delete window.__initGoogleMaps;
        resolve();
      };

      const script = document.createElement("script");
      // Appended loading=async and callback params to satisfy the best practices
      const scriptUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(",")}&loading=async&callback=__initGoogleMaps`;

      script.src = scriptUrl;
      script.async = true;
      script.onerror = (err) => {
        delete window.__initGoogleMaps;
        reject(err);
      };

      document.head.appendChild(script);
    });
  }

  return googleMapsPromise;
};

export const useGoogleMapsStatus = () => {
  return useContext(GoogleMapsContext) || MapsStatus.LOADING;
};


export function useGooglePlaces({ inputRef, country, onSelect }) {
  useEffect(() => {
    if (!inputRef.current || !window.google?.maps?.places) return;

    let autocompleteInstance = null;

    try {
      // Intentionally matching 'address' type and scoping elements reduces API hits
      autocompleteInstance = new google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['address'],
          componentRestrictions: { country },
          // CRITICAL FOR QUOTA SAVING: Fetch only the specific fields you actually parse.
          // Excluding heavy data structures like reviews or complete photos saves major billing costs.
          fields: ['address_components', 'geometry', 'icon', 'name', 'place_id', 'formatted_address'],
        }
      );

      const listener = autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace();
        if (place && place.geometry) {
          const parsed = parseGooglePlace(place);
          onSelect(parsed);
        }
      });

      // Cleanup logic ensures elements aren't re-bound on every slight component render
      return () => {
        if (google.maps.event && listener) {
          google.maps.event.removeListener(listener);
        }
        // Clears background DOM listeners attached by Google API
        const pacContainers = document.querySelectorAll('.pac-container');
        pacContainers.forEach(container => container.remove());
      };
    } catch (error) {
      console.error('[GooglePlaces] Initialization error:', error);
    }
  }, [country, onSelect, inputRef]);
}

export function parseGooglePlace(place) {
  const get = (type) => place.address_components?.find((c) => c.types.includes(type))?.long_name || '';

  const plusCode = get('plus_code');
  const name = place.name || '';
  const subpremise = get('subpremise');
  const premise = get('premise');
  const streetNumber = get('street_number');
  const route = get('route');

  const neighborhood = get('neighborhood');
  const sublocalityLevel5 = get('sublocality_level_5');
  const sublocalityLevel4 = get('sublocality_level_4');
  const sublocalityLevel3 = get('sublocality_level_3');
  const sublocalityLevel2 = get('sublocality_level_2');
  const sublocalityLevel1 = get('sublocality_level_1');

  const parsed = {
    premise,
    sublocalityLevel5,
    sublocalityLevel4,
    sublocalityLevel3,
    sublocalityLevel2,
    sublocalityLevel1,
    plus_code: plusCode,
    subpremise,
    neighborhood,
    route,
    street_number: streetNumber,

    address1: [
      plusCode,
      name,
      subpremise,
      premise,
      streetNumber,
      route,
    ]
      .filter(Boolean)
      .join(', '),

    address2: [
      neighborhood,
      sublocalityLevel5,
      sublocalityLevel4,
      sublocalityLevel3,
      sublocalityLevel2,
      sublocalityLevel1,
    ]
      .filter(Boolean)
      .join(', '),

    city: get('locality'),
    state: get('administrative_area_level_1'),
    country: get('country'),
    pincode: get('postal_code'),

    latitude: place.geometry?.location?.lat
      ? place.geometry.location.lat()
      : null,
    longitude: place.geometry?.location?.lng
      ? place.geometry.location.lng()
      : null,

    placeId: place.place_id,
    googleAddress: place.formatted_address,
    mainText: name,
  };

  return parsed;
};

export const formatDate = (dateString) => {
  // console.log('[formatDate] Formatting date string:', dateString);
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const formatDateLong = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatDateNew = (
  date,
  options = {},
  locale = 'en-IN'
) => {
  if (!date) return null;

  const d = new Date(date);

  if (isNaN(d.getTime())) return null;

  return d.toLocaleString(locale, options);
};

/**
 * Upload a file to S3 using presigned URL
 * @param {File} file - The file to upload
 * @param {string} folder - The S3 folder path (e.g., "SDL/profile", "SDL/documents")
 * @returns {Promise<string>} The S3 key of the uploaded file
 */
export const uploadFileToS3 = async (file, folder = "SDL/uploads") => {
  if (!file || !(file instanceof File)) {
    throw new Error("Invalid file provided for upload");
  }

  const response = await fetch(
    `${SDL_BASE_URL}/get-presigned-url`,
    {
      method: "POST",
      cache: 'no-store',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        folder: folder,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get presigned URL: ${response.statusText}`);
  }

  const responseData = await response.json();
  const { presignedUrl, key } = responseData;

  if (!presignedUrl || !key) {
    throw new Error("Invalid presigned URL response");
  }

  // 2) Upload file to S3 using presigned URL
  const uploadRes = await fetch(presignedUrl, {
    method: "PUT",
    cache: 'no-store',
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error(`Failed to upload file to S3: ${uploadRes.statusText}`);
  }

  return key;
};

export const formatAddress = (address) => {
  if (!address) return '';

  return `${address.addressLine1}, ${address.addressLine2 ? `${address.addressLine2}, ` : ''}${address.landmark ? `${address.landmark}, ` : ''}${address.city}, ${address.state} - ${address.pincode}, ${address.country}`.replace(/\s+/g, ' ').trim();
};

export const convertToRupees = (value) => {
  const amount = Number(value);
  return `₹ ${amount.toFixed(2)}`;
};

export const formatReviewCount = (value) => {
  if (value < 1000) return String(value);

  if (value < 100000) {
    // 1,000 → 1k | 99,999 → 99.9k
    return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  }

  if (value < 10000000) {
    // 1,00,000 → 1L | 9,99,999 → 9.9L
    return `${(value / 100000).toFixed(value % 100000 === 0 ? 0 : 1)}L`;
  }

  // 1,00,00,000+ → M
  return `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}M`;
};

export const getInitials = (name) => {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

export const handleShare = async (platform = 'native') => {
  const currentUrl = window.location.href;
  const title = document.title;

  // Native Share API
  if (platform === 'native' && navigator.share) {
    try {
      await navigator.share({
        title,
        text: title,
        url: currentUrl,
      });
      return;
    } catch (err) {
      // User cancelled
      return;
    }
  }

  const url = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(title);

  let shareUrl = '';

  switch (platform) {
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      break;

    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${url}`;
      break;

    case 'linkedin':
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
      break;

    case 'whatsapp':
      shareUrl = `https://wa.me/?text=${encodedTitle}%20${url}`;
      break;

    case 'email':
      window.location.href = `mailto:?subject=${encodedTitle}&body=${encodedTitle}%0A${url}`;
      return;

    default:
      return;
  }

  window.open(shareUrl, '_blank', 'noopener,noreferrer');
};

export const getProductImageUrl = (imageValue) => {
  if (!imageValue) {
    return '';
  }

  if (typeof imageValue === 'string') {
    return imageValue;
  }

  if (typeof imageValue === 'object') {
    return imageValue.original_url || imageValue.url || imageValue.src || '';
  }

  return '';
};

export const getOptimizedCdnImageUrl = (
  imageValue,
  width = 400,
  height = 400,
  quality = 80
) => {
  const url = getProductImageUrl(imageValue);
  if (!url || typeof url !== 'string') {
    return '';
  }

  if (url.includes('assets.sdlindia.com')) {
    try {
      const parsedUrl = new URL(url);
      if (!parsedUrl.searchParams.has('resize.width')) {
        parsedUrl.searchParams.set('resize.width', String(width));
        parsedUrl.searchParams.set('resize.height', String(height));
        parsedUrl.searchParams.set('resize.fit', 'inside');
        parsedUrl.searchParams.set('format', 'webp');
        parsedUrl.searchParams.set('quality', String(quality));
      }
      return parsedUrl.toString();
    } catch {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}resize.width=${width}&resize.height=${height}&resize.fit=inside&format=webp&quality=${quality}`;
    }
  }

  return url;
};