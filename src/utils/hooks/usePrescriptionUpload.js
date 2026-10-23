import { useCallback, useEffect, useMemo, useState } from 'react';
import { isDoctorUser } from '@/utils/cart/cartUtils';
import {
  buildPrescriptionValidationState,
  PRESCRIPTION_ERROR_MESSAGES,
  validateIncomingPrescriptionFiles,
} from '@/utils/prescription/prescriptionValidation';
import {
  PRESCRIPTION_DRAFT_SYNC_EVENT,
  loadDraftPrescriptionFiles,
  persistDraftPrescriptionFiles,
} from '@/utils/prescription/prescriptionStorage';

const SIMULATED_UPLOAD_DELAY = 450;

const waitForSimulatedUpload = () =>
  new Promise((resolve) => {
    setTimeout(resolve, SIMULATED_UPLOAD_DELAY);
  });

export const usePrescriptionUpload = ({
  cartItems = [],
  userData = null,
  onValidationChange,
  externalError,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [localError, setLocalError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);

  const isDoctor = useMemo(() => isDoctorUser(userData), [userData]);

  const validationState = useMemo(
    () =>
      buildPrescriptionValidationState({
        cartItems,
        isDoctor,
        uploadedFiles,
        localError,
      }),
    [cartItems, isDoctor, uploadedFiles, localError]
  );

  const mergedError =
    externalError ||
    localError ||
    (validationState.isPrescriptionRequired && !validationState.isValid
      ? validationState.requirementError
      : '');

  useEffect(() => {
    let isMounted = true;

    const hydratePrescriptionFiles = async () => {
      try {
        const storedDraftFiles = await loadDraftPrescriptionFiles();

        if (!isMounted) {
          return;
        }

        setUploadedFiles(Array.isArray(storedDraftFiles) ? storedDraftFiles : []);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setUploadedFiles([]);
      } finally {
        if (isMounted) {
          setIsHydrating(false);
        }
      }
    };

    hydratePrescriptionFiles();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let isMounted = true;

    const syncDraftPrescriptionFiles = async () => {
      try {
        const storedDraftFiles = await loadDraftPrescriptionFiles();

        if (!isMounted) {
          return;
        }

        setUploadedFiles(Array.isArray(storedDraftFiles) ? storedDraftFiles : []);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setUploadedFiles([]);
      }
    };

    window.addEventListener(
      PRESCRIPTION_DRAFT_SYNC_EVENT,
      syncDraftPrescriptionFiles
    );

    return () => {
      isMounted = false;
      window.removeEventListener(
        PRESCRIPTION_DRAFT_SYNC_EVENT,
        syncDraftPrescriptionFiles
      );
    };
  }, []);

  useEffect(() => {
    if (typeof onValidationChange !== 'function') {
      return;
    }

    onValidationChange({
      ...validationState,
      error: mergedError,
      isHydrating,
      uploadedFiles,
    });
  }, [
    onValidationChange,
    validationState,
    mergedError,
    isHydrating,
    uploadedFiles,
  ]);

  const persistNextFiles = useCallback(async (nextFiles) => {
    setUploadedFiles(nextFiles);

    try {
      await persistDraftPrescriptionFiles(nextFiles);
    } catch (error) {
      setLocalError('Unable to save prescription files locally. Please try again.');
    }
  }, []);

  const appendFiles = useCallback(
    async (incomingFiles = []) => {
      if (!incomingFiles.length) {
        return;
      }

      setIsUploading(true);
      await waitForSimulatedUpload();

      const { acceptedFiles, errors } = validateIncomingPrescriptionFiles({
        currentFiles: uploadedFiles,
        incomingFiles,
      });

      if (errors.length > 0) {
        setLocalError(errors[0]);
      } else {
        setLocalError('');
      }

      if (acceptedFiles.length > 0) {
        const nextFiles = [...uploadedFiles, ...acceptedFiles];
        await persistNextFiles(nextFiles);
      }

      setIsUploading(false);
    },
    [persistNextFiles, uploadedFiles]
  );

  const removeFileAtIndex = useCallback(
    async (index) => {
      const safeIndex = Number(index);

      if (!Number.isFinite(safeIndex) || safeIndex < 0) {
        return;
      }

      const nextFiles = uploadedFiles.filter((_, fileIndex) => fileIndex !== safeIndex);
      setLocalError('');
      await persistNextFiles(nextFiles);
    },
    [persistNextFiles, uploadedFiles]
  );

  const replaceFileAtIndex = useCallback(
    async (index, replacementFile) => {
      const safeIndex = Number(index);

      if (!Number.isFinite(safeIndex) || safeIndex < 0 || !replacementFile) {
        return;
      }

      setIsUploading(true);
      await waitForSimulatedUpload();

      const currentFilesWithoutTarget = uploadedFiles.filter(
        (_, fileIndex) => fileIndex !== safeIndex
      );

      const { acceptedFiles, errors } = validateIncomingPrescriptionFiles({
        currentFiles: currentFilesWithoutTarget,
        incomingFiles: [replacementFile],
      });

      if (errors.length > 0) {
        setLocalError(errors[0]);
        setIsUploading(false);
        return;
      }

      if (!acceptedFiles.length) {
        setLocalError(PRESCRIPTION_ERROR_MESSAGES.UNSUPPORTED_FORMAT);
        setIsUploading(false);
        return;
      }

      const nextFiles = [...uploadedFiles];
      nextFiles[safeIndex] = acceptedFiles[0];

      setLocalError('');
      await persistNextFiles(nextFiles);
      setIsUploading(false);
    },
    [persistNextFiles, uploadedFiles]
  );

  return {
    uploadedFiles,
    isUploading,
    isHydrating,
    error: mergedError,
    localError,
    isDoctor,
    validationState,
    appendFiles,
    removeFileAtIndex,
    replaceFileAtIndex,
    clearLocalError: () => setLocalError(''),
  };
};
