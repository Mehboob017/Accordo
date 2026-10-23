export const PRESCRIPTION_MAX_FILES = 5;
export const PRESCRIPTION_MIN_FILES = 1;
export const PRESCRIPTION_MAX_FILE_SIZE_MB = 4;
export const PRESCRIPTION_MAX_FILE_SIZE_BYTES =
  PRESCRIPTION_MAX_FILE_SIZE_MB * 1024 * 1024;

export const PRESCRIPTION_ERROR_MESSAGES = {
  MAX_FILES: `You can upload up to ${PRESCRIPTION_MAX_FILES} files only`,
  FILE_SIZE: `File size should not exceed ${PRESCRIPTION_MAX_FILE_SIZE_MB}MB`,
  UNSUPPORTED_FORMAT: 'Unsupported file format',
  REQUIRED: 'Prescription is required to proceed',
  LOGIN_REQUIRED: 'Please login to upload prescription',
};

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'pdf']);

const resolveBooleanFlag = (...values) => {
  for (const value of values) {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      if (value === 1) {
        return true;
      }

      if (value === 0) {
        return false;
      }
    }

    if (typeof value === 'string') {
      const normalizedValue = value.trim().toLowerCase();

      if (normalizedValue === 'true' || normalizedValue === '1') {
        return true;
      }

      if (normalizedValue === 'false' || normalizedValue === '0') {
        return false;
      }
    }
  }

  return false;
};

const getFileExtension = (fileName = '') => {
  const normalizedName = String(fileName || '').toLowerCase();
  const parts = normalizedName.split('.');

  if (parts.length < 2) {
    return '';
  }

  return parts.pop() || '';
};

const isSupportedByMime = (file) =>
  Boolean(file?.type && ALLOWED_MIME_TYPES.has(file.type.toLowerCase()));

const isSupportedByExtension = (file) =>
  ALLOWED_EXTENSIONS.has(getFileExtension(file?.name));

export const isSupportedPrescriptionFile = (file) =>
  Boolean(file) && (isSupportedByMime(file) || isSupportedByExtension(file));

export const isImagePrescriptionFile = (file) =>
  Boolean(file) &&
  (String(file?.type || '').startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'webp'].includes(getFileExtension(file?.name)));

export const isPdfPrescriptionFile = (file) =>
  Boolean(file) &&
  (String(file?.type || '').toLowerCase() === 'application/pdf' ||
    getFileExtension(file?.name) === 'pdf');

const resolvePrescriptionFlag = (item) => {
  const product = item?.product || {};
  const variation = item?.variation || item?.variant || {};

  return resolveBooleanFlag(
    item?.prescriptionRequired,
    item?.prescription_required,
    item?.isPrescriptionRequired,
    product?.prescriptionRequired,
    product?.prescription_required,
    product?.isPrescriptionRequired,
    product?.requiresPrescription,
    variation?.prescriptionRequired,
    variation?.prescription_required,
    variation?.isPrescriptionRequired
  );
};

export const isPrescriptionRequiredForItem = (item) =>
  resolvePrescriptionFlag(item);

export const getPrescriptionRequiredItems = (cartItems = []) =>
  (Array.isArray(cartItems) ? cartItems : []).filter(
    isPrescriptionRequiredForItem
  );

export const getPrescriptionRequiredItemCount = (cartItems = []) => {
  return getPrescriptionRequiredItems(cartItems).length;
}

export const validateIncomingPrescriptionFiles = ({
  currentFiles = [],
  incomingFiles = [],
}) => {
  const safeCurrentFiles = Array.isArray(currentFiles) ? currentFiles : [];
  const safeIncomingFiles = Array.isArray(incomingFiles) ? incomingFiles : [];

  if (!safeIncomingFiles.length) {
    return { acceptedFiles: [], errors: [] };
  }

  const acceptedFiles = [];
  const errors = [];
  let nextCount = safeCurrentFiles.length;

  if (nextCount >= PRESCRIPTION_MAX_FILES) {
    return {
      acceptedFiles: [],
      errors: [PRESCRIPTION_ERROR_MESSAGES.MAX_FILES],
    };
  }

  for (const file of safeIncomingFiles) {
    if (!isSupportedPrescriptionFile(file)) {
      errors.push(PRESCRIPTION_ERROR_MESSAGES.UNSUPPORTED_FORMAT);
      continue;
    }

    if (Number(file?.size || 0) > PRESCRIPTION_MAX_FILE_SIZE_BYTES) {
      errors.push(PRESCRIPTION_ERROR_MESSAGES.FILE_SIZE);
      continue;
    }

    if (nextCount >= PRESCRIPTION_MAX_FILES) {
      errors.push(PRESCRIPTION_ERROR_MESSAGES.MAX_FILES);
      continue;
    }

    acceptedFiles.push(file);
    nextCount += 1;
  }

  return {
    acceptedFiles,
    errors: [...new Set(errors)],
  };
};

export const buildPrescriptionValidationState = ({
  cartItems = [],
  isDoctor = false,
  uploadedFiles = [],
  localError = '',
}) => {
  const requiredItemCount = getPrescriptionRequiredItemCount(cartItems);
  const isPrescriptionRequired = requiredItemCount > 0 && !Boolean(isDoctor);
  const uploadedCount = Array.isArray(uploadedFiles) ? uploadedFiles.length : 0;
  const isValid = !isPrescriptionRequired || uploadedCount >= PRESCRIPTION_MIN_FILES;
  const requirementError = isValid ? '' : PRESCRIPTION_ERROR_MESSAGES.REQUIRED;

  return {
    isDoctor: Boolean(isDoctor),
    requiredItemCount,
    isPrescriptionRequired,
    uploadedCount,
    isValid,
    requirementError,
    localError: localError || '',
  };
};
