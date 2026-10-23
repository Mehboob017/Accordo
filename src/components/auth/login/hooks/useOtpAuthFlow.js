import { useState, useRef, useEffect } from 'react';

const OTP_LENGTH = 6;

const getDigitsArray = () => Array(OTP_LENGTH).fill('');

export const useOtpAuthFlow = () => {
  const [step, setStep] = useState(1);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [otpDigits, setOtpDigits] = useState(getDigitsArray());
  const [resendTimer, setResendTimer] = useState(30);
  const [resendKey, setResendKey] = useState(0);
  const inputRefs = useRef([]);
  const phoneInputRef = useRef(null);

  // Handle 30s resend OTP timer whenever we are on step 2
  useEffect(() => {
    if (step !== 2) {
      setResendTimer(30);
      return;
    }

    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step, resendKey]);

  const resetFlow = () => {
    setStep(1);
    setRegistrationStep(1);
    setOtpDigits(getDigitsArray());
    setResendTimer(30);
  };

  const moveToOtpStep = () => {
    setStep(2);
    setOtpDigits(getDigitsArray());
    setResendKey((prev) => prev + 1);
  };

  const moveToRegistrationStep = () => {
    setStep(3);
    setRegistrationStep(1);
  };

  const moveToKycPendingStep = () => {
    setStep(4);
  };

  const handleOtpChange = (value, index, setOtpValue) => {
    const cleaned = value.replace(/\D/g, '');

    // iOS OTP autofill delivers the full OTP string to the focused input.
    // Detect multi-char input and distribute across all boxes.
    if (cleaned.length > 1) {
      const newOtpDigits = [...otpDigits];
      cleaned.split('').slice(0, OTP_LENGTH).forEach((char, i) => {
        newOtpDigits[i] = char;
      });
      const otpString = newOtpDigits.join('');
      setOtpDigits(newOtpDigits);
      setOtpValue('otp', otpString, { shouldValidate: true });

      // Focus the last filled box
      const lastFilledIndex = Math.min(cleaned.length - 1, OTP_LENGTH - 1);
      inputRefs.current?.[lastFilledIndex]?.focus();
      return;
    }

    const digit = cleaned.slice(-1);
    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = digit;
    const otpString = newOtpDigits.join('');

    setOtpDigits(newOtpDigits);
    setOtpValue('otp', otpString, { shouldValidate: true });

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current?.[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current?.[index - 1]?.focus();
    }
  };

  const incrementResendKey = () => {
    setResendKey((prev) => prev + 1);
  };

  const nextRegistrationStep = () => {
    setRegistrationStep((prev) => prev + 1);
  };

  const previousRegistrationStep = () => {
    setRegistrationStep((prev) => Math.max(1, prev - 1));
  };

  // ---------------------------------------------------------------------------
  // Web OTP API — auto-read OTP from SMS
  // Ref holds the react-hook-form setValue so it is always fresh inside the
  // async effect without being listed as a dependency (avoids stale closure).
  // ---------------------------------------------------------------------------
  // TEMPORARILY DISABLED — SMS template does not yet include the required
  // "@domain #code" footer line. Re-enable once the SMS format is corrected.
  // ---------------------------------------------------------------------------
  const setOtpValueRef = useRef(null);

  /**
   * Called once by OtpLoginModal after the OTP form is initialised so the hook
   * has access to react-hook-form's setValue without prop-drilling.
   */
  const registerSetOtpValue = (fn) => {
    setOtpValueRef.current = fn;
  };

  useEffect(() => {
    // console.log('[WebOTP] Effect triggered — step:', step, '| resendKey:', resendKey);

    // Only run on the OTP step
    if (step !== 2) {
      // console.log('[WebOTP] Skipping: not on OTP step (step =', step, ')');
      return;
    }

    // Feature detect — silently skip on desktop / iOS / Firefox
    if (typeof window === 'undefined') {
      // console.warn('[WebOTP] Skipping: window is undefined (SSR?)');
      return;
    }
    if (!('OTPCredential' in window)) {
      // console.warn('[WebOTP] Skipping: OTPCredential API not available in this browser.');
      // console.log('[WebOTP] navigator.credentials exists?', 'credentials' in navigator);
      // console.log('[WebOTP] User-Agent:', navigator.userAgent);
      return;
    }

    // console.log('[WebOTP] OTPCredential API detected. Starting listener...');
    const ac = new AbortController();

    const startOtpListener = async () => {
      // console.log('[WebOTP] Calling navigator.credentials.get() — waiting for SMS...');
      // console.log('[WebOTP] ⚠️ SMS must end with:\n  @' + window.location.origin.replace(/^https?:\/\//, '') + ' #<OTP_CODE>');
      // console.log("inside try");
      try {
        const credential = await navigator.credentials.get({
          // @ts-ignore — OTPCredential is not yet in all TS lib defs
          otp: { transport: ['sms'] },
          signal: ac.signal,
        });

        // console.log('[WebOTP] ✅ Credential received:', credential);
        // console.log('[WebOTP] credential.type:', credential?.type);
        // console.log('[WebOTP] credential.code (raw):', credential?.code);

        if (!credential?.code) {
          // console.warn('[WebOTP] ⚠️ Credential has no .code field — aborting auto-fill.');
          return;
        }

        const code = credential.code.replace(/\D/g, '').slice(0, OTP_LENGTH);
        // console.log('[WebOTP] Parsed numeric code:', code, '| expected length:', OTP_LENGTH, '| actual length:', code.length);

        if (code.length < OTP_LENGTH) {
          // console.warn('[WebOTP] ⚠️ Code length mismatch — SMS format may be incorrect. Got:', code.length, 'digits, need:', OTP_LENGTH);
        }

        const digits = code.split('').concat(Array(OTP_LENGTH).fill('')).slice(0, OTP_LENGTH);
        // console.log('[WebOTP] Digit array to populate:', digits);

        // Populate digit state (drives the visible inputs)
        setOtpDigits(digits);
        // console.log('[WebOTP] setOtpDigits() called.');

        // Populate the hidden react-hook-form field and trigger validation
        if (setOtpValueRef.current) {
          // console.log('[WebOTP] Calling setOtpValue (react-hook-form) with code:', code);
          setOtpValueRef.current('otp', code, { shouldValidate: true });
        } else {
          // console.warn('[WebOTP] ⚠️ setOtpValueRef.current is null — registerSetOtpValue() may not have been called yet.');
        }

        // Move focus to the last filled digit for accessibility / visual confirmation
        const lastFilledIndex = Math.min(code.length - 1, OTP_LENGTH - 1);
        // console.log('[WebOTP] Moving focus to input index:', lastFilledIndex, '| ref exists?', !!inputRefs.current?.[lastFilledIndex]);
        inputRefs.current?.[lastFilledIndex]?.focus();

        // console.log('[WebOTP] ✅ Auto-fill complete.');
      } catch (err) {
        // AbortError is expected when we cancel in the cleanup — not a real error
        // console.log("inside catch", { err })
        if (err?.name === 'AbortError') {
          // console.log('[WebOTP] Request aborted (cleanup/step change) — this is expected.');
          return;
        }
        // console.error('[WebOTP] ❌ Unexpected error during auto-read:', err?.name, err?.message, err);
      }
    };

    startOtpListener();

    // Abort the pending credential request when the user leaves the OTP step
    // or when the component unmounts (e.g. modal closed, resend triggered)
    return () => {
      // console.log('[WebOTP] Cleanup: aborting pending credential request (step:', step, '| resendKey:', resendKey, ')');
      ac.abort();
    };
  }, [step, resendKey]); // resendKey re-subscribes after each resend */

  return {
    step,
    registrationStep,
    otpDigits,
    resendTimer,
    inputRefs,
    phoneInputRef,
    setStep,
    resetFlow,
    moveToOtpStep,
    moveToRegistrationStep,
    moveToKycPendingStep,
    handleOtpChange,
    handleOtpKeyDown,
    incrementResendKey,
    nextRegistrationStep,
    previousRegistrationStep,
    setOtpDigits,
    getDigitsArray,
    setRegistrationStep,
    registerSetOtpValue,
  };
};
