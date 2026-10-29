'use client';

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  RiLoader4Line,
  RiPauseLine,
  RiPlayFill,
  RiSettings3Line,
  RiVolumeUpLine,
  RiCloseLine,
  RiRestartLine,
  RiMore2Fill,
} from 'react-icons/ri';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import { useLanguage } from '@/helper/languageContext/LanguageContextProvider';

const stripHtml = (htmlString) => {
  if (!htmlString) return '';
  if (typeof window === 'undefined') return htmlString;
  const div = document.createElement('div');
  div.innerHTML = htmlString;
  return div.textContent || div.innerText || '';
};

const BlogAudioWidget = ({ title, subtitle, content }) => {
  const { themeOption } = useContext(ThemeOptionContext);
  const { currentCode } = useLanguage();
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasEnded, setHasEnded] = useState(false); // Track if speech has ended
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isSupported, setIsSupported] = useState(false);
  const [themeColor, setThemeColor] = useState('#0da487');

  const utteranceRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const restartTimeoutRef = useRef(null);
  const widgetRef = useRef(null);
  const baseDurationRef = useRef(0); // Store base duration at 1x speed
  const startTimeRef = useRef(0); // Track when playback started
  const startPositionRef = useRef(0); // Track position when playback started
  const isMountedRef = useRef(true);

  const clearRestartTimeout = () => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  };

  const teardownPlayback = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    clearRestartTimeout();
    utteranceRef.current = null;
  };

  const [domText, setDomText] = useState('');

  const textToSpeak = useMemo(() => {
    if (domText) return domText;
    const plainContent = stripHtml(content);
    return [title, subtitle, plainContent].filter(Boolean).join('. ');
  }, [title, subtitle, content, domText]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Reset playback when language or content changes
    setIsPlaying(false);
    setCurrentTime(0);
    setHasEnded(false);
    teardownPlayback();

    let attempts = 0;
    const timer = setInterval(() => {
      let extractedText = '';
      const titleEl = document.querySelector('.blog-title');
      const subtitleEl = document.querySelector('.blog-subtitle');
      const contentEl = document.querySelector('.blog-detail-contain');

      if (titleEl) extractedText += titleEl.innerText + '. ';
      if (subtitleEl) extractedText += subtitleEl.innerText + '. ';
      if (contentEl) extractedText += contentEl.innerText;

      extractedText = extractedText.trim();

      if (extractedText) {
        setDomText(prev => prev !== extractedText ? extractedText : prev);
      }

      attempts++;
      if (attempts >= 20) { // Check for up to 10 seconds
        clearInterval(timer);
      }
    }, 500);

    return () => clearInterval(timer);
  }, [currentCode, title, subtitle, content]);

  const getLangCode = () => {
    if (currentCode === 'hi') return 'hi-IN';
    if (currentCode === 'mr') return 'mr-IN';
    return 'en-IN';
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      teardownPlayback();
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasSupport = 'speechSynthesis' in window;
    setIsSupported(hasSupport);
    if (!hasSupport) return;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);

      let preferredLangCode = 'en-IN';
      if (currentCode === 'hi') preferredLangCode = 'hi-IN';
      if (currentCode === 'mr') preferredLangCode = 'mr-IN';

      // 1. Try to find the exact language, prioritizing Google/Natural/Premium voices
      let exactMatch = available.find(
        (v) =>
          (v.lang?.includes(preferredLangCode) ||
            (currentCode === 'hi' && v.name?.toLowerCase().includes('hindi')) ||
            (currentCode === 'mr' && v.name?.toLowerCase().includes('marathi'))) &&
          (v.name?.includes('Google') || v.name?.includes('Natural') || v.name?.includes('Premium'))
      ) || available.find(
        (v) =>
          v.lang?.includes(preferredLangCode) ||
          (currentCode === 'hi' && v.name?.toLowerCase().includes('hindi')) ||
          (currentCode === 'mr' && v.name?.toLowerCase().includes('marathi'))
      );

      // 2. If Marathi is not found or it's not a premium voice, try to fallback to a premium Hindi voice
      // because Hindi premium voices (like Google Hindi) pronounce Devanagari script much better 
      // than basic Marathi fallback voices.
      if (currentCode === 'mr' && (!exactMatch || !(exactMatch.name?.includes('Google') || exactMatch.name?.includes('Natural') || exactMatch.name?.includes('Premium')))) {
        const premiumHindi = available.find(
          (v) =>
            (v.lang?.includes('hi-IN') || v.name?.toLowerCase().includes('hindi')) &&
            (v.name?.includes('Google') || v.name?.includes('Natural') || v.name?.includes('Premium'))
        );
        if (premiumHindi) {
          exactMatch = premiumHindi;
        } else if (!exactMatch) {
          // If no Marathi at all, and no premium Hindi, try any Hindi
          exactMatch = available.find(
            (v) => v.lang?.includes('hi-IN') || v.name?.toLowerCase().includes('hindi')
          );
        }
      }

      const defaultVoice = exactMatch || (
        available.find(v => v.lang?.includes('en-IN') || v.name?.toLowerCase().includes('indian')) ||
        available.find(v => v.lang?.startsWith('en') && (v.name?.includes('Google') || v.name?.includes('Natural') || v.name?.includes('Premium'))) ||
        available.find(v => v.lang?.startsWith('en'))
      ) || available[0];

      setSelectedVoice(exactMatch ? exactMatch : defaultVoice);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [currentCode]);

  useEffect(() => {
    if (!isSupported || !textToSpeak) return;
    initializeAudio();
    return () => {
      teardownPlayback();
    };
  }, [textToSpeak, isSupported]); // Removed speed, pitch, selectedVoice from dependencies

  useEffect(() => {
    if (typeof window === 'undefined' || !isSupported) return;
    const handlePageLeave = () => {
      teardownPlayback();
    };
    window.addEventListener('beforeunload', handlePageLeave);
    window.addEventListener('pagehide', handlePageLeave);
    return () => {
      window.removeEventListener('beforeunload', handlePageLeave);
      window.removeEventListener('pagehide', handlePageLeave);
    };
  }, [isSupported]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Get theme color from themeOption or CSS variable
    const primaryColor = themeOption?.general?.primary_color;
    if (primaryColor) {
      setThemeColor(primaryColor);
    } else {
      // Fallback to CSS variable
      const cssThemeColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--theme-color')
        .trim();
      if (cssThemeColor) {
        setThemeColor(cssThemeColor);
      }
    }
  }, [themeOption]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const styleId = 'blog-audio-widget-spinner';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes blogAudioWidgetSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  const initializeAudio = () => {
    // Calculate base duration at 1x speed and store it
    const estimatedDuration = calculateDuration(textToSpeak, 1);
    baseDurationRef.current = estimatedDuration;
    setDuration(estimatedDuration);
    setIsReady(true);
  };

  const calculateDuration = (text, rate) => {
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    return (wordCount / 150) * 60 / rate;
  };

  const playFromCurrentTime = (overrideSpeed, overridePitch, overrideTime) => {
    const activeSpeed = overrideSpeed !== undefined ? overrideSpeed : speed;
    const activePitch = overridePitch !== undefined ? overridePitch : pitch;
    const activeTime = overrideTime !== undefined ? overrideTime : currentTime;

    const words = textToSpeak.split(/\s+/);
    const wordsPerSecond = 150 / 60; // Base rate at 1x
    const wordsToSkip = Math.floor(activeTime * wordsPerSecond);
    const textFromCurrent = words.slice(wordsToSkip).join(' ');

    // Chunk text by roughly 180 characters to avoid network voice length limits
    const getChunks = (text, maxLength = 180) => {
      const wordsArr = text.split(/\s+/);
      const chunks = [];
      let currentChunk = '';
      for (const word of wordsArr) {
        if ((currentChunk + word).length > maxLength) {
          if (currentChunk) chunks.push(currentChunk.trim());
          currentChunk = word + ' ';
        } else {
          currentChunk += word + ' ';
        }
      }
      if (currentChunk) chunks.push(currentChunk.trim());
      return chunks;
    };

    const chunks = getChunks(textFromCurrent);
    if (chunks.length === 0) chunks.push('');

    const utterances = chunks.map((chunk, index) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.rate = activeSpeed;
      utterance.pitch = activePitch;
      utterance.volume = 1;
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = getLangCode();
      }

      if (index === chunks.length - 1) {
        utterance.onend = () => {
          setIsPlaying(false);
          setHasEnded(true);
          setCurrentTime(baseDurationRef.current);
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
      }
      return utterance;
    });

    utteranceRef.current = utterances; // Prevent garbage collection
    window.speechSynthesis.cancel();

    clearRestartTimeout();
    restartTimeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      utterances.forEach(u => window.speechSynthesis.speak(u));
      setIsPlaying(true);

      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      startTimeRef.current = Date.now();
      startPositionRef.current = activeTime;

      progressIntervalRef.current = setInterval(() => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          const elapsedRealSeconds = (Date.now() - startTimeRef.current) / 1000;
          const progressInBaseDuration = elapsedRealSeconds * activeSpeed;
          const newTime = Math.min(startPositionRef.current + progressInBaseDuration, baseDurationRef.current);

          setCurrentTime(newTime);

          if (newTime >= baseDurationRef.current) {
            clearInterval(progressIntervalRef.current);
          }
        }
      }, 50);
    }, 50);
  };

  const togglePlayPause = () => {
    if (!isSupported || !textToSpeak) return;

    if (hasEnded) {
      setHasEnded(false);
      setCurrentTime(0);
      playFromCurrentTime(speed, pitch, 0);
      return;
    }

    if (isPlaying) {
      teardownPlayback();
      setIsPlaying(false);
      return;
    }

    playFromCurrentTime(speed, pitch, currentTime);
  };

  const stopPlayback = () => {
    if (!isSupported) return;
    teardownPlayback();
    setIsPlaying(false);
    setHasEnded(false);
    setCurrentTime(0);
  };

  const handleSeek = (e) => {
    if (!baseDurationRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = Math.min(Math.max(percent * baseDurationRef.current, 0), baseDurationRef.current);
    setCurrentTime(newTime);
    setHasEnded(false); // Reset ended state when seeking

    const wasPlaying = isPlaying;
    teardownPlayback();

    if (wasPlaying) {
      playFromCurrentTime(speed, pitch, newTime);
    }
  };

  const changeVoice = (voice) => {
    setSelectedVoice(voice);
    if (Array.isArray(utteranceRef.current)) {
      utteranceRef.current.forEach(u => u.voice = voice);
    } else if (utteranceRef.current) {
      utteranceRef.current.voice = voice;
    }
  };

  const handleSpeedChange = (newSpeed) => {
    const wasPlaying = isPlaying;
    if (wasPlaying) {
      teardownPlayback();
      setSpeed(newSpeed);
      playFromCurrentTime(newSpeed, pitch, currentTime);
    } else {
      setSpeed(newSpeed);
    }
  };

  const handlePitchChange = (newPitch) => {
    const wasPlaying = isPlaying;
    if (wasPlaying) {
      teardownPlayback();
      setPitch(newPitch);
      playFromCurrentTime(speed, newPitch, currentTime);
    } else {
      setPitch(newPitch);
    }
  };

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  return (
    // <div
    //   ref={widgetRef}
    //   style={{
    //     position: 'relative',
    //     background: '#fefefe',
    //     border: '1px solid #0da487',
    //     borderRadius: '10px',
    //     padding: '8px 10px',
    //     boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
    //     minWidth: '280px',
    //     // maxWidth: '400px',
    //     width: '100%',
    //   }}
    //   className="blog-audio-widget"
    // >
    <div
      ref={widgetRef}
      style={{
        position: 'relative',
        background: `
          linear-gradient(#fefefe, #fefefe),
          linear-gradient(90deg, #234BF3 0%, #5eead4 50%, #0d6efd 100%)
        `,
        border: '1.5px solid transparent',
        borderRadius: '10px',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
        padding: '8px 10px',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
        minWidth: '280px',
        width: '100%',
      }}
      className="blog-audio-widget"
    >
      <div
        style={{
          display: 'flex',
          // alignItems: 'center',
          gap: '8px',
          width: '100%',
        }}
      >
        <button
          onClick={togglePlayPause}
          disabled={!isReady || !isSupported}
          aria-label={
            !isReady
              ? 'Loading audio'
              : hasEnded
                ? 'Restart audio'
                : isPlaying
                  ? 'Pause audio'
                  : 'Play audio'
          }
          style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // background: !isSupported ? '#cbd5e1' : themeColor,
            background: '#234BF3',
            border: 'none',
            borderRadius: '50%',
            cursor: isReady && isSupported ? 'pointer' : 'not-allowed',
            color: 'white',
            flexShrink: 0,
          }}
        >
          {!isReady ? (
            <RiLoader4Line
              style={{
                width: '16px',
                height: '16px',
                animation: 'blogAudioWidgetSpin 1s linear infinite',
              }}
            />
          ) : hasEnded ? (
            <RiRestartLine style={{ width: '20px', height: '20px' }} />
          ) : isPlaying ? (
            <RiPauseLine style={{ width: '20px', height: '20px' }} />
          ) : (
            <RiPlayFill style={{ width: '20px', height: '20px', marginLeft: '2px' }} />
          )}
        </button>

        {/* <button
          onClick={stopPlayback}
          disabled={!isSupported}
          style={{
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fefefe',
            border: '1px solid #e2e8f0',
            borderRadius: '50%',
            cursor: isSupported ? 'pointer' : 'not-allowed',
            color: '#64748b',
            flexShrink: 0,
          }}
          title="Stop"
        >
          <div
            style={{
              width: '10px',
              height: '10px',
              background: 'currentColor',
              borderRadius: '2px',
            }}
          />
        </button> */}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              // alignItems: 'center',
              flexDirection: 'column',
              // gap: '6px',
              marginBottom: '7px',
            }}
          >
            {/* <RiVolumeUpLine style={{ width: '14px', height: '14px', color: '#64748b' }} /> */}
            <span
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: '#07112C',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'inline-block',
              }}
            >
              Listen to the article
            </span>
            <p style={{ fontSize: '12px', color: '#6f6f6f', margin: '0px' }}>Text to speech</p>
          </div>

          <div
            onClick={handleSeek}
            style={{
              height: '3px',
              background: '#e2e8f0',
              borderRadius: '2px',
              cursor: isSupported ? 'pointer' : 'not-allowed',
              overflow: 'hidden',
              marginBottom: '3px',
            }}
          >
            <div
              style={{
                height: '100%',
                background: themeColor,
                width: `${(currentTime / baseDurationRef.current) * 100 || 0}%`,
                transition: 'width 0.1s',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '10px',
              color: '#94a3b8',
            }}
          >
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(baseDurationRef.current)}</span>
          </div>
        </div>

        <button
          onClick={() => setShowSettings((prev) => !prev)}
          disabled={!isSupported}
          style={{
            background: '#9e9e9e',
            border: 'none',
            cursor: isSupported ? 'pointer' : 'not-allowed',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            color: '#fefefe',
            flexShrink: 0,
            width: '18px',
            height: '18px',
            marginTop: '10px'
          }}
          title="Audio settings"
        >
          {/* <RiSettings3Line style={{ width: '16px', height: '16px' }} /> */}
          <RiMore2Fill style={{ width: '12px', height: '12px', flexShrink: 0 }} />
        </button>
      </div>

      {showSettings && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            padding: '10px',
            background: '#fefefe',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
            zIndex: 1000,
            // minWidth: '240px',
            // width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <h4
              style={{
                fontSize: '12px',
                fontWeight: 600,
                margin: 0,
                color: '#1e293b',
              }}
            >
              Audio settings
            </h4>
            <button
              onClick={() => setShowSettings(false)}
              style={{
                background: 'transparent',
                border: '1px solid #e2e8f0',
                borderRadius: '50%',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                color: '#64748b',
              }}
            >
              <RiCloseLine style={{ width: '14px', height: '14px' }} />
            </button>
          </div>

          {/* <div style={{ marginBottom: '8px' }}>
            <label
              style={{
                fontSize: '10px',
                fontWeight: 500,
                color: '#475569',
                display: 'block',
                marginBottom: '3px',
              }}
            >
              Voice
            </label>
            <select
              value={selectedVoice?.name || ''}
              onChange={(e) => {
                const voice = voices.find((v) => v.name === e.target.value);
                if (voice) changeVoice(voice);
              }}
              disabled={!isSupported}
              style={{
                width: '100%',
                padding: '5px 8px',
                fontSize: '12px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                background: 'white',
              }}
            >
              {voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div> */}

          <div style={{ marginBottom: '8px' }}>
            <label
              style={{
                fontSize: '10px',
                fontWeight: 500,
                color: '#07112C',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              Speed
            </label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[0.5, 1, 1.5, 2].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleSpeedChange(value)}
                  disabled={!isSupported}
                  style={{
                    padding: '4px 12px',
                    fontSize: '11px',
                    fontWeight: 500,
                    border: speed === value ? `2px solid ${themeColor}` : '1px solid #e2e8f0',
                    borderRadius: '6px',
                    background: speed === value ? '#f0fdfa' : '#fefefe',
                    color: speed === value ? themeColor : '#475569',
                    cursor: isSupported ? 'pointer' : 'not-allowed',
                  }}
                >
                  {value}x
                </button>
              ))}
            </div>
          </div>

          {/* <div>
            <label
              style={{
                fontSize: '10px',
                fontWeight: 500,
                color: '#475569',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              Pitch
            </label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[0.5, 1, 1.5, 2].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handlePitchChange(value)}
                  disabled={!isSupported}
                  style={{
                    padding: '4px 12px',
                    fontSize: '11px',
                    fontWeight: 500,
                    border: pitch === value ? `2px solid ${themeColor}` : '1px solid #e2e8f0',
                    borderRadius: '6px',
                    background: pitch === value ? '#f0fdfa' : '#fefefe',
                    color: pitch === value ? themeColor : '#475569',
                    cursor: isSupported ? 'pointer' : 'not-allowed',
                  }}
                >
                  {value}x
                </button>
              ))}
            </div>
          </div> */}
        </div>
      )}

      {!isSupported && (
        <div
          style={{
            marginTop: '8px',
            fontSize: '10px',
            color: '#f97316',
            lineHeight: 1.4,
          }}
        >
          Text-to-speech is not available in this browser. Please try Chrome or
          Edge on desktop/mobile with speech enabled.
        </div>
      )}
    </div>
  );
};

export default BlogAudioWidget;