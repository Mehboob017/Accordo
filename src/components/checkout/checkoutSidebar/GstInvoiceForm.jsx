import { useContext, useEffect, useMemo, useCallback, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  InputGroup,
  FormFeedback,
  Spinner,
} from 'reactstrap';
import Btn from '@/elements/buttons/Btn';
import { ToastNotification } from '@/utils/customFunctions/ToastNotification';
import AddressSearch from '@/components/googleAddress/AddressSearch/AddressSearch';
import UserContext from '@/helper/userContext';
import styles from './GstInvoiceForm.module.scss';
import { AllCountryCode } from '@/data/AllCountryCode';
import { INDIAN_STATES, findMatchingState } from '@/data/IndianStates';
import { EMAIL_PATTERN } from '@/utils/constants';
import { mapGstInvoiceFormToCustomerAddressPayload } from '@/api/customer-address.api';
import {
  useAddCustomerAddress,
  useCustomerAddresses,
  useUpdateCustomerAddress,
} from '@/utils/hooks/useCustomerAddress';
import { useVerifyGst } from '@/utils/hooks/useVerifyGst';

// 1. Extract Regex so we can reuse it for the auto-verify check
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const GST_RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const GST_MAX_VERIFICATION_ATTEMPTS = 5;
const GST_LIMIT_KEY_PREFIX = 'gst_verification_limit_';

let cachedPublicIp = null;

const getPublicIpAddress = async () => {
  if (cachedPublicIp) return cachedPublicIp;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch('https://api.ipify.org?format=json', {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data?.ip) {
        cachedPublicIp = String(data.ip).trim();
        return cachedPublicIp;
      }
    }
  } catch {
    // Network failure or timeout; fail gracefully without breaking GST verification
  }

  return cachedPublicIp || 'unknown';
};

const getGstLimitStorageKey = (userId) => `${GST_LIMIT_KEY_PREFIX}${userId}`;

const readGstVerificationLimit = (userId) => {
  if (typeof window === 'undefined' || !window.localStorage || !userId) {
    return null;
  }

  const key = getGstLimitStorageKey(userId);
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    const data = JSON.parse(raw);
    const now = Date.now();

    // Validate structure of stored data
    const isValid =
      data &&
      typeof data === 'object' &&
      data.userId === userId &&
      typeof data.attempts === 'number' &&
      data.attempts >= 0 &&
      typeof data.firstAttemptAt === 'number' &&
      !isNaN(data.firstAttemptAt);

    if (!isValid) {
      window.localStorage.removeItem(key);
      return null;
    }

    // 24-hour window check: if 24 hours have elapsed since firstAttemptAt or blockedUntil expired
    if (
      now - data.firstAttemptAt >= GST_RATE_LIMIT_WINDOW_MS ||
      (data.blockedUntil && now >= data.blockedUntil)
    ) {
      window.localStorage.removeItem(key);
      return null;
    }

    return data;
  } catch {
    try {
      window.localStorage.removeItem(key);
    } catch { }
    return null;
  }
};

const saveGstVerificationLimit = (data) => {
  if (
    typeof window === 'undefined' ||
    !window.localStorage ||
    !data ||
    !data.userId
  ) {
    return;
  }

  const key = getGstLimitStorageKey(data.userId);
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save GST verification rate limit:', error);
  }
};

const gstInvoiceFormSchema = z.object({
  countryCode: z.string().trim().min(1, 'Country code is required'),
  phone: z
    .string()
    .regex(/^\d+$/, 'Phone number must contain only digits')
    .regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
  alternate_phone: z
    .string()
    .optional()
    .refine((val) => !val || /^[6-9]\d{9}$/.test(val), {
      message: 'Invalid phone number',
    }),
  email: z
    .string()
    .optional()
    .refine((val) => !val || EMAIL_PATTERN.test(val), {
      message: 'Invalid email address',
    }),
  gstNumber: z
    .string()
    .trim()
    .min(15, 'GSTIN must be 15 characters')
    .max(15, 'GSTIN must be 15 characters')
    .regex(GSTIN_REGEX, 'Invalid GSTIN format'),
  companyName: z
    .string()
    .trim()
    .min(2, 'Company name is required')
    .max(60, 'Company name must be at most 60 characters')
    .regex(/^[A-Za-z0-9&.\s/-]+$/, 'Invalid company name'),
  address1: z.string().trim().min(1, 'Address is required'),
  address2: z.string().trim().optional(),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Pincode must be exactly 6 digits'),
});

