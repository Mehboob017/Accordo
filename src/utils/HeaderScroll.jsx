import React, { useEffect, useState } from 'react';
export function useHeaderScroll(value) {
  const [UpScroll, setUpScroll] = useState(value);

  useEffect(() => {
    const hideAt = 72;
    const showAt = 28;

    const handleScroll = () => {
      const currentY = window.scrollY;

      setUpScroll((prev) => {
        // Use hysteresis to avoid rapid toggling near a single threshold.
        if (prev) {
          return currentY > showAt;
        }

        return currentY > hideAt;
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return UpScroll;
}
