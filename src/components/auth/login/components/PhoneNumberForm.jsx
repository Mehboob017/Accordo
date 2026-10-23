import React from 'react';
import { Controller } from 'react-hook-form';
import { Form, FormGroup, Input, InputGroup, Label } from 'reactstrap';
import Btn from '@/elements/buttons/Btn';
import { AllCountryCode } from '@/data/AllCountryCode';
// import Link from 'next/link';
import { RiCheckboxCircleFill, RiCheckboxFill } from 'react-icons/ri';
import { Turnstile } from "@marsidev/react-turnstile";
import { isTurnstileRequired } from '@/utils/constants';

const PhoneNumberForm = ({
  phoneControl,
  phoneErrors,
  isPhoneValid,
  handlePhoneSubmit,
  handleSendOtp,
  loginMutation,
  phoneInputRef,
  setTurnstileToken,
  isTurnstileRequired: propIsTurnstileRequired,
}) => {
  const showTurnstile =
    propIsTurnstileRequired !== undefined
      ? propIsTurnstileRequired
      : isTurnstileRequired();
  return (
    <div className="otp-login-top-section">
      <Form className="otp-step" onSubmit={handlePhoneSubmit(handleSendOtp)}>
        <div className="otp-welcome-card">
          <h4 className="otp-welcome-title mb-1">
            Welcome to Dhootapapeshwar!
          </h4>
          <p className="otp-welcome-text mb-1">
            Enter your mobile number to get an OTP.
          </p>

          <FormGroup className="otp-form-group mb-2">
            <Label className="form-label mb-1">
              Mobile Number <span className="text-danger">*</span>
            </Label>
            <InputGroup>
              <Controller
                name="countryCode"
                control={phoneControl}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="select"
                    className="country-code-select input-common"
                    style={{ maxWidth: '76px' }}
                    disabled
                    invalid={!!phoneErrors.countryCode}
                  >
                    {AllCountryCode.map((code) => (
                      <option key={code.id} value={code.id}>
                        {code.name}
                      </option>
                    ))}
                  </Input>
                )}
              />
              <Controller
                name="phone"
                control={phoneControl}
                render={({ field }) => (
                  <Input
                    {...field}
                    innerRef={phoneInputRef}
                    type="tel"
                    placeholder="Enter phone number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    className='input-common'
                    onChange={(e) =>
                      field.onChange(e.target.value.replace(/\D/g, ''))
                    }
                    invalid={!!phoneErrors.phone}
                  />
                )}
              />
            </InputGroup>
            {(phoneErrors.countryCode || phoneErrors.phone) && (
              <small className="message-error">
                {phoneErrors.countryCode?.message || phoneErrors.phone?.message}
              </small>
            )}
          </FormGroup>

          {showTurnstile && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
            <div className="mb-3 d-flex justify-content-center">
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                onSuccess={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken("")}
              />
            </div>
          )}

          <Btn
            type="submit"
            size="md"
            color="primary"
            className="w-100"
            disabled={!isPhoneValid || loginMutation.isPending}
            style={{
              opacity: !isPhoneValid || loginMutation.isPending ? 0.7 : 1,
              cursor:
                !isPhoneValid || loginMutation.isPending
                  ? 'not-allowed'
                  : 'pointer',
            }}
          >
            {loginMutation.isPending ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Sending...
              </>
            ) : (
              'Continue'
            )}
          </Btn>

          <p className="text-center text-muted mb-0 mt-2">
            <RiCheckboxFill className="me-1" style={{ fontSize: '1.2rem', color: 'var(--theme-color)' }} />
            I agree to the <a href="/terms-and-conditions">Terms & Conditions</a> and <a href="/privacy-policy">Privacy Policy</a>
          </p>
        </div>

      </Form>
    </div>
  );
};

export default PhoneNumberForm;
