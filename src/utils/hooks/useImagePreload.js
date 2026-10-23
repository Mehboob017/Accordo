import { useEffect, useMemo, useState } from 'react';

const IMAGE_STATUS = {
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error',
};

const imagePreloadCache = new Map();

const getCachedEntry = (src) => {
  if (!src) {
    return null;
  }

  return imagePreloadCache.get(src) ?? null;
};

const setCachedEntry = (src, entry) => {
  if (!src) {
    return;
  }

  imagePreloadCache.set(src, entry);
};

const preloadImage = (src) => {
  const cachedEntry = getCachedEntry(src);

  if (cachedEntry?.status === IMAGE_STATUS.LOADED) {
    return Promise.resolve(src);
  }

  if (cachedEntry?.status === IMAGE_STATUS.LOADING && cachedEntry.promise) {
    return cachedEntry.promise;
  }

  const promise = new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';

    img.onload = async () => {
      try {
        if (typeof img.decode === 'function') {
          await img.decode();
        }
      } catch (decodeError) {
        // Decoding failure should not block already downloaded image usage.
      }

      setCachedEntry(src, { status: IMAGE_STATUS.LOADED });
      resolve(src);
    };

    img.onerror = () => {
      setCachedEntry(src, { status: IMAGE_STATUS.ERROR });
      reject(new Error(`Unable to preload image: ${src}`));
    };

    img.src = src;
  });

  setCachedEntry(src, { status: IMAGE_STATUS.LOADING, promise });

  return promise;
};

const getInitialState = (src, fallbackSrc) => {
  const primaryEntry = getCachedEntry(src);

  if (primaryEntry?.status === IMAGE_STATUS.LOADED) {
    return {
      status: IMAGE_STATUS.LOADED,
      resolvedSrc: src,
      isFallback: false,
    };
  }

  const fallbackEntry = getCachedEntry(fallbackSrc);

  if (fallbackEntry?.status === IMAGE_STATUS.LOADED) {
    return {
      status: IMAGE_STATUS.LOADED,
      resolvedSrc: fallbackSrc,
      isFallback: true,
    };
  }

  return {
    status: src || fallbackSrc ? IMAGE_STATUS.LOADING : IMAGE_STATUS.ERROR,
    resolvedSrc: '',
    isFallback: false,
  };
};

export const useImagePreload = (src, options = {}) => {
  const fallbackSrc = options?.fallbackSrc ?? '';

  const [state, setState] = useState(() => getInitialState(src, fallbackSrc));
  
  useEffect(() => {
    let isCancelled = false;

    const setSafeState = (nextState) => {
      if (isCancelled) {
        return;
      }

      setState((prevState) => {
        if (
          prevState.status === nextState.status &&
          prevState.resolvedSrc === nextState.resolvedSrc &&
          prevState.isFallback === nextState.isFallback
        ) {
          return prevState;
        }

        return nextState;
      });
    };

    const load = async (targetSrc, allowFallback = true) => {
      if (!targetSrc) {
        if (allowFallback && fallbackSrc && fallbackSrc !== targetSrc) {
          await load(fallbackSrc, false);
          return;
        }

        setSafeState({
          status: IMAGE_STATUS.ERROR,
          resolvedSrc: '',
          isFallback: false,
        });

        return;
      }

      const cachedEntry = getCachedEntry(targetSrc);

      if (cachedEntry?.status === IMAGE_STATUS.LOADED) {
        setSafeState({
          status: IMAGE_STATUS.LOADED,
          resolvedSrc: targetSrc,
          isFallback: targetSrc === fallbackSrc && targetSrc !== src,
        });

        return;
      }

      setSafeState({
        status: IMAGE_STATUS.LOADING,
        resolvedSrc: '',
        isFallback: false,
      });

      try {
        await preloadImage(targetSrc);

        setSafeState({
          status: IMAGE_STATUS.LOADED,
          resolvedSrc: targetSrc,
          isFallback: targetSrc === fallbackSrc && targetSrc !== src,
        });
      } catch (error) {
        if (allowFallback && fallbackSrc && targetSrc !== fallbackSrc) {
          await load(fallbackSrc, false);
          return;
        }

        setSafeState({
          status: IMAGE_STATUS.ERROR,
          resolvedSrc: '',
          isFallback: false,
        });
      }
    };

    load(src, true);

    return () => {
      isCancelled = true;
    };
  }, [src, fallbackSrc]);

  return useMemo(() => {
    return {
      ...state,
      isLoaded: state.status === IMAGE_STATUS.LOADED,
      isLoading: state.status === IMAGE_STATUS.LOADING,
      isError: state.status === IMAGE_STATUS.ERROR,
    };
  }, [state]);
};

export default useImagePreload;
