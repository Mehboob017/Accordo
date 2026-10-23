'use client';

import React from 'react';
import { Input, Spinner } from 'reactstrap';
import { RiEdit2Line } from 'react-icons/ri';

/**
 * Renders the 6-digit OTP input row plus the resend / edit-phone controls.
 * All state lives in the parent via `useOtpFlow`; this is purely presentational.
 *
 * Props:
 *  otpDigits        – string[] of length 6
 *  formattedNumber  – display-formatted phone, e.g. "98765 43210"
 *  resendTimer      – seconds remaining before resend is allowed
 *  isCheckingPhone  – boolean, disable while sending OTP
 *  isVerifyingPhone – boolean, disable inputs while verifying
 *  inputRefs        – React.MutableRefObject<HTMLInputElement[]>
 *  onOtpDigitChange – (value: string, index: number) => void
 *  onEditPhone      – () => void
 *  onResendOtp      – () => void
 */
const OtpSection = ({
  otpDigits,
  formattedNumber,
  resendTimer,
  isCheckingPhone,
  isVerifyingPhone,
  inputRefs,
  onOtpDigitChange,
  onEditPhone,
  onResendOtp,
}) => {
  return (
    <div className="otp-verification-section mt-3">
      <div className="otp-header">
        <div className="otp-sent-info">
          <span className="text-content">
            OTP sent to +91 {formattedNumber}
          </span>
          <button
            type="button"
            className="edit-phone-btn"
            onClick={onEditPhone}
            title="Edit phone number"
          >
            <RiEdit2Line size={16} />
          </button>
        </div>
      </div>

      <div className="otp-inputs-container">
        {otpDigits.map((digit, index) => (
          <Input
            key={index}
            type="tel"
            className="otp-input-box input-common"
            value={digit}
            onChange={(e) => {
              const rawValue = e.target.value;

              // IMPORTANT:
              // iOS OTP autofill can send the complete OTP to the first input.
              if (index === 0 && rawValue.length > 1) {
                const otp = rawValue.replace(/\D/g, '').slice(0, 6);
                onOtpDigitChange(otp, index);
                return;
              }

              onOtpDigitChange(rawValue, index);
            }}
            onPaste={(e) => {
              const pasted = e.clipboardData?.getData('text') || '';
              const otp = pasted.replace(/\D/g, '').slice(0, 6);

              if (otp.length > 1) {
                e.preventDefault();
                onOtpDigitChange(otp, index);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
                inputRefs.current?.[index - 1]?.focus();
              }
            }}
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={index === 0 ? 6 : 1}
            innerRef={(el) => (inputRefs.current[index] = el)}
            aria-label={`OTP digit ${index + 1}`}
            disabled={isVerifyingPhone}
          />
        ))}
      </div>

      <div className="otp-footer">
        {resendTimer > 0 ? (
          <span className="resend-timer">Resend OTP in {resendTimer}s</span>
        ) : (
          <button
            type="button"
            className="resend-otp-link"
            onClick={onResendOtp}
            disabled={isCheckingPhone}
          >
            {isCheckingPhone ? <Spinner size="sm" /> : 'Resend OTP'}
          </button>
        )}
      </div>
    </div>
  );
};

export default OtpSection;
