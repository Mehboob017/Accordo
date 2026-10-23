'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Col,
  Row,
  Form,
  FormGroup,
  Label,
  Input,
  InputGroup,
  FormFeedback,
  Spinner,
} from 'reactstrap';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RiEdit2Line, RiSendPlaneFill, RiStethoscopeLine } from 'react-icons/ri';
import { z } from 'zod';
import Btn from '@/elements/buttons/Btn';
import { ToastNotification } from '@/utils/customFunctions/ToastNotification';
// import { AllCountryCode } from '@/data/AllCountryCode';
import { useUser } from '@/utils/hooks/useUser';
import { useUpdateProfile } from '@/utils/hooks/useAuth';
import Loader from '@/layout/loader';

import ProfilePhotoUpload from './profile/ProfilePhotoUpload';
import OtpSection from './profile/OtpSection';
import EducationSection from './profile/EducationSection';
import { useOtpFlow } from './profile/useOtpFlow';

/* ── Validation schema ──────────────────────────────────────────── */
const NAME_PATTERN = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/;

const profileEditSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Minimum 2 characters')
    .max(20, 'Maximum 20 characters')
    .regex(NAME_PATTERN, 'Letters only'),
  lastName: z
    .string()
    .min(2, 'Minimum 2 characters')
    .max(20, 'Maximum 20 characters')
    .regex(NAME_PATTERN, 'Letters only'),
  email: z
    .string()
    .optional()
    .refine((val) => !val || /[^\s@]+@[^\s@]+\.[^\s@]+/.test(val), {
      message: 'Invalid email address',
    }),
  gender: z.enum(['male', 'female', 'other', '']).optional(),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  profilePhoto: z.any().optional(),
});

const EMPTY_EDUCATION = {
  qualification: '',
  collegeName: '',
  specialist: '',
  thesisFileKey: '',
  thesisFile: null,
};

const mapEducationFromUser = (user) => {
  const details = user?.doctorDetails || {};

  return {
    qualification: details.qualification || user?.qualification || '',
    collegeName: details.collegeName || user?.collegeName || '',
    specialist: details.specialist || user?.specialist || '',
    thesisFileKey:
      details.thesisFileKey ||
      details.thesis ||
      details.thesisFile ||
      user?.thesisFileKey ||
      user?.thesis ||
      '',
    thesisFile: null,
  };
};

/* ── Main Component ─────────────────────────────────────────────── */

