import React, { useState, useRef } from 'react';
import { Form, Input, InputGroup, InputGroupText, Spinner } from 'reactstrap';
import { RiArrowRightLine, RiMailLine } from 'react-icons/ri';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Btn from '@/elements/buttons/Btn';
import { useTranslation } from '@/utils/translations';
import SuccessModal from '@/components/common/SuccessModal';
import ErrorModal from '@/components/common/ErrorModal';
import { subscribeNewsletter } from '@/api/newsletter.api';
import ReCAPTCHA from 'react-google-recaptcha';

const newsletterSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email("Enter a valid email"),
});

const FooterNewsletter = () => {
  const { t } = useTranslation('common');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const recaptchaRef = useRef(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setApiError(null);

      let recaptchaToken = null;
      /* reCAPTCHA disabled
      if (recaptchaRef.current) {
        recaptchaToken = await recaptchaRef.current.executeAsync();
        recaptchaRef.current.reset();
      }

      if (!recaptchaToken) {
        throw new Error('reCAPTCHA verification failed. Please try again.');
      }
      */

      const response = await subscribeNewsletter(data.email, recaptchaToken);

      if (response.success) {
        reset();
        setShowSuccessModal(true);
      }
    } catch (error) {
      setApiError(error.message);
      setShowErrorModal(true);
      reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <li className="footer-newsletter newsletter-promo">
        <h5 className="mb-3 text-content">Subscribe to our newsletter</h5>
        <Form
          className="newsletter-form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="newsletter-input-wrapper">
            {/* <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
              size="invisible"
              badge="bottomright"
            /> */}
            <InputGroup className="footer-input-group">
              <InputGroupText>
                <RiMailLine />
              </InputGroupText>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="email"
                    placeholder={t('Enter Email')}
                    invalid={!!errors.email}
                  />
                )}
              />
              <Btn type="submit" size="sm" color="primary" className="subscribe-btn" disabled={loading} aria-label="Subscribe">
                {/* <RiArrowRightLine className='stroke-w-1' /> */}
                {loading ? <Spinner style={{ width: '1em', height: '1em', borderWidth: '1px' }} /> : <RiArrowRightLine />}
              </Btn>
            </InputGroup>
            {errors.email && (
              <p className="newsletter-error-message mt-1 mb-0 text-danger small">{errors.email.message}</p>
            )}
          </div>
        </Form>
        <SuccessModal
          modal={showSuccessModal}
          setModal={setShowSuccessModal}
          title={t('Subscribed Successfully!')}
          message={t('Thank you for subscribing to our newsletter!')}
        />
        <ErrorModal
          modal={showErrorModal}
          setModal={setShowErrorModal}
          title={t('Subscription failed')}
          message={apiError}
        />
      </li>
    </>
  );
};

export default FooterNewsletter;
