'use client';

import { useLanguage } from '@/helper/languageContext/LanguageContextProvider';
import styles from './LanguageDropdown.module.scss';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'mr', label: 'Marathi' },
];

export default function LanguageDropdown() {
  const { currentCode, setCurrentCode } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isOpen, setIsOpen] = useState(false);
  const initialized = useRef(false);
  const dropdownRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const selected =
      LANGUAGES.find((l) => l.code === currentCode)?.label || 'English';
    setSelectedLanguage(selected);
  }, [currentCode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!pathname.startsWith('/blogs/')) return;

    if (initialized.current) return;
    initialized.current = true;

    if (!window.__gtPatched) {
      window.__gtPatched = true;
      const origRemoveChild = Element.prototype.removeChild;
      const origReplaceChild = Element.prototype.replaceChild;

      Element.prototype.removeChild = function (child) {
        try {
          if (child && child.parentNode !== this) {
            return child;
          }
          return origRemoveChild.call(this, child);
        } catch {
          return child;
        }
      };

      Element.prototype.replaceChild = function (newChild, oldChild) {
        try {
          if (oldChild && oldChild.parentNode !== this) {
            return oldChild;
          }
          return origReplaceChild.call(this, newChild, oldChild);
        } catch {
          return oldChild;
        }
      };
    }

    if (!document.getElementById('google_translate_element')) {
      const div = document.createElement('div');
      div.id = 'google_translate_element';
      div.style.display = 'none';
      document.body.appendChild(div);
    }

    if (typeof window.googleTranslateElementInit !== 'function') {
      window.googleTranslateElementInit = () => {
        if (!window.google?.translate?.TranslateElement) return;
        if (window.__gtElementInited) return;
        window.__gtElementInited = true;

        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,hi,mr',
            autoDisplay: false,
          },
          'google_translate_element'
        );
      };
    }

    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src =
        'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

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

  const handleLanguageChange = (code) => {
    if (typeof window === 'undefined') return;

    applyChange(code);
    setCurrentCode(code);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`notranslate ${styles.languageDropdown}`} ref={dropdownRef}>
      {isOpen && (
        <div className={`notranslate ${styles.dropdownMenu}`}>
          <ul className={styles.dropdownList}>
            {LANGUAGES.map((lang) => (
              <li key={lang.code}>
                <button
                  type="button"
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`notranslate ${styles.dropdownItem}`}
                >
                  {lang.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => setIsOpen((p) => !p)}
        className={`notranslate ${styles.languageButton}`}
      >
        {selectedLanguage}

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          className={styles.arrowIcon}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m5 9 7 7 7-7" />
        </svg>
      </button>
    </div>
  );
}
