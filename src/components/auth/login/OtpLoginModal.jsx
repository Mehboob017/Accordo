'use client';

import React, {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import { ToastNotification } from '@/utils/customFunctions/ToastNotification';
import ResponsiveModal from '@/components/common/ResponsiveModal';
import {
  useCreateProfile,
  useUpdateProfile,
  useDoctorSpecializations,
  useLogin,
  useResendOtp,
  useVerifyOtp,
} from '@/utils/hooks/useAuth';
import {
  otpPhoneSchema,
  otpVerificationSchema,
  registrationFormSchema,
} from '@/utils/validation/ZodValidationSchema';
import CartContext from '@/helper/cartContext';
import { isTurnstileRequired } from '@/utils/constants';

// Hooks
import { useOtpAuthFlow } from './hooks/useOtpAuthFlow';
import { useCameraCapture } from './hooks/useCameraCapture';
import { useFilePreview } from './hooks/useFilePreview';

// Components
import PhoneNumberForm from './components/PhoneNumberForm';
import OtpVerificationForm from './components/OtpVerificationForm';
import RegistrationContainer from './components/RegistrationContainer';
import KycPendingView from './components/KycPendingView';
import CameraModal from './components/CameraModal';
import ProfilePickerModal from './components/ProfilePickerModal';

// Assets
import BrandLogo from '../../../../public/assets/images/logo/sdl_logo.gif';
import playstoreImage from '../../../../public/assets/images/icon/play-store.png';
import appstoreImage from '../../../../public/assets/images/icon/app-store.png';
import { useUser } from '@/utils/hooks/useUser';
import {
  POST_LOGIN_ACTIONS,
  clearPendingPostLoginAction,
  executePendingPostLoginAction,
} from '@/utils/postLoginAction';

const OtpLoginModal = ({
  isOpen,
  onClose,
  setOpen,
  redirectUrl,
  onLoginSuccess,
  isUpgradeMode = false,
  isReapplyMode = false,
}) => {
  const { themeOption } = useContext(ThemeOptionContext);
  const { signupBonusCoins } = useContext(CartContext);
  const [showProfilePicker, setShowProfilePicker] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [otpServerError, setOtpServerError] = useState('');
  const [otpValidationState, setOtpValidationState] = useState('idle');
  const [kycValidationAttempted, setKycValidationAttempted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  const profilePhotoInputRef = useRef(null);
  const firstNameInputRef = useRef(null);
  const registrationNumberInputRef = useRef(null);

  const router = useRouter();
  const queryClient = useQueryClient();

  const { refetchUser, userData } = useUser();

  // 🚀 FIXED: Automatically detect edit mode even if props aren't passed explicitly
  const isEditDoctorMode = Boolean(
    isUpgradeMode ||
    isReapplyMode ||
    (userData?.role === 'Doctor' && userData?.doctorDetails)
  );

  // Custom hooks
  const authFlow = useOtpAuthFlow();
  const cameraCapture = useCameraCapture();
  const filePreviews = useFilePreview();

  const runPendingPostLoginAction = useCallback(async () => {
    try {
      const executedAction = await executePendingPostLoginAction(queryClient);

      if (
        executedAction?.action?.type === POST_LOGIN_ACTIONS.WISHLIST_PRODUCT &&
        executedAction?.result?.success
      ) {
        ToastNotification(
          'success',
          executedAction.result.message || 'Product added to wishlist.'
        );
      }

      if (
        executedAction?.action?.type === POST_LOGIN_ACTIONS.BLOG_BOOKMARK &&
        executedAction?.result?.success
      ) {
        const didAdd =
          typeof executedAction?.action?.add === 'boolean'
            ? executedAction.action.add
            : true;

        ToastNotification(
          'success',
          executedAction.result.message ||
          (didAdd
            ? 'Blog bookmarked successfully.'
            : 'Blog bookmark removed successfully.')
        );
      }
    } catch (error) {
      ToastNotification(
        'error',
        error?.message ||
        'Unable to complete your pending action. Please try again.'
      );
    }
  }, [queryClient]);

  // Form hooks
  const {
    control: phoneControl,
    handleSubmit: handlePhoneSubmit,
    watch: watchPhone,
    reset: resetPhone,
    formState: { errors: phoneErrors, isValid: isPhoneValid },
  } = useForm({
    resolver: zodResolver(otpPhoneSchema),
    defaultValues: {
      countryCode: '+91',
      phone: '',
    },
    mode: 'onChange',
  });

  const {
    control: otpControl,
    handleSubmit: handleOtpSubmit,
    reset: resetOtp,
    setValue: setOtpValue,
    formState: { errors: otpErrors, isValid: isOtpValid },
  } = useForm({
    resolver: zodResolver(otpVerificationSchema),
    defaultValues: {
      otp: '',
    },
    mode: 'onChange',
  });

  // Wire react-hook-form's setValue into the Web OTP hook so the auto-read
  // effect can populate the hidden OTP field without prop-drilling.
  useEffect(() => {
    authFlow.registerSetOtpValue(setOtpValue);
  }, [setOtpValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    control: regControl,
    handleSubmit: handleRegSubmit,
    watch: watchReg,
    reset: resetReg,
    getValues: getRegValues,
    setValue: setRegValue,
    trigger: triggerReg,
    clearErrors: clearRegErrors,
    formState: {
      errors: regErrors,
      touchedFields: regTouchedFields,
      dirtyFields: regDirtyFields,
    },
  } = useForm({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      gender: '',
      profilePhoto: undefined,
      role: undefined,
      registrationNumber: '',
      degreeCertificate: undefined,
      registrationCertificate: undefined,
      specialization: [],
    },
    mode: 'onChange',
  });

  const watchedRegValues = watchReg();
  const selectedRole = watchedRegValues.role;
  const watchedRegNumber = watchedRegValues.registrationNumber;
  const watchedRegCertificate = watchedRegValues.registrationCertificate;
  const phoneNumber = watchPhone('phone');

  const hasRegistrationCertificate = useCallback((cert) => {
    return cert && (cert instanceof FileList ? cert.length > 0 : Boolean(cert));
  }, []);

  const closeAndReset = useCallback(
    (isSuccess = false) => {
      if (!isSuccess) {
        clearPendingPostLoginAction();
      }
      authFlow.resetFlow();
      setOtpServerError('');
      setOtpValidationState('idle');
      resetPhone();
      resetOtp();
      resetReg();
      filePreviews.resetPreviews();
      setShowProfilePicker(false);
      setKycValidationAttempted(false);
      setTurnstileToken('');

      if (!isSuccess) {
        onClose?.();
      }

      setOpen?.(false);
    },
    [authFlow, resetPhone, resetOtp, resetReg, filePreviews, onClose, setOpen]
  );

  // React Query mutations
  const loginMutation = useLogin({
    onSuccess: (data) => {
      ToastNotification(
        'success',
        `${data.message}` || `OTP sent successfully! `
      );
      authFlow.moveToOtpStep();
      setTimeout(() => {
        authFlow.inputRefs.current?.[0]?.focus();
      }, 500);
    },
    onError: (error) => {
      ToastNotification(
        'error',
        error?.message || 'Failed to send OTP. Please try again.'
      );
    },
  });

  const verifyOtpMutation = useVerifyOtp({
    onSuccess: async (data) => {
      setOtpServerError('');
      if (data.success && data.data?.customerStatus === 'inactive') {
        setOtpValidationState('idle');
        ToastNotification(
          'info',
          data.message ||
          'Your account is inactive. Please contact customer support.'
        );
        closeAndReset();
        return;
      }
      if (data.success) {
        setOtpValidationState('success');

        const needsProfile = String(data.data?.needsProfile) === 'true';
        const isNewUser = String(data.data?.isNewUser) === 'true';

        if (needsProfile || isNewUser) {
          if (
            data?.data?.token &&
            !data?.data?.needsProfile &&
            typeof window !== 'undefined'
          ) {
            localStorage.setItem('userToken', data.data.token);
          }

          ToastNotification('success', 'Please complete your profile.');
          authFlow.moveToRegistrationStep();
        } else {
          ToastNotification(
            'success',
            data.message || 'Login successful! Welcome back.'
          );

          if (
            data?.data?.token &&
            !data?.data?.needsProfile &&
            typeof window !== 'undefined'
          ) {
            localStorage.setItem('userToken', data.data.token);
          }

          refetchUser();
          await runPendingPostLoginAction();
          closeAndReset(true);

          if (onLoginSuccess) {
            onLoginSuccess();
          }

          if (redirectUrl) {
            router.push(redirectUrl);
          } else {
            router.refresh();
          }
        }
      } else {
        setOtpValidationState('error');
        setOtpServerError(data.message || 'Invalid OTP. Please try again.');
      }
    },
    onError: (error) => {
      setOtpValidationState('error');
      setOtpServerError(
        error?.message || 'Failed to verify OTP. Please try again.'
      );
    },
  });

  const resendOtpMutation = useResendOtp({
    onSuccess: (data) => {
      setOtpServerError('');
      setOtpValidationState('idle');
      ToastNotification(
        'success',
        `${data.message}` || `OTP sent successfully!`
      );
      authFlow.setOtpDigits(authFlow.getDigitsArray());
      resetOtp();
      authFlow.incrementResendKey();
      setTimeout(() => {
        authFlow.inputRefs.current?.[0]?.focus();
      }, 500);
    },
    onError: (error) => {
      ToastNotification(
        'error',
        error?.message || 'Failed to resend OTP. Please try again.'
      );
    },
  });

  const updateProfileMutation = useUpdateProfile({
    onSuccess: async (data) => {
      refetchUser();
      ToastNotification(
        'success',
        data.message || 'Your profile has been upgraded to Vaidya!'
      );
      authFlow.moveToKycPendingStep();
    },
    onError: (error) => {
      ToastNotification(
        'error',
        error?.message || 'Upgrade failed. Please try again.'
      );
    },
  });

  const createProfileMutation = useCreateProfile({
    onSuccess: async (data) => {
      if (
        data?.data?.token &&
        !data?.data?.needsProfile &&
        typeof window !== 'undefined'
      ) {
        localStorage.setItem('userToken', data.data.token);
      }

      refetchUser();
      await runPendingPostLoginAction();

      if (data.data.user.role === 'Doctor') {
        ToastNotification(
          'success',
          data.message || 'Registration completed successfully!'
        );
        authFlow.moveToKycPendingStep();
      } else {
        ToastNotification(
          'success',
          data.message || 'Registration completed successfully!'
        );
        closeAndReset(true);

        if (onLoginSuccess) {
          onLoginSuccess();
        }

        if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          router.refresh();
        }
      }
    },
    onError: (error) => {
      ToastNotification(
        'error',
        error?.message || 'Registration failed. Please try again.'
      );
    },
  });

  // Fetch doctor specializations
  const { data: specializations = [], isLoading: isLoadingSpecializations } =
    useDoctorSpecializations({
      enabled:
        isOpen && selectedRole === 'Doctor' && authFlow.registrationStep === 3,
      staleTime: 1 * 60 * 1000,
    });

  const formattedNumber = useMemo(() => {
    if (!phoneNumber) return '';
    const cleaned = phoneNumber.replace(/\D/g, '').slice(0, 10);
    if (cleaned.length <= 5) return cleaned;
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }, [phoneNumber]);

  useEffect(() => {
    const updateIsMobileView = () => {
      if (typeof window !== 'undefined') {
        setIsMobileView(window.innerWidth < 768);
      }
    };

    updateIsMobileView();
    window.addEventListener('resize', updateIsMobileView);
    return () => window.removeEventListener('resize', updateIsMobileView);
  }, []);

  useEffect(() => {
    if (isOpen && authFlow.step === 3 && authFlow.registrationStep === 1) {
      setTimeout(() => {
        firstNameInputRef.current?.focus();
      }, 500);
    }
  }, [isOpen, authFlow.step, authFlow.registrationStep]);

  useEffect(() => {
    if (isOpen && authFlow.step === 3 && authFlow.registrationStep === 2) {
      setTimeout(() => {
        registrationNumberInputRef.current?.focus();
      }, 500);
    }
  }, [isOpen, authFlow.step, authFlow.registrationStep]);

  useEffect(() => {
    if (authFlow.registrationStep === 2) {
      clearRegErrors(['registrationNumber', 'registrationCertificate']);
      setKycValidationAttempted(false);
    }
  }, [authFlow.registrationStep, clearRegErrors]);

  useEffect(() => {
    if (
      authFlow.registrationStep === 2 &&
      selectedRole === 'Doctor' &&
      watchedRegNumber?.trim() &&
      hasRegistrationCertificate(watchedRegCertificate)
    ) {
      triggerReg(['registrationNumber', 'registrationCertificate']);
    }
  }, [
    authFlow.registrationStep,
    selectedRole,
    watchedRegNumber,
    watchedRegCertificate,
    triggerReg,
    hasRegistrationCertificate,
  ]);

  // UNIFIED LIFECYCLE EFFECT: Handles Modal Open/Close, Resetting, and Pre-filling
  useEffect(() => {
    if (isOpen) {
      // 🚨 GUARD 1: Prevent background userData refetches from resetting completed KYC flows
      if (authFlow.step === 4) return;

      // 1. Clean up stale UI states first
      filePreviews.resetPreviews();
      setShowProfilePicker(false);
      setKycValidationAttempted(false);
      setOtpServerError('');
      setOtpValidationState('idle');

      // 2. Check if we are in Upgrade, Reapply, or Editing Existing Doctor Mode
      if (isEditDoctorMode) {
        // Jump directly to Registration Container -> KYC Step 2
        if (authFlow.step !== 3) {
          authFlow.setStep(3);
          authFlow.setRegistrationStep(2);
        }
        setRegValue('role', 'Doctor', { shouldValidate: true });

        // Pre-fill basic user data
        if (userData) {
          setRegValue('firstName', userData.firstName || '', {
            shouldValidate: true,
            shouldDirty: true,
          });
          setRegValue('lastName', userData.lastName || '', {
            shouldValidate: true,
            shouldDirty: true,
          });
          setRegValue('email', userData.email || '', {
            shouldValidate: true,
            shouldDirty: true,
          });
        }

        // 🚀 FIXED: Properly bind existing document URLs and populate file previews
        const docDetails = userData?.doctorDetails;
        if (docDetails) {
          const kycDoc = docDetails.doctorKycDocuments?.[0] || {};

          const regNum =
            kycDoc.registrationNo || docDetails.registrationNo || '';
          if (regNum) {
            setRegValue('registrationNumber', regNum, {
              shouldValidate: true,
              shouldDirty: true,
            });
          }

          const regUrl =
            kycDoc.registrationFile || docDetails.registrationFileUrl;
          if (regUrl) {
            setRegValue('registrationCertificate', regUrl, {
              shouldValidate: true,
              shouldDirty: true,
            });
            filePreviews.setRegCertPreview(regUrl);
            const cleanRegName =
              regUrl.split('/').pop()?.split('-').slice(1).join('-') ||
              'Registration_Certificate.png';
            filePreviews.setRegCertName(cleanRegName);
          }

          const degreeUrl = kycDoc.degreeFile || docDetails.degreeFileUrl;
          if (degreeUrl) {
            setRegValue('degreeCertificate', degreeUrl, {
              shouldValidate: true,
              shouldDirty: true,
            });
            filePreviews.setDegreeCertPreview(degreeUrl);
            const cleanDegreeName =
              degreeUrl.split('/').pop()?.split('-').slice(1).join('-') ||
              'Degree_Certificate.png';
            filePreviews.setDegreeCertName(cleanDegreeName);
          }

          if (docDetails.doctorSpecializations?.length > 0) {
            const existingSpecializationIds = docDetails.doctorSpecializations
              .map((item) => item.specialisationUid || item.specialization?.uid)
              .filter(Boolean);

            setRegValue('specialization', existingSpecializationIds, {
              shouldValidate: true,
              shouldDirty: true,
            });
          }
        }
      } else {
        // 🚨 GUARD 2: STANDARD LOGIN MODE
        // Only reset to Step 1 if the modal is freshly opening (step is 1 and untouched),
        // preventing background userData refetches from wiping out OTP or Registration progress!
        if (authFlow.step === 1 && !watchPhone('phone')) {
          authFlow.resetFlow();
          resetPhone();
          resetOtp();
          resetReg();
          setTimeout(() => {
            authFlow.phoneInputRef?.current?.focus();
          }, 500);
        }
      }
    } else {
      // 3. Cleanup when the modal closes
      authFlow.resetFlow();
      setShowProfilePicker(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isEditDoctorMode, userData]);

  const turnstileRequired = isTurnstileRequired();

  // Handlers
  const handleSendOtp = useCallback(
    async (data) => {
      if (turnstileRequired && !turnstileToken) {
        ToastNotification('error', 'Please complete the security check');
        return;
      }
      const phoneNum = `${data.countryCode}${data.phone}`;
      loginMutation.mutate({
        phone: phoneNum,
        ...(turnstileToken ? { turnstileToken } : {}),
      });
    },
    [loginMutation, turnstileToken, turnstileRequired]
  );

  const handleVerify = useCallback(
    async (data) => {
      setOtpServerError('');
      setOtpValidationState('idle');
      const phoneData = watchPhone();
      const phoneNum = `${phoneData.countryCode}${phoneData.phone}`;
      verifyOtpMutation.mutate({ phone: phoneNum, otp: data.otp });
    },
    [verifyOtpMutation, watchPhone]
  );

  const handleResend = useCallback(
    (e) => {
      e.preventDefault();
      if (authFlow.resendTimer > 0 || resendOtpMutation.isPending) return;
      setOtpServerError('');
      setOtpValidationState('idle');
      const phoneData = watchPhone();
      const phoneNum = `${phoneData.countryCode}${phoneData.phone}`;
      resendOtpMutation.mutate({ phone: phoneNum });
    },
    [authFlow.resendTimer, resendOtpMutation, watchPhone]
  );

  const handleRegistration = useCallback(
    async (data) => {
      const phoneData = watchPhone();
      const phoneNum = `${phoneData.countryCode}${phoneData.phone}`;

      const payload = {
        role: isEditDoctorMode ? 'Doctor' : data.role,
        firstName: data.firstName || userData?.firstName || '',
        lastName: data.lastName || userData?.lastName || '',
        email: data.email || userData?.email || '',
      };

      if (data.registrationNumber) {
        payload.registrationNo = data.registrationNumber;
      }

      if (
        data.registrationCertificate?.[0] instanceof File ||
        (typeof window !== 'undefined' &&
          data.registrationCertificate instanceof FileList &&
          data.registrationCertificate.length > 0)
      ) {
        payload.registrationFile = data.registrationCertificate[0];
      }

      if (
        data.degreeCertificate?.[0] instanceof File ||
        (typeof window !== 'undefined' &&
          data.degreeCertificate instanceof FileList &&
          data.degreeCertificate.length > 0)
      ) {
        payload.degreeFile = data.degreeCertificate[0];
      }

      if (data.specialization?.length > 0) {
        payload.specializationUids = data.specialization;
      }

      if (isEditDoctorMode) {
        if (
          data.profilePhoto?.[0] instanceof File ||
          (typeof window !== 'undefined' &&
            data.profilePhoto instanceof FileList &&
            data.profilePhoto.length > 0)
        ) {
          payload.profilePhotoFile = data.profilePhoto[0];
        }

        updateProfileMutation.mutate(payload);
      } else {
        payload.profileImageFile = data.profilePhoto?.[0] || null;
        payload.phone = phoneNum;

        if (!payload.registrationNo) payload.registrationNo = '';

        createProfileMutation.mutate(payload);
      }
    },
    [
      watchPhone,
      isEditDoctorMode,
      userData,
      updateProfileMutation,
      createProfileMutation,
    ]
  );

  const handleProfileUploadClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowProfilePicker(true);
  }, []);

  const triggerProfileFilePicker = useCallback((source = 'gallery') => {
    if (!profilePhotoInputRef.current) return;
    if (source === 'camera') {
      profilePhotoInputRef.current.setAttribute('capture', 'environment');
    } else {
      profilePhotoInputRef.current.removeAttribute('capture');
    }
    profilePhotoInputRef.current.click();
  }, []);

  const handleNextRegistrationStep = useCallback(async () => {
    if (authFlow.registrationStep === 1) {
      const isValid = await triggerReg([
        'firstName',
        'lastName',
        'email',
        'role',
      ]);
      if (isValid) {
        if (selectedRole === 'Doctor') {
          authFlow.nextRegistrationStep();
        } else {
          const formData = getRegValues();
          await handleRegistration(formData);
        }
      }
    } else if (authFlow.registrationStep === 2) {
      setKycValidationAttempted(true);
      const isValid = await triggerReg([
        'registrationNumber',
        'registrationCertificate',
      ]);
      if (isValid) {
        authFlow.nextRegistrationStep();
      }
    }
  }, [authFlow, triggerReg, selectedRole, getRegValues, handleRegistration]);

  const isRegistrationStep1Valid = useCallback(() => {
    const { firstName, lastName, role, email } = watchedRegValues;
    if (!firstName || !lastName || !role) return false;
    if (regErrors.firstName || regErrors.lastName || regErrors.role)
      return false;
    if (email && regErrors.email) return false;
    return true;
  }, [watchedRegValues, regErrors]);

  const isRegistrationStep2Valid = useCallback(() => {
    const hasRegNumber = Boolean(watchedRegNumber?.trim());
    const hasCert = hasRegistrationCertificate(watchedRegCertificate);
    return hasRegNumber && hasCert;
  }, [watchedRegNumber, watchedRegCertificate, hasRegistrationCertificate]);

  // Memoized reactive check to ensure the button updates cleanly when state changes
  const isSubmitButtonEnabled = useMemo(() => {
    const {
      firstName,
      lastName,
      role,
      email,
      registrationNumber,
      registrationCertificate,
    } = watchedRegValues;
    const isDoctor = role === 'Doctor';

    // Fallback to userData if form fields haven't finished binding in edit mode
    const effectiveFirstName = firstName || userData?.firstName;
    const effectiveLastName = lastName || userData?.lastName;

    if (!effectiveFirstName || !effectiveLastName || !role) return false;
    if (regErrors.firstName || regErrors.lastName || regErrors.role)
      return false;
    if (email && regErrors.email) return false;

    if (isDoctor) {
      if (!registrationNumber || !registrationCertificate) return false;
      if (regErrors.registrationNumber || regErrors.registrationCertificate)
        return false;
    }

    return true;
  }, [watchedRegValues, regErrors, userData]);

  const getRegistrationTitle = useCallback(() => {
    if (authFlow.registrationStep === 1) return 'Complete Your Profile';
    if (authFlow.registrationStep === 2) return 'Complete Your KYC';
    if (authFlow.registrationStep === 3) return 'Select Your Specializations';
    return 'Complete Registration';
  }, [authFlow.registrationStep]);

  const getRegistrationProgress = useCallback(() => {
    return Math.round((authFlow.registrationStep / 3) * 90);
  }, [authFlow.registrationStep]);

  const renderContent = () => {
    switch (authFlow.step) {
      case 1:
        return (
          <PhoneNumberForm
            phoneControl={phoneControl}
            phoneErrors={phoneErrors}
            isPhoneValid={isPhoneValid && (!turnstileRequired || !!turnstileToken)}
            handlePhoneSubmit={handlePhoneSubmit}
            handleSendOtp={handleSendOtp}
            loginMutation={loginMutation}
            phoneInputRef={authFlow.phoneInputRef}
            setTurnstileToken={setTurnstileToken}
            isTurnstileRequired={turnstileRequired}
          />
        );
      case 2:
        return (
          <OtpVerificationForm
            otpControl={otpControl}
            otpErrors={otpErrors}
            otpServerError={otpServerError}
            otpValidationState={otpValidationState}
            isOtpValid={isOtpValid}
            handleOtpSubmit={handleOtpSubmit}
            handleVerify={handleVerify}
            verifyOtpMutation={verifyOtpMutation}
            resendOtpMutation={resendOtpMutation}
            otpDigits={authFlow.otpDigits}
            handleOtpChange={(value, index) =>
              authFlow.handleOtpChange(value, index, setOtpValue)
            }
            handleOtpKeyDown={authFlow.handleOtpKeyDown}
            inputRefs={authFlow.inputRefs}
            formattedNumber={formattedNumber}
            resendTimer={authFlow.resendTimer}
            handleResend={handleResend}
            onEditPhone={() => authFlow.setStep(1)}
            resetOtp={resetOtp}
            phoneInputRef={authFlow.phoneInputRef}
            clearOtpServerError={() => {
              setOtpServerError('');
              setOtpValidationState('idle');
            }}
          />
        );
      case 3:
        return (
          <RegistrationContainer
            isUpgradeMode={isEditDoctorMode}
            handleBackRegistrationStep={
              isEditDoctorMode && authFlow.registrationStep === 2
                ? undefined
                : authFlow.previousRegistrationStep
            }
            activeMutation={
              isEditDoctorMode ? updateProfileMutation : createProfileMutation
            }
            registrationStep={authFlow.registrationStep}
            selectedRole={selectedRole}
            regControl={regControl}
            regErrors={regErrors}
            regTouchedFields={regTouchedFields}
            regDirtyFields={regDirtyFields}
            kycValidationAttempted={kycValidationAttempted}
            profilePhotoPreview={filePreviews.profilePhotoPreview}
            handleProfileUploadClick={handleProfileUploadClick}
            profilePhotoInputRef={profilePhotoInputRef}
            handleFilePreview={filePreviews.handleFilePreview}
            onRemovePhoto={() => {
              if (profilePhotoInputRef.current) {
                profilePhotoInputRef.current.value = '';
              }
              setRegValue('profilePhoto', null);
              filePreviews.setProfilePhotoPreview(null);
            }}
            regCertPreview={filePreviews.regCertPreview}
            regCertName={filePreviews.regCertName}
            degreeCertPreview={filePreviews.degreeCertPreview}
            degreeCertName={filePreviews.degreeCertName}
            setRegCertPreview={filePreviews.setRegCertPreview}
            setRegCertName={filePreviews.setRegCertName}
            setDegreeCertPreview={filePreviews.setDegreeCertPreview}
            setDegreeCertName={filePreviews.setDegreeCertName}
            specializations={specializations}
            isLoadingSpecializations={isLoadingSpecializations}
            getRegistrationProgress={getRegistrationProgress}
            handleRegSubmit={handleRegSubmit}
            handleRegistration={handleRegistration}
            handleNextRegistrationStep={handleNextRegistrationStep}
            isRegistrationStep1Valid={isRegistrationStep1Valid}
            isRegistrationStep2Valid={isRegistrationStep2Valid}
            isSubmitButtonEnabled={() => isSubmitButtonEnabled}
            triggerReg={triggerReg}
            getRegValues={getRegValues}
            firstNameInputRef={firstNameInputRef}
            registrationNumberInputRef={registrationNumberInputRef}
          />
        );
      case 4:
        return <KycPendingView onClose={closeAndReset} />;
      default:
        return null;
    }
  };

  return (
    <>
      <ResponsiveModal
        modal={isOpen}
        setModal={setOpen}
        extraFunction={closeAndReset}
        showCloseButton={
          authFlow.registrationStep === 1 && !isEditDoctorMode ? false : true
        }
        classes={{
          modalClass: 'theme-modal view-modal modal-md otp-login-modal',
          offcanvasClass: 'otp-login-offcanvas',
          modalHeaderClass: 'justify-content-between',
          title:
            authFlow.step === 1
              ? 'Login'
              : authFlow.step === 2
                ? 'Verify OTP'
                : authFlow.step === 4
                  ? 'KYC Under Process'
                  : getRegistrationTitle(),
        }}
      >
        <div className="otp-login-wrapper">
          {renderContent()}

          {/* Bottom Section with Logo and App Download Buttons */}
          {authFlow.step !== 3 && authFlow.step !== 4 && (
            <div className="otp-login-bottom-section">
              <div className="otp-logo text-center mb-2">
                <Image
                  src={BrandLogo}
                  alt="Brand logo"
                  width={120}
                  height={48}
                  className="img-fluid"
                  priority
                />
              </div>

              <div className="otp-app-title text-center mb-1 fs-6">
                Dhootapapeshwar App is LIVE!
              </div>
              <p className="otp-app-text text-center mb-2">
                Download & Signup, to get {signupBonusCoins} SDL Points.
              </p>

              {(themeOption?.footer?.app_store_url ||
                themeOption?.footer?.play_store_url) && (
                  <div className="otp-app-buttons">
                    {themeOption?.footer?.play_store_url && (
                      <Link
                        href={themeOption.footer.play_store_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="otp-app-button"
                      >
                        <Image
                          src={playstoreImage}
                          alt="Get it on Google Play"
                          height={100}
                          width={100}
                          className="img-fluid"
                        />
                      </Link>
                    )}
                    {themeOption?.footer?.app_store_url && (
                      <Link
                        href={themeOption.footer.app_store_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="otp-app-button"
                      >
                        <Image
                          src={appstoreImage}
                          alt="Download on the App Store"
                          height={100}
                          width={100}
                          className="img-fluid"
                        />
                      </Link>
                    )}
                  </div>
                )}
            </div>
          )}
        </div>
      </ResponsiveModal>

      <CameraModal
        isOpen={cameraCapture.showCameraModal}
        onClose={() => cameraCapture.setShowCameraModal(false)}
        cameraError={cameraCapture.cameraError}
        videoRef={cameraCapture.videoRef}
        onCapture={() => {
          cameraCapture.capturePhoto((fileList) => {
            setRegValue('profilePhoto', fileList, { shouldValidate: true });
            filePreviews.handleFilePreview(fileList, 'profile');
          });
        }}
      />

      <ProfilePickerModal
        isOpen={showProfilePicker}
        onClose={() => setShowProfilePicker(false)}
        isMobileView={isMobileView}
        onTakePhoto={() => {
          const supportsDesktopCamera =
            typeof navigator !== 'undefined' &&
            !!navigator.mediaDevices?.getUserMedia;
          if (!isMobileView && supportsDesktopCamera) {
            setShowProfilePicker(false);
            cameraCapture.setShowCameraModal(true);
          } else {
            setShowProfilePicker(false);
            triggerProfileFilePicker('camera');
          }
        }}
        onChooseFromGallery={() => {
          setShowProfilePicker(false);
          triggerProfileFilePicker('gallery');
        }}
      />
    </>
  );
};

export default OtpLoginModal;