const GstInvoiceForm = ({ setModal, onSaved, selectedAddress }) => {
  const schema = useMemo(() => gstInvoiceFormSchema, []);
  const { isAuthenticated, userData } = useContext(UserContext);
  const userId = userData?.uid || userData?.id || '';
  console.log(userId, "user id from the context")

  const { data: customerAddressesData } = useCustomerAddresses({
    enabled: isAuthenticated,
  });

  const lastVerifiedGstRef = useRef('');
  const isVerifyingGstInProgressRef = useRef(false);

  const billingAddress = useMemo(() => {
    const addresses = Array.isArray(customerAddressesData?.data?.addresses)
      ? customerAddressesData.data.addresses
      : [];
    return addresses.find((address) => address?.type === 'billing') || null;
  }, [customerAddressesData?.data?.addresses]);

  const formAddress = billingAddress || null;
  const selectedAddressId =
    billingAddress?.id || billingAddress?.uid || billingAddress?.userId || '';

  const { mutateAsync: addCustomerAddress, isPending: isAddAddressPending } =
    useAddCustomerAddress();
  const {
    mutateAsync: updateCustomerAddress,
    isPending: isUpdateAddressPending,
  } = useUpdateCustomerAddress();

  const { mutateAsync: verifyGst, isPending: isVerifyingGst } = useVerifyGst();

  const {
    control,
    handleSubmit,
    getValues,
    register,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      countryCode: '+91',
      phone: '',
      alternate_phone: '',
      email: '',
      gstNumber: '',
      companyName: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      pincode: '',
      latitude: '',
      longitude: '',
      placeId: '',
      googleAddress: '',
    },
    mode: 'onChange',
  });

  const currentGstNumber = watch('gstNumber');

  useEffect(() => {
    getPublicIpAddress();
  }, []);

  useEffect(() => {
    const existingGst = billingAddress?.gstNo || '';

    // Mark this existing GST as already verified so the auto-trigger ignores it on mount/edit
    if (existingGst) {
      lastVerifiedGstRef.current = existingGst;
    } else {
      lastVerifiedGstRef.current = '';
    }

    reset({
      countryCode: String(
        formAddress?.countryCode || formAddress?.country_code || '+91'
      ),
      phone: String(formAddress?.phone || ''),
      alternate_phone: String(formAddress?.alternate_phone || ''),
      email: formAddress?.email || '',
      gstNumber: existingGst,
      companyName: billingAddress?.companyName || '',
      address1: formAddress?.addressLine1 || formAddress?.address1 || '',
      address2: formAddress?.addressLine2 || formAddress?.address2 || '',
      city: formAddress?.city || '',
      state:
        findMatchingState(formAddress?.state, formAddress?.googleAddress) ||
        formAddress?.state ||
        '',
      pincode: String(formAddress?.pincode || ''),
      latitude: String(formAddress?.latitude || ''),
      longitude: String(formAddress?.longitude || ''),
      placeId: formAddress?.placeId || formAddress?.place_id || '',
      googleAddress:
        formAddress?.googleAddress ||
        formAddress?.addressLine1 ||
        formAddress?.address1 ||
        '',
    });
  }, [billingAddress, formAddress, reset]);

  // Wrapped in useCallback to prevent dependency issues in useEffect
  const handleVerifyGst = useCallback(
    async (gstinToVerify) => {
      // Prevent duplicate calls if it's already the last verified GSTIN
      if (lastVerifiedGstRef.current === gstinToVerify) return;

      // Prevent concurrent verification runs
      if (isVerifyingGstInProgressRef.current) return;

      // 1. Check whether user is logged in
      if (!isAuthenticated || !userId) {
        ToastNotification('error', 'Please login to verify GST details.');
        return;
      }

      // 2. Check stored rate limit data in localStorage
      const now = Date.now();
      const currentLimitData = readGstVerificationLimit(userId);

      if (currentLimitData) {
        const isBlocked =
          (currentLimitData.blockedUntil && now < currentLimitData.blockedUntil) ||
          currentLimitData.attempts >= GST_MAX_VERIFICATION_ATTEMPTS;

        if (isBlocked) {
          // If blockedUntil was somehow unset, set it now to 24h from first attempt
          if (!currentLimitData.blockedUntil) {
            currentLimitData.blockedUntil =
              currentLimitData.firstAttemptAt + GST_RATE_LIMIT_WINDOW_MS;
            saveGstVerificationLimit(currentLimitData);
          }

          ToastNotification(
            'error',
            'GST verification limit reached. Please try again after 24 hours.'
          );
          return;
        }
      }

      isVerifyingGstInProgressRef.current = true;

      try {
        // 3. Obtain user's public IP address
        const ip = await getPublicIpAddress();

        // 4. Count attempt BEFORE calling the API
        const attempts = (currentLimitData?.attempts || 0) + 1;
        const firstAttemptAt = currentLimitData?.firstAttemptAt || now;
        const blockedUntil =
          attempts >= GST_MAX_VERIFICATION_ATTEMPTS
            ? firstAttemptAt + GST_RATE_LIMIT_WINDOW_MS
            : null;

        const updatedLimitData = {
          userId,
          ip: ip || currentLimitData?.ip || 'unknown',
          attempts,
          firstAttemptAt,
          blockedUntil,
        };

        saveGstVerificationLimit(updatedLimitData);

        // 5. Make the GST verification API request
        const response = await verifyGst({ GSTIN: gstinToVerify });

        if (response?.valid) {
          // Mark as verified
          lastVerifiedGstRef.current = gstinToVerify;

          ToastNotification('success', 'GSTIN Verified Successfully!');

          const companyName =
            response.legal_name_of_business ||
            response.trade_name_of_business ||
            '';
          setValue('companyName', companyName, { shouldValidate: true });

          const splitAddr = response.principal_place_split_address;

          if (splitAddr) {
            const addr1Parts = [
              splitAddr.building_number,
              splitAddr.flat_number,
              splitAddr.building_name,
            ]
              .filter(Boolean)
              .join(', ');

            const addr2Parts = [splitAddr.street, splitAddr.location]
              .filter(Boolean)
              .join(', ');

            setValue(
              'address1',
              addr1Parts || response.principal_place_address || '',
              { shouldValidate: true }
            );
            setValue('address2', addr2Parts || '', { shouldValidate: true });
            setValue('city', splitAddr.city || splitAddr.location || '', {
              shouldValidate: true,
            });
            const matchedGstState = findMatchingState(
              splitAddr.state,
              response.principal_place_address
            );
            setValue('state', matchedGstState || splitAddr.state || '', {
              shouldValidate: true,
            });
            setValue('pincode', splitAddr.pincode || '', {
              shouldValidate: true,
            });

            if (splitAddr.latitude) setValue('latitude', splitAddr.latitude);
            if (splitAddr.longitude) setValue('longitude', splitAddr.longitude);
          }
        } else {
          ToastNotification('error', response?.message || 'Invalid GSTIN');
        }
      } catch (error) {
        ToastNotification(
          'error',
          error?.message || 'Failed to verify GST details.'
        );
      } finally {
        isVerifyingGstInProgressRef.current = false;
      }
    },
    [isAuthenticated, userId, verifyGst, setValue]
  );

  // 2. Auto-trigger API when GSTIN is exactly 15 chars and format is valid
  useEffect(() => {
    if (
      currentGstNumber &&
      currentGstNumber.length === 15 &&
      GSTIN_REGEX.test(currentGstNumber) &&
      currentGstNumber !== lastVerifiedGstRef.current // Don't verify if it's already verified
    ) {
      handleVerifyGst(currentGstNumber);
    }
  }, [currentGstNumber, handleVerifyGst]);

  const onSubmit = async (data) => {
    try {
      const formData = {
        ...data,
        latitude: String(getValues('latitude') || ''),
        longitude: String(getValues('longitude') || ''),
        placeId: getValues('placeId') || '',
        googleAddress: getValues('googleAddress') || '',
      };

      const payload = mapGstInvoiceFormToCustomerAddressPayload(
        formData,
        formAddress
      );

      let response;

      if (selectedAddressId) {
        response = await updateCustomerAddress({
          userId: selectedAddressId,
          payload,
        });
      } else {
        response = await addCustomerAddress(payload);
      }

      onSaved?.(response, payload);
      ToastNotification(
        'success',
        response?.message || 'GST invoice details saved successfully.'
      );
      setModal?.(false);
    } catch (e) {
      ToastNotification(
        'error',
        e?.message || 'Failed to save GST invoice details.'
      );
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <fieldset
        disabled={isSubmitting || isAddAddressPending || isUpdateAddressPending}
        style={{ border: 0, margin: 0, padding: 0 }}
      >
        {/* 3. Added relative wrapper to hold the loading overlay */}
        <div style={{ position: 'relative' }}>
          {/* Form Loader Overlay */}
          {isVerifyingGst && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                zIndex: 10,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '8px',
              }}
            >
              <Spinner />
            </div>
          )}

          <div className={`responsive-form-scrollable ${styles.gstForm}`}>
            <input type="hidden" {...register('latitude')} />
            <input type="hidden" {...register('longitude')} />
            <input type="hidden" {...register('placeId')} />
            <input type="hidden" {...register('googleAddress')} />

            <Row className="mt-2">
              <Col md={6}>
                <FormGroup>
                  <Label for="gstNumber">
                    GST Number <span className="text-danger">*</span>
                  </Label>

                  {/* Removed InputGroup and Verify Button */}
                  <Controller
                    name="gstNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        id="gstNumber"
                        className="input-common"
                        placeholder="Enter GSTIN"
                        inputMode="text"
                        maxLength={15}
                        invalid={!!errors.gstNumber}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              .toUpperCase()
                              .replace(/[^0-9A-Z]/g, '')
                              .slice(0, 15)
                          )
                        }
                      />
                    )}
                  />

                  {errors.gstNumber && (
                    <FormFeedback className="message-error d-block">
                      {errors.gstNumber.message}
                    </FormFeedback>
                  )}
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label for="companyName">
                    Company Name <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    name="companyName"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        id="companyName"
                        className="input-common"
                        placeholder="Enter company name"
                        maxLength={60}
                        invalid={!!errors.companyName}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.replace(/[^A-Za-z0-9&.\s/-]/g, '')
                          )
                        }
                      />
                    )}
                  />
                  {errors.companyName && (
                    <FormFeedback className="message-error">
                      {errors.companyName.message}
                    </FormFeedback>
                  )}
                </FormGroup>
              </Col>
            </Row>

            <Row className="mt-2">
              <Col md={6}>
                <FormGroup>
                  <Label for="phone">
                    Phone Number <span className="text-danger">*</span>
                  </Label>
                  <InputGroup>
                    <Controller
                      name="countryCode"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="select"
                          className="country-code-select"
                          style={{ maxWidth: '76px' }}
                          invalid={!!errors.countryCode}
                          disabled
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
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="tel"
                          id="phone"
                          className="input-common"
                          placeholder="Enter mobile number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={10}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value.replace(/\D/g, '').slice(0, 10)
                            )
                          }
                          invalid={!!errors.phone}
                        />
                      )}
                    />
                  </InputGroup>
                  {errors.countryCode?.message || errors.phone?.message ? (
                    <small className="message-error d-block mt-1">
                      {errors.countryCode?.message || errors.phone?.message}
                    </small>
                  ) : null}
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label for="alternate_phone">
                    Alternate Number{' '}
                    <i className="text-secondary">(if any)</i>
                  </Label>
                  <Controller
                    name="alternate_phone"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="tel"
                        id="alternate_phone"
                        className="input-common"
                        placeholder="Enter alternate phone number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={10}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.replace(/\D/g, '').slice(0, 10)
                          )
                        }
                        invalid={!!errors.alternate_phone}
                      />
                    )}
                  />
                  {errors.alternate_phone && (
                    <FormFeedback className="message-error">
                      {errors.alternate_phone.message}
                    </FormFeedback>
                  )}
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label for="email">Email</Label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="email"
                        id="email"
                        className="input-common"
                        placeholder="Enter email address"
                        maxLength={30}
                        invalid={!!errors.email}
                      />
                    )}
                  />
                  {errors.email && (
                    <FormFeedback className="message-error">
                      {errors.email.message}
                    </FormFeedback>
                  )}
                </FormGroup>
              </Col>
            </Row>

            <Row className="mt-2">
              <AddressSearch
                value={billingAddress ? '' : ''}
                placeholder="Search your address"
                country="IN"
                onSelect={(address) => {
                  setValue('address1', address.address1 ?? '', {
                    shouldValidate: true,
                  });
                  setValue('address2', address.address2 ?? '', {
                    shouldValidate: true,
                  });
                  setValue('city', address.city || '', {
                    shouldValidate: true,
                  });
                  const matchedState = findMatchingState(
                    address.state,
                    address.googleAddress
                  );
                  setValue('state', matchedState || address.state || '', {
                    shouldValidate: true,
                  });
                  setValue('pincode', address.pincode || '', {
                    shouldValidate: true,
                  });
                  setValue('latitude', String(address.latitude || ''), {
                    shouldValidate: false,
                  });
                  setValue('longitude', String(address.longitude || ''), {
                    shouldValidate: false,
                  });
                  setValue('placeId', address.placeId || '', {
                    shouldValidate: false,
                  });
                  setValue('googleAddress', address.googleAddress || '', {
                    shouldValidate: false,
                  });
                }}
              />
            </Row>

            <Row className="mt-2">
              <Col md={12}>
                <FormGroup>
                  <Label for="address1">
                    Address Line 1 <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    name="address1"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        id="address1"
                        className="input-common"
                        placeholder="House Number/Tower/Block"
                        invalid={!!errors.address1}
                      />
                    )}
                  />
                  {errors.address1 && (
                    <FormFeedback className="message-error">
                      {errors.address1.message}
                    </FormFeedback>
                  )}
                </FormGroup>
              </Col>

              <Col md={12}>
                <FormGroup>
                  <Label for="address2">Address Line 2</Label>
                  <Controller
                    name="address2"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        id="address2"
                        className="input-common"
                        placeholder="Address (Building, Street, Area)"
                      />
                    )}
                  />
                </FormGroup>
              </Col>

              <Col xs={12} md={6}>
                <FormGroup>
                  <Label for="city">
                    City <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        id="city"
                        className="input-common"
                        placeholder="Enter city"
                        invalid={!!errors.city}
                      />
                    )}
                  />
                  {errors.city && (
                    <FormFeedback className="message-error">
                      {errors.city.message}
                    </FormFeedback>
                  )}
                </FormGroup>
              </Col>

              <Col xs={12} md={6}>
                <FormGroup>
                  <Label for="state">
                    State <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="select"
                        id="state"
                        className="input-common"
                        invalid={!!errors.state}
                      >
                        <option value="">Select state</option>
                        {INDIAN_STATES.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </Input>
                    )}
                  />
                  {errors.state && (
                    <FormFeedback className="message-error">
                      {errors.state.message}
                    </FormFeedback>
                  )}
                </FormGroup>
              </Col>

              <Col xs={12}>
                <FormGroup className={'mb-sm-0'}>
                  <Label for="pincode">
                    Pincode <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    name="pincode"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        id="pincode"
                        className="input-common"
                        placeholder="Enter pincode"
                        maxLength={6}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.replace(/\D/g, '').slice(0, 6)
                          )
                        }
                        invalid={!!errors.pincode}
                      />
                    )}
                  />
                  {errors.pincode && (
                    <FormFeedback className="message-error">
                      {errors.pincode.message}
                    </FormFeedback>
                  )}
                </FormGroup>
              </Col>
            </Row>
          </div>
        </div>

        <div className="address-form-footer mt-4">
          <div className="d-flex gap-2">
            <Btn
              color="primary"
              className="flex-grow-1"
              type="submit"
              disabled={
                isSubmitting ||
                isAddAddressPending ||
                isUpdateAddressPending ||
                isVerifyingGst
              }
            >
              {isSubmitting || isAddAddressPending || isUpdateAddressPending
                ? 'Saving...'
                : 'Save GST Details'}
            </Btn>
          </div>
        </div>
      </fieldset>
    </Form>
  );
};

export default GstInvoiceForm;