const ProfileInformation = () => {
  const { userData, isUserLoading, refetchUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [educationData, setEducationData] = useState(EMPTY_EDUCATION);

  const otp = useOtpFlow();
  const isDoctorUser =
    Boolean(userData?.isDoctor) || userData?.role?.toLowerCase() === 'doctor';

  const { mutate: updateProfileMutation, isPending: isUpdatingProfile } =
    useUpdateProfile({
      onSuccess: async (data) => {
        if (data.success) {
          ToastNotification(
            'success',
            data.message || 'Profile updated successfully'
          );
          await refetchUser();
          setIsEditing(false);
          otp.resetOtpFlow();
        } else {
          ToastNotification(
            'error',
            data.message || 'Failed to update profile.'
          );
        }
      },
      onError: (error) =>
        ToastNotification(
          'error',
          error.message || 'Failed to update profile.'
        ),
    });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      gender: '',
      phone: '',
    },
    mode: 'onChange',
  });

  const currentPhone = watch('phone');

  // Load initial form values once user data is available
  useEffect(() => {
    if (userData && !profileData) {
      setProfileData(userData);
      setProfilePhotoPreview(userData.profileImage);
      reset({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        gender: userData.gender || '',
        phone: userData.phone || '',
      });
    }
  }, [userData, profileData, reset]);

  // Keep education (including saved thesis) in sync when not editing
  useEffect(() => {
    if (!userData || isEditing) return;
    setEducationData(mapEducationFromUser(userData));
  }, [userData, isEditing]);

  const handleFilePreview = (fileList) => {
    if (fileList?.[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePhotoPreview(reader.result);
      reader.readAsDataURL(fileList[0]);
    } else {
      // null means the user explicitly removed the photo
      setProfilePhotoPreview(null);
    }
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      setEducationData(mapEducationFromUser(userData));
      setProfilePhotoPreview(userData?.profileImage);
      reset({
        firstName: userData?.firstName || '',
        lastName: userData?.lastName || '',
        email: userData?.email || '',
        gender: userData?.gender || '',
        phone: userData?.phone || '',
      });
      otp.resetOtpFlow();
    }
    setIsEditing((prev) => !prev);
  };

  const handleSave = (values) => {
    if (otp.phoneChanged && !otp.otpVerified) {
      ToastNotification('error', 'Please verify the new phone number with OTP');
      return;
    }
    const payload = { ...values };
    if (isDoctorUser) {
      const { thesisFile, thesisFileKey, ...educationFields } = educationData;
      Object.assign(payload, educationFields);
      if (thesisFile instanceof File) {
        payload.thesisFile = thesisFile;
      }
      if (thesisFileKey) {
        payload.thesisFileKey = thesisFileKey;
      }
    }
    if (values.profilePhoto?.[0]) {
      payload.profilePhotoFile = values.profilePhoto[0];
    } else if (values.profilePhoto === null || values.profilePhoto === '') {
      // User explicitly removed the photo — signal backend to clear it
      payload.profilePhoto = null;
      payload.profileImageFileKey = null;
    }
    updateProfileMutation(payload);
  };

  if (isUserLoading || !userData) {
    return (
      <div className="profile-wireframe-card dashboard-bg-box text-center py-5">
        <Loader />
      </div>
    );
  }

  return (
    <Form
      onSubmit={handleSubmit(handleSave)}
      className="profile-wireframe-form"
    >
      {/* ── CARD 1: PERSONAL INFORMATION ────────────────────────── */}
      <div className="profile-wireframe-card dashboard-bg-box mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="m-0 fw-bold">Personal Information</h4>
          <Btn
            type="button"
            className="btn btn-sm outline-theme d-inline-flex align-items-center gap-2"
            onClick={handleToggleEdit}
            disabled={isUpdatingProfile}
          >
            <RiEdit2Line size={16} /> {isEditing ? 'Cancel' : 'Edit'}
          </Btn>
        </div>

        {/* Centered Avatar Upload */}
        <div className="wireframe-heading text-center mb-3">
          <ProfilePhotoUpload
            control={control}
            isEditing={isEditing && !isUpdatingProfile}
            profilePhotoPreview={profilePhotoPreview}
            onFileChange={handleFilePreview}
            userName={`${userData?.firstName ?? ''} ${userData?.lastName ?? ''}`.trim()}
          />
        </div>

        <Row className="gx-3 gy-2">
          <Col md={6}>
            <FormGroup className="wireframe-field">
              <Label
                className="form-label mb-1 text-uppercase font-weight-bold"
                style={{ fontSize: '12px' }}
              >
                First Name {isEditing && <span className="text-danger">*</span>}
              </Label>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    className="text-capitalize form-control"
                    disabled={!isEditing}
                    invalid={!!errors.firstName}
                  />
                )}
              />
              {errors.firstName && (
                <FormFeedback>{errors.firstName.message}</FormFeedback>
              )}
            </FormGroup>
          </Col>

          <Col md={6}>
            <FormGroup className="wireframe-field">
              <Label
                className="form-label mb-1 text-uppercase font-weight-bold"
                style={{ fontSize: '12px' }}
              >
                Last Name {isEditing && <span className="text-danger">*</span>}
              </Label>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    className="text-capitalize form-control"
                    disabled={!isEditing}
                    invalid={!!errors.lastName}
                  />
                )}
              />
              {errors.lastName && (
                <FormFeedback>{errors.lastName.message}</FormFeedback>
              )}
            </FormGroup>
          </Col>

          <Col md={6}>
            <FormGroup className="wireframe-field">
              <Label
                className="form-label mb-1 text-uppercase font-weight-bold"
                style={{ fontSize: '12px' }}
              >
                Email
              </Label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="email"
                    placeholder="Not added"
                    className="form-control"
                    disabled={!isEditing}
                    invalid={!!errors.email}
                  />
                )}
              />
              {errors.email && (
                <FormFeedback>{errors.email.message}</FormFeedback>
              )}
            </FormGroup>
          </Col>

          <Col md={6}>
            <FormGroup className="wireframe-field">
              <Label
                className="form-label mb-1 text-uppercase font-weight-bold"
                style={{ fontSize: '12px' }}
              >
                Gender
              </Label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Input
                    type="select"
                    {...field}
                    className="form-select"
                    disabled={!isEditing}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Input>
                )}
              />
            </FormGroup>
          </Col>

          <Col md={12}>
            <FormGroup className="wireframe-field profile-phone-group m-0">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <Label
                  className="form-label m-0 text-uppercase font-weight-bold"
                  style={{ fontSize: '12px' }}
                >
                  Mobile Number{' '}
                  {isEditing && <span className="text-danger">*</span>}
                </Label>
                {/* {!isEditing && (
                  <small className="text-muted">
                    <i className="ri-lock-line"></i> Non-editable
                  </small>
                )} */}
              </div>

              <div className="phone-input-row">
                <InputGroup className="phone-input-group">
                  <Input type="select" className="country-code-select" disabled>
                    <option value="+91">+91</option>
                  </Input>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="tel"
                        maxLength={10}
                        className="form-control"
                        disabled={
                          !isEditing || (otp.otpSent && !otp.otpVerified)
                        }
                        invalid={!!errors.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          field.onChange(val);
                          otp.handlePhoneFieldChange(val, profileData.phone);
                        }}
                      />
                    )}
                  />
                  {isEditing && otp.phoneChanged && (
                    <Btn
                      type="button"
                      color="primary"
                      className="send-otp-btn"
                      onClick={() => otp.sendOtp(currentPhone)}
                      disabled={otp.otpSent || currentPhone.length !== 10}
                    >
                      {otp.isCheckingPhone ? <Spinner size="sm" /> : 'Send OTP'}
                    </Btn>
                  )}
                </InputGroup>
              </div>
              {errors.phone && (
                <div className="text-danger small mt-1">
                  {errors.phone.message}
                </div>
              )}
            </FormGroup>

            {/* OTP Section Integration */}
            {otp.otpSent && !otp.otpVerified && isEditing && (
              <div className="mt-3">
                <OtpSection
                  otpDigits={otp.otpDigits}
                  formattedNumber={currentPhone}
                  resendTimer={otp.resendTimer}
                  /* Pass combined loading state so UI reflects resending activity */
                  isCheckingPhone={otp.isCheckingPhone || otp.isResendingPhone}
                  isVerifyingPhone={otp.isVerifyingPhone}
                  inputRefs={otp.inputRefs}
                  onOtpDigitChange={(value, index) =>
                    otp.handleOtpDigitChange(currentPhone, value, index)
                  }
                  onEditPhone={otp.editPhone}
                  onResendOtp={() => otp.resendOtp(currentPhone)}
                />
              </div>
            )}
          </Col>
        </Row>
      </div>

      {/* ── CARD 2: PROFESSIONAL DETAILS ────────────────────────── */}
      {isDoctorUser && (
        <div className="profile-wireframe-card dashboard-bg-box">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="m-0 fw-bold d-flex align-items-center gap-2">
              {/* <i className="ri-stethoscope-line text-theme"></i> */}
              <RiStethoscopeLine className='text-theme' />
              Professional
              Details
            </h4>
          </div>

          <Row className="g-3">
            {/* <Col md={12}>
              <FormGroup className="wireframe-field">
                <Label
                  className="form-label mb-2 text-uppercase font-weight-bold"
                  style={{ fontSize: '12px' }}
                >
                  Qualification
                </Label>
                <div className="d-flex gap-2">
                  <Btn
                    type="button"
                    className={`flex-grow-1 py-2 ${educationData.qualification === 'bachelor' ? 'btn-theme text-white' : 'btn-light border'}`}
                    disabled={!isEditing}
                    onClick={() =>
                      setEducationData({
                        ...educationData,
                        qualification: 'bachelor',
                      })
                    }
                  >
                    Bachelor's
                  </Btn>
                  <Btn
                    type="button"
                    className={`flex-grow-1 py-2 ${educationData.qualification === 'master' ? 'btn-theme text-white' : 'btn-light border'}`}
                    disabled={!isEditing}
                    onClick={() =>
                      setEducationData({
                        ...educationData,
                        qualification: 'master',
                      })
                    }
                  >
                    Master's
                  </Btn>
                </div>
              </FormGroup>
            </Col> */}

            <Col md={12}>
              <EducationSection
                isEditing={isEditing}
                value={educationData}
                onChange={(updates) =>
                  setEducationData((prev) => ({ ...prev, ...updates }))
                }
              />
            </Col>
          </Row>
        </div>
      )}

      {/* ── SAVE ACTION ─────────────────────────────────────────── */}
      {isEditing && (
        <div className="d-flex justify-content-center mt-4">
          <Btn
            type="submit"
            color="primary"
            className="profile-submit-btn px-5 py-2"
            disabled={isUpdatingProfile}
          >
            {isUpdatingProfile ? (
              <>
                <Spinner size="sm" className="me-2" /> Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Btn>
        </div>
      )}
    </Form>
  );
};

export default ProfileInformation;
