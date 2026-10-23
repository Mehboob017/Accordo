'use client';

import { useEffect } from 'react';
import { unlockOrderSuccessSound } from '@/utils/orderSuccessSound';

const AudioUnlockProvider = ({ children }) => {
  useEffect(() => {
    let unlocked = false;

    const unlock = async () => {
      if (unlocked) return;

      const success = await unlockOrderSuccessSound();

      if (success) {
        unlocked = true;

        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('touchstart', unlock);
        window.removeEventListener('keydown', unlock);
      }
    };

    window.addEventListener('pointerdown', unlock, {
      passive: true,
      once: false,
    });

    window.addEventListener('touchstart', unlock, {
      passive: true,
      once: false,
    });

    window.addEventListener('keydown', unlock, {
      passive: true,
      once: false,
    });

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  return children;
};

export default AudioUnlockProvider;