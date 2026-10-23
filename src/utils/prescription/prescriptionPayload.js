import { uploadFileToS3 } from '@/utils/helpers';
import {
  isImagePrescriptionFile,
  isPdfPrescriptionFile,
} from '@/utils/prescription/prescriptionValidation';

const PRESCRIPTION_UPLOAD_FOLDER = 'SDL/orders/prescriptions';

const resolvePrescriptionFileType = (file) => {
  if (isImagePrescriptionFile(file)) {
    return 'image';
  }

  if (isPdfPrescriptionFile(file)) {
    return 'pdf';
  }

  return 'file';
};

const normalizePrescriptionFiles = (files = []) => {
  return (Array.isArray(files) ? files : []).filter(
    (file) => file && typeof file === 'object' && typeof file?.name === 'string'
  );
};

export const buildOrderPrescriptionPayload = async (files = []) => {
  const safeFiles = normalizePrescriptionFiles(files);

  if (!safeFiles.length) {
    return [];
  }

  return Promise.all(
    safeFiles.map(async (file) => {
      const imageKey = await uploadFileToS3(file, PRESCRIPTION_UPLOAD_FOLDER);

      return {
        imageKey,
        fileType: resolvePrescriptionFileType(file),
        fileName: file?.name || 'prescription-file',
        fileSize: Number(file?.size || 0),
      };
    })
  );
};
