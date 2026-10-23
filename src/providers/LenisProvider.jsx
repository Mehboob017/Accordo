'use client';

import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';

const MIN_DESKTOP_WIDTH = 1024;
const LOW_END_CPU_THREADS = 4;
const LOW_END_DEVICE_MEMORY_GB = 4;
const RESIZE_DEBOUNCE_MS = 120;

function shouldDisableSmoothScroll() {
  const isMobileViewport = window.innerWidth < MIN_DESKTOP_WIDTH;
  const prefersReducedMotion =
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

  // Optional low-end safeguard: avoids adding animation pressure on weaker devices.
  const hardwareThreads = navigator.hardwareConcurrency ?? 0;
  const deviceMemory = navigator.deviceMemory ?? 0;
  const isLowEndDevice =
    (hardwareThreads > 0 && hardwareThreads <= LOW_END_CPU_THREADS) ||
    (deviceMemory > 0 && deviceMemory <= LOW_END_DEVICE_MEMORY_GB);

  return isMobileViewport || prefersReducedMotion || isLowEndDevice;
}

export default function LenisProvider({ children }) {
  const lenisRef = useRef(null);
  const rafIdRef = useRef(null);
  const rafRunningRef = useRef(false);
  const resizeTimeoutRef = useRef(null);

  useEffect(() => {
    if (shouldDisableSmoothScroll()) {
      return undefined;
    }

    let destroyed = false;

    const stopRafLoop = () => {
      rafRunningRef.current = false;

      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };

    const lenis = new Lenis({
      // Lerp-based easing gives smoother, more stable frame pacing in dynamic trees.
      lerp: 0.085,
      duration: 1.2,
      easing: (t) => 1 - Math.pow(1 - t, 3.5),
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 0.9,
      touchMultiplier: 1,
      normalizeWheel: true,
    });

    lenisRef.current = lenis;
    const scrollTrigger = window.ScrollTrigger;

    if (scrollTrigger?.update) {
      // Keep ScrollTrigger in sync without involving React state updates.
      lenis.on('scroll', scrollTrigger.update);
    }

    window.lenis = lenis;

    const raf = (time) => {
      if (!rafRunningRef.current || destroyed) {
        return;
      }

      lenis.raf(time);
      rafIdRef.current = window.requestAnimationFrame(raf);
    };

    const startRafLoop = () => {
      if (rafRunningRef.current || destroyed) {
        return;
      }

      rafRunningRef.current = true;
      rafIdRef.current = window.requestAnimationFrame(raf);
    };

    const gsapTicker = window.gsap?.ticker;
    let gsapTickerCallback = null;

    if (gsapTicker?.add) {
      // When GSAP exists, use one shared ticker to avoid dueling RAF loops.
      gsapTickerCallback = (time) => {
        if (!destroyed) {
          lenis.raf(time * 1000);
        }
      };

      gsapTicker.add(gsapTickerCallback);

      if (typeof gsapTicker.lagSmoothing === 'function') {
        gsapTicker.lagSmoothing(0);
      }
    } else {
      startRafLoop();
    }

    const handleVisibilityChange = () => {
      if (gsapTickerCallback) {
        return;
      }

      if (document.hidden) {
        stopRafLoop();
      } else {
        startRafLoop();
      }
    };

    const handleResize = () => {
      if (resizeTimeoutRef.current !== null) {
        window.clearTimeout(resizeTimeoutRef.current);
      }

      // Debounced resize keeps Lenis measurements fresh without flooding the main thread.
      resizeTimeoutRef.current = window.setTimeout(() => {
        if (!destroyed && lenisRef.current) {
          lenisRef.current.resize();
        }
      }, RESIZE_DEBOUNCE_MS);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      destroyed = true;

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);

      if (resizeTimeoutRef.current !== null) {
        window.clearTimeout(resizeTimeoutRef.current);
        resizeTimeoutRef.current = null;
      }

      if (gsapTickerCallback && window.gsap?.ticker?.remove) {
        window.gsap.ticker.remove(gsapTickerCallback);
      }

      stopRafLoop();

      if (scrollTrigger?.update && typeof lenis.off === 'function') {
        lenis.off('scroll', scrollTrigger.update);
      }

      lenis.destroy();
      lenisRef.current = null;

      if (window.lenis === lenis) {
        delete window.lenis;
      }
    };
  }, []);

  return <>{children}</>;
}
