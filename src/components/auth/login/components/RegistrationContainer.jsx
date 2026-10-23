import React from 'react';
import { Form } from 'reactstrap';
import Btn from '@/elements/buttons/Btn';
import RegistrationBasicInfoForm from './RegistrationBasicInfoForm';
import RegistrationDoctorDetailsForm from './RegistrationDoctorDetailsForm';
import RegistrationSpecializationForm from './RegistrationSpecializationForm';

const RegistrationContainer = ({
  isUpgradeMode,
  registrationStep,
  activeMutation,
  selectedRole,
  regControl,
  regErrors,
  regTouchedFields,
  regDirtyFields,
  kycValidationAttempted,
  profilePhotoPreview,
  handleProfileUploadClick,
  profilePhotoInputRef,
  handleFilePreview,
  regCertPreview,
  regCertName,
  degreeCertPreview,
  degreeCertName,
  setRegCertPreview,
  setRegCertName,
  setDegreeCertPreview,
  setDegreeCertName,
  specializations,
  isLoadingSpecializations,
  getRegistrationProgress,
  handleBackRegistrationStep,
  handleRegSubmit,
  handleRegistration,
  handleNextRegistrationStep,
  isRegistrationStep1Valid,
  isRegistrationStep2Valid,
  isSubmitButtonEnabled,
  // createProfileMutation,
  triggerReg,
  getRegValues,
  firstNameInputRef,
  registrationNumberInputRef,
  onRemovePhoto,
}) => {
  const renderRegistrationFormStep = () => {
    switch (registrationStep) {
      case 1:
        return (
          <RegistrationBasicInfoForm
            regControl={regControl}
            regErrors={regErrors}
            profilePhotoPreview={profilePhotoPreview}
            handleProfileUploadClick={handleProfileUploadClick}
            profilePhotoInputRef={profilePhotoInputRef}
            handleFilePreview={handleFilePreview}
            onRemovePhoto={onRemovePhoto}
            firstNameInputRef={firstNameInputRef}
          />
        );
      case 2:
        return (
          <RegistrationDoctorDetailsForm
            isUpgradeMode={isUpgradeMode}
            regControl={regControl}
            regErrors={regErrors}
            regTouchedFields={regTouchedFields}
            regDirtyFields={regDirtyFields}
            kycValidationAttempted={kycValidationAttempted}
            regCertPreview={regCertPreview}
            regCertName={regCertName}
            degreeCertPreview={degreeCertPreview}
            degreeCertName={degreeCertName}
            handleFilePreview={handleFilePreview}
            setRegCertPreview={setRegCertPreview}
            setRegCertName={setRegCertName}
            setDegreeCertPreview={setDegreeCertPreview}
            setDegreeCertName={setDegreeCertName}
            onBack={handleBackRegistrationStep}
            getRegistrationProgress={getRegistrationProgress}
            registrationNumberInputRef={registrationNumberInputRef}
          />
        );
      case 3:
        return (
          <RegistrationSpecializationForm
            regControl={regControl}
            specializations={specializations}
            isLoadingSpecializations={isLoadingSpecializations}
            onBack={handleBackRegistrationStep}
            getRegistrationProgress={getRegistrationProgress}
          />
        );
      default:
        return (
          <RegistrationBasicInfoForm
            regControl={regControl}
            regErrors={regErrors}
            profilePhotoPreview={profilePhotoPreview}
            handleProfileUploadClick={handleProfileUploadClick}
            profilePhotoInputRef={profilePhotoInputRef}
            handleFilePreview={handleFilePreview}
            onRemovePhoto={onRemovePhoto}
            firstNameInputRef={firstNameInputRef}
          />
        );
    }
  };

  const renderRegistrationFooterButton = () => {
    const isDoctor = selectedRole === 'Doctor';

    if (isDoctor && registrationStep < 3) {
      const isStepValid =
        registrationStep === 1
          ? isRegistrationStep1Valid()
          : isRegistrationStep2Valid();
      return (
        <Btn
          type="button"
          size="md"
          color="primary"
          className="w-100 rounded-0"
          onClick={handleNextRegistrationStep}
          disabled={!isStepValid || activeMutation.isPending}
          style={{
            opacity: !isStepValid || activeMutation.isPending ? 0.7 : 1,
            cursor:
              !isStepValid || activeMutation.isPending
                ? 'not-allowed'
                : 'pointer',
          }}
        >
          Next
        </Btn>
      );
    }

    const isSubmitEnabled = isSubmitButtonEnabled();

    return (
      <Btn
        type="button"
        size="md"
        color="primary"
        className="w-100"
        onClick={async () => {
          if (isDoctor && registrationStep === 3) {
            // --- FIX: Dynamic Validation Array ---
            const fieldsToValidate = isUpgradeMode
              ? ['role', 'registrationNumber', 'registrationCertificate'] // Only check KYC for upgrades
              : [
                  'firstName',
                  'lastName',
                  'email',
                  'role',
                  'registrationNumber',
                  'registrationCertificate',
                ]; // Check everything for new profiles

            const isValid = await triggerReg(fieldsToValidate);

            if (isValid) {
              const formData = getRegValues();
              // console.log('Validation passed! Submitting: ', formData);
              await handleRegistration(formData);
            } else {
              // console.log('Validation failed! Check form errors.', regErrors);
            }
          } else if (!isDoctor) {
            const isValid = await triggerReg([
              'firstName',
              'lastName',
              'email',
              'role',
            ]);

            if (isValid) {
              const formData = getRegValues();
              await handleRegistration(formData);
            }
          }
        }}
        disabled={!isSubmitEnabled || activeMutation.isPending}
        style={{
          opacity: !isSubmitEnabled || activeMutation.isPending ? 0.7 : 1,
          cursor:
            !isSubmitEnabled || activeMutation.isPending
              ? 'not-allowed'
              : 'pointer',
        }}
      >
        {activeMutation.isPending ? (
          <>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            Submitting...
          </>
        ) : (
          'Submit'
        )}
      </Btn>
    );
  };

  return (
    <div className="otp-login-top-section">
      <Form className="otp-step" onSubmit={handleRegSubmit(handleRegistration)}>
        <div
          className={`responsive-form-scrollable ${
            registrationStep === 3
              ? 'responsive-form-scrollable--specialization'
              : ''
          }`}
          key={registrationStep}
        >
          {renderRegistrationFormStep()}
        </div>

        {/* Fixed Footer Button */}
        <div className="address-form-footer">
          {renderRegistrationFooterButton()}
        </div>
      </Form>
    </div>
  );
};

export default RegistrationContainer;
