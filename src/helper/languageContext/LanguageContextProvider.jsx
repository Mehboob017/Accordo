'use client';

import { useContext, useState } from 'react';
import LanguageContext from '.';

export function LanguageProvider({ children }) {
  const [currentCode, setCurrentCode] = useState('en');

  // Expose retriggerTranslation (you'll pass this from LanguageDropdown or manage here)
  const retriggerTranslation = () => {
    // This is a placeholder—actual logic will be injected or moved here.
    // For now, we'll move the logic to the context for global access.
    if (currentCode === 'en') return;
    const originalLang = 'en';
    const applyChange = (langCode, retries = 20) => {
      const combo = document.querySelector('.goog-te-combo');
      if (combo && langCode) {
        combo.value = langCode;
        combo.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
      if (retries > 0) {
        setTimeout(() => applyChange(langCode, retries - 1), 100);
      }
      return false;
    };
    applyChange(originalLang);
    setTimeout(() => {
      applyChange(currentCode);
    }, 1000);
  };

  // Also expose setCurrentCode if needed for sync
  return (
    <LanguageContext.Provider
      value={{ currentCode, setCurrentCode, retriggerTranslation }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
