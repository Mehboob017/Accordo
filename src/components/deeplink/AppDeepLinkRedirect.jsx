'use client';

import { useEffect } from 'react';
import { PLAY_STORE_URL } from '@/lib/app-deeplink';

export default function AppDeepLinkRedirect({ appUrl, label = 'SDL India' }) {
  useEffect(() => {
    if (!appUrl) return;
    window.location.replace(appUrl);
  }, [appUrl]);

  if (!appUrl) {
    return (
      <main style={styles.main}>
        <p style={styles.text}>Invalid link.</p>
      </main>
    );
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.title}>Opening {label}…</h1>
      <p style={styles.text}>
        If the app does not open automatically, tap the button below.
      </p>
      <a href={appUrl} style={styles.button}>
        Open in app
      </a>
      <p style={styles.footer}>
        Don&apos;t have the app?{' '}
        <a href={PLAY_STORE_URL} style={styles.link}>
          Get it on Google Play
        </a>
      </p>
    </main>
  );
}

const styles = {
  main: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    textAlign: 'center',
    fontFamily: 'system-ui, sans-serif',
    backgroundColor: '#fff',
    color: '#1a1a1a',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: '12px',
  },
  text: {
    fontSize: '0.95rem',
    color: '#555',
    marginBottom: '20px',
    maxWidth: '320px',
  },
  button: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#2d6a4f',
    color: '#fff',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 600,
    marginBottom: '24px',
  },
  footer: {
    fontSize: '0.875rem',
    color: '#666',
  },
  link: {
    color: '#2d6a4f',
    fontWeight: 500,
  },
};
