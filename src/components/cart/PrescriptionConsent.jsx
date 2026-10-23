'use client';

import { useContext } from 'react';
import UserContext from '@/helper/userContext';
import PrescriptionModule from './PrescriptionModule';
import { usePrescriptionUpload } from '@/utils/hooks/usePrescriptionUpload';

const PrescriptionConsent = ({
  cartItems = [],
  isAuthenticated: isAuthenticatedProp,
  userData: userDataProp,
  onRequireLogin,
  onValidationChange,
  error,
}) => {
  const { userData: contextUserData, isAuthenticated: contextAuthState } =
    useContext(UserContext);

  const effectiveUserData = userDataProp ?? contextUserData;
  const effectiveAuthState =
    typeof isAuthenticatedProp === 'boolean'
      ? isAuthenticatedProp
      : contextAuthState;

  const {
    uploadedFiles,
    isUploading,
    error: hookError,
    isDoctor,
    appendFiles,
    removeFileAtIndex,
    replaceFileAtIndex,
    clearLocalError,
  } = usePrescriptionUpload({
    cartItems,
    isAuthenticated: effectiveAuthState,
    userData: effectiveUserData,
    onRequireLogin,
    onValidationChange,
    externalError: error,
  });

  return (
    <PrescriptionModule
      cartItems={cartItems}
      uploadedFiles={uploadedFiles}
      onUpload={appendFiles}
      onRemove={removeFileAtIndex}
      onReplace={replaceFileAtIndex}
      error={hookError}
      isUploading={isUploading}
      isAuthenticated={effectiveAuthState}
      isDoctor={isDoctor}
      onRequireLogin={onRequireLogin}
      onClearError={clearLocalError}
    />
  );
};

export default PrescriptionConsent;
