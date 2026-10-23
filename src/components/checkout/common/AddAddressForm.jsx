'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import Btn from '@/elements/buttons/Btn';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  FormFeedback,
  InputGroup,
} from 'reactstrap';
import AddressSearch from '@/components/googleAddress/AddressSearch/AddressSearch';
import { AllCountryCode } from '@/data/AllCountryCode';
import { INDIAN_STATES, findMatchingState } from '@/data/IndianStates';
import { addressFormSchema } from './../../../utils/validation/ZodValidationSchema';
import { MapsStatus, useGoogleMapsStatus } from '@/utils/helpers';
import { GoogleMapsProvider } from '@/helper/mapsContext/googleMapsProvider';
import { ToastNotification } from '@/utils/customFunctions/ToastNotification';
import { mapAddressFormToCustomerAddressPayload } from '@/api/customer-address.api';
import { useAddCustomerAddress } from '@/utils/hooks/useCustomerAddress';


const AddAddressForm = ({
  mutate,
  type,
  editAddress,
  setEditAddress,
  modal,
  setModal,
  isSubmitting = false,
}) => {
  const [address, setAddress] = useState({});
  const preservedOtherAddressTypeRef = useRef('');
  const mapsStatus = useGoogleMapsStatus();
  const mapsUnavailable = mapsStatus !== MapsStatus.READY;
  const { mutate: addCustomerAddress, isPending: isAddAddressPending } =
    useAddCustomerAddress({
      onSuccess: (res) => {
        // console.log({res});
        setModal && setModal(false);
        ToastNotification(
          'success',
          res?.message || 'Address added successfully.'
        );
      },
    });
  const formSchema = addressFormSchema;

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      countryCode: '+91',
      phone: '',
      alternate_phone: '',
      email: '',
      addressType: 'Home',
      otherAddressType: '',
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

  const selectedAddressType = useWatch({
    control,
    name: 'addressType',
  });
  const watchedOtherAddressType = useWatch({
    control,
    name: 'otherAddressType',
  });

  useEffect(() => {
    modal !== 'edit' && setEditAddress && setEditAddress({});
  }, [modal]);

  useEffect(() => {
    if (modal !== 'edit' || !editAddress) return;

    const incomingAddressType = editAddress?.addressType || '';
    const normalizedAddressType = ['Home', 'Office'].includes(
      incomingAddressType
    )
      ? incomingAddressType
      : 'Other';
    const initialOtherAddressType =
      normalizedAddressType === 'Other' ? incomingAddressType : '';

    preservedOtherAddressTypeRef.current = initialOtherAddressType;

    reset({
      firstName: editAddress?.firstName || editAddress?.first_name || '',
      lastName: editAddress?.lastName || editAddress?.last_name || '',
      countryCode: String(
        editAddress?.countryCode || editAddress?.country_code || '+91'
      ),
      phone: String(editAddress?.phone || ''),
      alternate_phone: String(editAddress?.alternate_phone || ''),
      email: editAddress?.email || '',
      addressType: normalizedAddressType,
      otherAddressType: initialOtherAddressType,
      address1: editAddress?.address1 || editAddress?.addressLine1 || '',
      address2: editAddress?.address2 || editAddress?.addressLine2 || '',
      city: editAddress?.city || '',
      state: findMatchingState(editAddress?.state, editAddress?.googleAddress) || editAddress?.state || '',
      pincode: String(editAddress?.pincode || ''),
      latitude: editAddress?.latitude || '',
      longitude: editAddress?.longitude || '',
      placeId: editAddress?.placeId || editAddress?.place_id || '',
      googleAddress: editAddress?.googleAddress || '',
    });
  }, [modal, editAddress, reset]);

  useEffect(() => {
    if (selectedAddressType === 'Other') {
      const restoredValue =
        watchedOtherAddressType || preservedOtherAddressTypeRef.current;

      if (restoredValue && restoredValue !== watchedOtherAddressType) {
        setValue('otherAddressType', restoredValue, { shouldValidate: true });
      }
      return;
    }

    if (watchedOtherAddressType?.trim()) {
      preservedOtherAddressTypeRef.current = watchedOtherAddressType.trim();
    }
  }, [selectedAddressType, setValue, watchedOtherAddressType]);

  // Update form when address is selected from Google Places
  useEffect(() => {
    if (address && Object.keys(address).length > 0) {
      // console.log('Setting address values:', address);
      setValue('address1', address.address1 ?? '', { shouldValidate: true });
      setValue('address2', address.address2 ?? '', { shouldValidate: true });
      setValue('city', address.city || '', { shouldValidate: true });
      const matchedState = findMatchingState(address.state, address.googleAddress);
      setValue('state', matchedState || address.state || '', { shouldValidate: true });
      setValue('pincode', address.pincode || '', { shouldValidate: true });
      setValue('latitude', address.latitude || '', { shouldValidate: true });
      setValue('longitude', address.longitude || '', { shouldValidate: true });
      setValue('placeId', address.placeId || '', { shouldValidate: true });
      setValue('googleAddress', address.googleAddress || '', { shouldValidate: true });
    }
  }, [address, setValue]);

  const onSubmit = (data) => {
    const payload = mapAddressFormToCustomerAddressPayload(data, type);

    if (modal === 'edit') {
      mutate && mutate(payload);
    } else {
      addCustomerAddress(payload);
    }
  };

  const onError = (errors) => {
    console.log(errors);
  };


  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit, onError)}>
        <fieldset
          disabled={modal === 'edit' ? isSubmitting : isAddAddressPending}
          style={{ border: 0, margin: 0, padding: 0 }}
        >
          <div className="responsive-form-scrollable">
            {/* <AddressSearch
              placeholder="Search your address"
              country="IN"
              onSelect={(data) => {
                setAddress(data);
                console.log('selected address => ', data);
              }}
            />
            {errors.root?.message && (
              <div className="text-danger pt-1">{errors.root.message}</div>
            )} */}

            <Row className="mt-2">
              {/* First Name */}
              <Col xs={6}>
                <FormGroup>
                  <Label for="firstName">
                    First Name <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    name="firstName"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        id="firstName"
                        className="text-capitalize input-common"
                        placeholder="Enter first name"
                        maxLength={25}
                        invalid={!!errors.firstName}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.replace(/[^a-zA-Z\s]/g, '')
                          )
                        }
                      />
                    )}
                  />
                  {errors.firstName && (
                    <FormFeedback className="message-error">
                      {errors.firstName.message}
                    </FormFeedback>
                  )}
                </FormGroup>
              </Col>

              {/* Last Name */}
              <Col xs={6}>
                <FormGroup>
                  <Label for="lastName">
                    Last Name <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    name="lastName"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        id="lastName"
                        className="text-capitalize input-common"
                        placeholder="Enter last name"
                        maxLength={25}
                        invalid={!!errors.lastName}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.replace(/[^a-zA-Z\s]/g, '')
                          )
                        }
                      />
                    )}
                  />
                  {errors.lastName && (
                    <FormFeedback className="message-error">
                      {errors.lastName.message}
                    </FormFeedback>
                  )}
                </FormGroup>
              </Col>

              {/* Phone Number with Country Code */}
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
                          placeholder="Enter phone number"
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
                  {(errors.countryCode || errors.phone) && (
                    <small className=" message-error">
                      {errors.countryCode?.message || errors.phone?.message}
                    </small>
                  )}
                </FormGroup>
              </Col>

              {/* Alternate Phone Number */}
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

              {/* Email */}
              <Col md={6}>
                <FormGroup>
                  <Label for="email">
                    Email
                    {/* <span className="text-danger">*</span> */}
                  </Label>
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

              <Col md={12}>
                <FormGroup>
                  <Label>
                    Address Type <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    name="addressType"
                    control={control}
                    render={({ field }) => (
                      <div className="d-flex flex-wrap gap-3">
                        {['Home', 'Office', 'Other'].map((option) => (
                          <div
                            key={option}
                            className="form-check d-flex align-items-center gap-2 mb-0"
                          >
                            <Input
                              className="form-check-input address-type-radio"
                              type="radio"
                              id={`address-type-${option.toLowerCase()}`}
                              name={field.name}
                              value={option}
                              checked={field.value === option}
                              onChange={(e) => field.onChange(e.target.value)}
                              invalid={!!errors.addressType}
                            />
                            <Label
                              className="form-check-label mb-0"
                              for={`address-type-${option.toLowerCase()}`}
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                  {errors.addressType && (
                    <FormFeedback className="message-error d-block">
                      {errors.addressType.message}
                    </FormFeedback>
                  )}
                </FormGroup>
              </Col>

              {selectedAddressType === 'Other' && (
                <Col md={12}>
                  <FormGroup>
                    <Label for="otherAddressType">
                      Enter Address Type <span className="text-danger">*</span>
                    </Label>
                    <Controller
                      name="otherAddressType"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="text"
                          id="otherAddressType"
                          className="input-common"
                          placeholder="Enter address type"
                          maxLength={20}
                          invalid={!!errors.otherAddressType}
                        />
                      )}
                    />
                    {errors.otherAddressType && (
                      <FormFeedback className="message-error">
                        {errors.otherAddressType.message}
                      </FormFeedback>
                    )}
                  </FormGroup>
                </Col>
              )}

              <Col md={12} className='mb-3'>
                <AddressSearch
                  placeholder="Search your address"
                  country="IN"
                  onSelect={(data) => {
                    setAddress(data);
                    // console.log('selected address => ', data);
                  }}
                />
                {errors.root?.message && (
                  <div className="text-danger pt-1">{errors.root.message}</div>
                )}
              </Col>

              {/* Address 1 */}
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

              {/* Address 2 */}
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

              {/* City */}
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

              {/* State */}
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

              {/* Pincode */}
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
                          field.onChange(e.target.value.replace(/\D/g, ''))
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

              {/* Hidden fields for Google Places data */}
              <Controller
                name="latitude"
                control={control}
                render={({ field }) => <input type="hidden" {...field} />}
              />
              <Controller
                name="longitude"
                control={control}
                render={({ field }) => <input type="hidden" {...field} />}
              />
              <Controller
                name="placeId"
                control={control}
                render={({ field }) => <input type="hidden" {...field} />}
              />
              <Controller
                name="googleAddress"
                control={control}
                render={({ field }) => <input type="hidden" {...field} />}
              />
            </Row>
          </div>

          {/* Sticky Submit Button */}
          <div className="address-form-footer">
            <div className="d-flex gap-2">
              <Btn
                // size="md"
                color="primary"
                className="flex-grow-1"
                type="submit"
                disabled={modal === 'edit' ? isSubmitting : isAddAddressPending}
              // onClick={() => console.log('Button clicked', { errors, mapsUnavailable })}
              >
                {(modal === 'edit' ? isSubmitting : isAddAddressPending)
                  ? 'Saving...'
                  : modal === 'edit'
                    ? 'Update Address'
                    : 'Save Address'}
              </Btn>
              {/* {setModal && (
            <Btn size='sm' className="flex-grow-1" type="button" outline onClick={() => setModal(false)}>
              Cancel
            </Btn>
          )} */}
            </div>
            {mapsUnavailable && (
              <div className="mt-2 text-danger align-self-center">
                Address auto-suggest unavailable. Please try again later.
              </div>
            )}
          </div>
        </fieldset>
      </Form>
    </>
  );
};

export default function AddAddressFormWithProvider(props) {
  return (
    <GoogleMapsProvider>
      <AddAddressForm {...props} />
    </GoogleMapsProvider>
  );
}
