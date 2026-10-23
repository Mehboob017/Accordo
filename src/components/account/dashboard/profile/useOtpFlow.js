import { useState, useRef, useEffect, useCallback } from 'react';
import { ToastNotification } from '@/utils/customFunctions/ToastNotification';
import {
  useCheckProfilePhone,
  useVerifyProfilePhone,
  useResendOtp, // 1. Import your new hook here
} from '@/utils/hooks/useAuth';

const OTP_LENGTH = 6;
export const getDigitsArray = () => Array(OTP_LENGTH).fill('');

/**
 * Encapsulates all OTP-send / OTP-verify state and side-effects.
 * Phone value is passed in at call-time so the hook remains independent
 * of whichever form controls the phone field.
 */
export const useOtpFlow = () => {
  const [otpDigits, setOtpDigits] = useState(getDigitsArray());
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(true);
  const [phoneChanged, setPhoneChanged] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [resendKey, setResendKey] = useState(0);
  const inputRefs = useRef([]);

  /* ── Mutations ─────────────────────────────────────────────────── */

  const { mutate: checkPhone, isPending: isCheckingPhone } =
    useCheckProfilePhone({
      onSuccess: (data) => {
        if (data.success) {
          ToastNotification('success', `${data.message}`);
          setOtpSent(true);
          setOtpVerified(false);
          setOtpDigits(getDigitsArray());
          setResendKey((prev) => prev + 1);
          setTimeout(() => inputRefs.current?.[0]?.focus(), 50);
        } else {
          ToastNotification('error', data.message || 'Failed to send OTP');
        }
      },
      onError: (error) => {
        ToastNotification(
          'error',
          error.message || 'Failed to send OTP. Please try again.'
        );
      },
    });

  // 2. Initialize the Resend OTP mutation
  const { mutate: resendPhoneOtp, isPending: isResendingPhone } =
    useResendOtp({
      onSuccess: (data) => {
        if (data.success) {
          ToastNotification(
            'success',
            `${data.message || 'OTP resent successfully'}`
          );
          setOtpSent(true);
          setOtpVerified(false);
          setOtpDigits(getDigitsArray());
          setResendKey((prev) => prev + 1); // Restarts the 30s timer
          setTimeout(() => inputRefs.current?.[0]?.focus(), 50);
        } else {
          ToastNotification('error', data.message || 'Failed to resend OTP');
        }
      },
      onError: (error) => {
        ToastNotification(
          'error',
          error.message || 'Failed to resend OTP. Please try again.'
        );
      },
    });

  const { mutate: verifyPhone, isPending: isVerifyingPhone } =
    useVerifyProfilePhone({
      onSuccess: (data) => {
        if (data.success) {
          setOtpVerified(true);
          setOtpSent(false);
          ToastNotification(
            'success',
            data.message || 'OTP verified successfully'
          );
        } else {
          ToastNotification(
            'error',
            data.message || 'Invalid OTP. Please try again.'
          );
          setOtpDigits(getDigitsArray());
        }
      },
      onError: (error) => {
        ToastNotification(
          'error',
          error.message || 'Failed to verify OTP. Please try again.'
        );
        setOtpDigits(getDigitsArray());
      },
    });

  /* ── Countdown timer ────────────────────────────────────────────── */

  useEffect(() => {
    if (otpSent && !otpVerified) {
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
    }
  }, [otpSent, otpVerified, resendKey]);

  /* ── Exposed actions ────────────────────────────────────────────── */

  const resetOtpFlow = useCallback(() => {
    setOtpSent(false);
    setOtpVerified(true);
    setPhoneChanged(false);
    setOtpDigits(getDigitsArray());
    setResendTimer(30);
  }, []);

  const sendOtp = useCallback(
    (phone) => {
      if (!phone || phone.length !== 10) {
        ToastNotification('error', 'Please enter a valid 10-digit phone number');
        return;
      }
      checkPhone({ phone });
    },
    [checkPhone]
  );

  // 3. Update resendOtp to use the new mutation and loading state
  const resendOtp = useCallback(
    (phone) => {
      if (resendTimer > 0 || isResendingPhone) return;
      resendPhoneOtp({ phone });
    },
    [resendTimer, isResendingPhone, resendPhoneOtp]
  );

  const editPhone = useCallback(() => {
    setOtpSent(false);
    setOtpVerified(false);
    setOtpDigits(getDigitsArray());
  }, []);

  const verifyOtp = useCallback(
    (phone, otpArray) => {
      const digits = otpArray ?? otpDigits;
      const entered = digits.join('');
      if (entered.length !== OTP_LENGTH) return;
      verifyPhone({ phone, otp: entered });
    },
    [otpDigits, verifyPhone]
  );

  const handleOtpDigitChange = useCallback(
    (phone, value, index) => {
      const cleaned = value.replace(/\D/g, '');

      // iOS OTP autofill delivers the full OTP string to the focused input.
      // Detect multi-char input and distribute across all boxes.
      if (cleaned.length > 1) {
        const newDigits = [...otpDigits];
        cleaned.split('').slice(0, OTP_LENGTH).forEach((char, i) => {
          newDigits[i] = char;
        });
        setOtpDigits(newDigits);

        // Focus the last filled box
        const lastFilledIndex = Math.min(cleaned.length - 1, OTP_LENGTH - 1);
        inputRefs.current?.[lastFilledIndex]?.focus();

        if (newDigits.every((d) => d !== '') && newDigits.join('').length === OTP_LENGTH) {
          setTimeout(() => verifyOtp(phone, newDigits), 100);
        }
        return;
      }

      const digit = cleaned.slice(-1);
      const newDigits = [...otpDigits];
      newDigits[index] = digit;
      setOtpDigits(newDigits);

      if (digit && index < OTP_LENGTH - 1) {
        inputRefs.current?.[index + 1]?.focus();
      }

      if (
        newDigits.every((d) => d !== '') &&
        newDigits.join('').length === OTP_LENGTH
      ) {
        setTimeout(() => verifyOtp(phone, newDigits), 100);
      }
    },
    [otpDigits, verifyOtp]
  );

  const handlePhoneFieldChange = useCallback((newPhone, savedPhone) => {
    if (newPhone !== savedPhone) {
      setPhoneChanged(true);
      setOtpVerified(false);
    } else {
      setPhoneChanged(false);
      setOtpVerified(true);
    }
    setOtpSent(false);
    setOtpDigits(getDigitsArray());
  }, []);

  return {
    otpDigits,
    otpSent,
    otpVerified,
    phoneChanged,
    resendTimer,
    inputRefs,
    isCheckingPhone,
    isResendingPhone, 
    isVerifyingPhone,
    resetOtpFlow,
    sendOtp,
    resendOtp,
    editPhone,
    verifyOtp,
    handleOtpDigitChange,
    handlePhoneFieldChange,
  };
};