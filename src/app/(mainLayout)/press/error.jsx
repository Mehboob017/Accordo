'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Press page error:', error);
  }, [error]);

  return (
    <div className="press-error">
      <div className="press-error__content">
        <h2 className="press-error__title">Unable to load press images</h2>

        <p className="press-error__message">
          Something went wrong while loading the press section. Please try
          again.
        </p>

        <button className="press-error__retry" onClick={reset}>
          Retry
        </button>
      </div>
    </div>
  );
}
