import React, { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { Form, FormGroup, Input, Label } from 'reactstrap';
import { RiEdit2Line } from 'react-icons/ri';
import Btn from '@/elements/buttons/Btn';

const OtpVerificationForm = ({
  otpControl,
  otpErrors,
  otpServerError,
  otpValidationState,
  isOtpValid,
  handleOtpSubmit,
  handleVerify,
  verifyOtpMutation,
  resendOtpMutation,
  otpDigits,
  handleOtpChange,
  handleOtpKeyDown,
  inputRefs,
  formattedNumber,
  resendTimer,
  handleResend,
  onEditPhone,
  resetOtp,
  phoneInputRef,
  clearOtpServerError,
}) => {
  useEffect(() => {
    // console.log('[OtpForm] Error-focus effect: otpValidationState=', otpValidationState, '| otpDigits=', otpDigits);
    if (otpValidationState !== 'error') return;

    const lastIndex = Math.max((otpDigits?.length || 1) - 1, 0);
    const lastInput = inputRefs.current?.[lastIndex];

    // console.log('[OtpForm] Focusing last input at index', lastIndex, '| ref found?', !!lastInput);
    if (lastInput) {
      lastInput.focus();
      if (typeof lastInput.select === 'function') {
        lastInput.select();
      }
    }
  }, [otpValidationState, otpDigits, inputRefs]);

  return (
    <div className="otp-login-top-section">
      <Form className="otp-step" onSubmit={handleOtpSubmit(handleVerify)}>
        <div className="otp-welcome-card">
          <div className="d-flex justify-content-center align-items-center gap-2 otp-sent-text">
            <span className="text-content">
              OTP sent to +91 {formattedNumber}
            </span>
            <button
              type="button"
              className="icon-btn otp-edit-btn"
              onClick={() => {
                clearOtpServerError?.();
                onEditPhone();
                resetOtp();
                setTimeout(() => {
                  phoneInputRef.current?.focus();
                }, 50);
              }}
              disabled={
                verifyOtpMutation.isPending || resendOtpMutation.isPending
              }
              style={{
                opacity:
                  verifyOtpMutation.isPending || resendOtpMutation.isPending
                    ? 0.5
                    : 1,
                cursor:
                  verifyOtpMutation.isPending || resendOtpMutation.isPending
                    ? 'not-allowed'
                    : 'pointer',
              }}
              aria-label="Edit phone number"
            >
              <RiEdit2Line />
            </button>
          </div>

          <FormGroup className="otp-form-group" style={{ marginBottom: '0.5rem !important' }}>
            <Label className="form-label mb-2">
              Enter the OTP <span className="text-danger">*</span>
            </Label>
            <div className="otp-inputs mb-2">
              {otpDigits.map((digit, index) => (
                <Input
                  key={index}
                  type="tel"
                  className={`otp-input input-common ${otpValidationState === 'error'
                    ? 'otp-input--error'
                    : otpValidationState === 'success'
                      ? 'otp-input--success'
                      : ''
                    }`}
                  value={digit}
                  onChange={(e) => {
                    const rawValue = e.target.value;

                    // console.log(
                    //   `[OtpForm] onChange[${index}]: raw="${rawValue}"`,
                    //   e.nativeEvent?.inputType
                    // );

                    clearOtpServerError?.();

                    // IMPORTANT:
                    // iOS OTP autofill can send the complete OTP to the first input.
                    if (index === 0 && rawValue.length > 1) {
                      const otp = rawValue.replace(/\D/g, '').slice(0, 6);

                      // console.log('[OtpForm] 🍎 iOS OTP autofill:', otp);

                      handleOtpChange(otp, index);
                      return;
                    }

                    handleOtpChange(rawValue, index);
                  }}
                  onPaste={(e) => {
                    const pasted = e.clipboardData?.getData('text') || '';
                    const otp = pasted.replace(/\D/g, '').slice(0, 6);

                    // console.log(`[OtpForm] onPaste[${index}]:`, otp);

                    if (otp.length > 1) {
                      e.preventDefault();
                      handleOtpChange(otp, index);
                    }
                  }}
                  // onFocus={() => console.log(`[OtpForm] onFocus[${index}]`)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  inputMode="numeric"
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  pattern="[0-9]*"
                  maxLength={index === 0 ? 6 : 1}
                  innerRef={(el) => (inputRefs.current[index] = el)}
                  aria-label={`OTP digit ${index + 1}`}
                  disabled={verifyOtpMutation.isPending}
                />
              ))}
            </div>
            <div className="otp-error-slot mt-2">
              {otpErrors.otp ? (
                <small className="message-error d-block">{otpErrors.otp.message}</small>
              ) : null}
              {!otpErrors.otp && otpServerError ? (
                <small className="message-error d-block">{otpServerError}</small>
              ) : null}
            </div>
            <Controller
              name="otp"
              control={otpControl}
              render={({ field }) => <input type="hidden" {...field} />}
            />
          </FormGroup>

          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="text-content">Didn&apos;t receive OTP ?</span>

            {resendTimer > 0 ? (
              <span className="text-content">Resend in {resendTimer}s</span>
            ) : (
              <button
                type="button"
                className="link-btn"
                onClick={handleResend}
                disabled={resendOtpMutation.isPending}
                style={{
                  opacity: resendOtpMutation.isPending ? 0.5 : 1,
                  cursor: resendOtpMutation.isPending
                    ? 'not-allowed'
                    : 'pointer',
                }}
              >
                {resendOtpMutation.isPending ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </div>

          <Btn
            type="submit"
            size="md"
            color="primary"
            className="w-100"
            disabled={!isOtpValid || verifyOtpMutation.isPending}
            style={{
              opacity: !isOtpValid || verifyOtpMutation.isPending ? 0.7 : 1,
              cursor:
                !isOtpValid || verifyOtpMutation.isPending
                  ? 'not-allowed'
                  : 'pointer',
            }}
          >
            {verifyOtpMutation.isPending ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Verifying...
              </>
            ) : (
              'Verify & Submit'
            )}
          </Btn>
        </div>
      </Form>
    </div>
  );
};

export default OtpVerificationForm;
