'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useUser } from '@/utils/hooks/useUser';

const ThemeContext = createContext(null);

const THEME_COOKIE_KEY = 'theme';

const getUserTheme = (userData) =>
  userData?.isDoctor ||
    userData?.role === 'Doctor' ||
    userData?.role === 'doctor'
    ? 'doctor'
    : 'customer';

const getStoredTheme = () => {
  const savedTheme = Cookies.get(THEME_COOKIE_KEY);

  return savedTheme === 'customer' || savedTheme === 'doctor'
    ? savedTheme
    : 'customer';
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { userData, isAuthenticated, isUserLoading } = useUser();
  const [theme, setThemeState] = useState('customer');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setThemeState(getStoredTheme());
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    if (isUserLoading) {
      return;
    }

    const nextTheme = isAuthenticated && userData ? getUserTheme(userData) : 'customer';

    if (theme !== nextTheme) {
      setThemeState(nextTheme);
    }

    if (Cookies.get(THEME_COOKIE_KEY) !== nextTheme) {
      Cookies.set(THEME_COOKIE_KEY, nextTheme, { expires: 365 });
    }
  }, [mounted, isAuthenticated, isUserLoading, theme, userData]);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    if (isAuthenticated && userData) {
      return;
    }

    const savedTheme = getStoredTheme();

    if (savedTheme !== theme) {
      setThemeState(savedTheme);
    }
  }, [mounted, isAuthenticated, theme, userData]);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove('theme-customer', 'theme-doctor');

    // Add current theme class
    // root.classList.add(`theme-${theme}`);
    root.classList.add(`theme-${'customer'}`);

    // Set data attribute for CSS targeting
    // root.setAttribute('data-theme', theme);
    root.setAttribute('data-theme', 'customer');
  }, [theme, mounted]);

  const setTheme = (newTheme) => {
    if (newTheme === 'customer' || newTheme === 'doctor') {
      setThemeState(newTheme);
      Cookies.set(THEME_COOKIE_KEY, newTheme, { expires: 365 });

      // Dispatch custom event for other components to react if needed
      window.dispatchEvent(
        new CustomEvent('themeChange', { detail: { theme: newTheme } })
      );
    }
  };

  const value = {
    theme,
    setTheme,
    isDoctor: theme === 'doctor',
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export default ThemeProvider;
