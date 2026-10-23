'use client';

import { useMemo, useRef, useState } from 'react';
import UploadBox from './UploadBox';
import FilePreviewGrid from './FilePreviewGrid';
import styles from './PrescriptionModule.module.scss';
import {
  getPrescriptionRequiredItemCount,
  getPrescriptionRequiredItems,
  PRESCRIPTION_MAX_FILES,
} from '@/utils/prescription/prescriptionValidation';

const PrescriptionModule = ({
  cartItems = [],
  uploadedFiles = [],
  onUpload,
  onRemove,
  onReplace,
  error,
  isUploading = false,
  isDoctor = false,
  onClearError,
}) => {
  const uploadInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const [replaceIndex, setReplaceIndex] = useState(-1);

  const requiredItemCount = useMemo(
    () => getPrescriptionRequiredItemCount(cartItems),
    [cartItems]
  );

  const requiredItemsList = useMemo(() => {
    return getPrescriptionRequiredItems(cartItems)
      .map(
        (item) =>
          // item?.variation?.name ||
          item?.product?.name ||
          item?.name ||
          item?.product_name ||
          ''
      )
      .map((name) => String(name || '').trim())
      .filter(Boolean);
  }, [cartItems]);

  const isPrescriptionRequired = requiredItemCount > 0 && !Boolean(isDoctor);

  if (!isPrescriptionRequired) {
    return null;
  }

  const openPicker = () => {
    onClearError && onClearError();

    uploadInputRef.current?.click();
  };

  const handleUploadSelection = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length > 0 && typeof onUpload === 'function') {
      onUpload(selectedFiles);
    }

    event.target.value = '';
  };

  const handleReplaceSelection = (event) => {
    const selectedFile = event.target.files?.[0];

    if (
      replaceIndex >= 0 &&
      selectedFile &&
      typeof onReplace === 'function'
    ) {
      onReplace(replaceIndex, selectedFile);
    }

    setReplaceIndex(-1);
    event.target.value = '';
  };

  const handleReplaceRequest = (index) => {
    onClearError && onClearError();
    setReplaceIndex(index);
    replaceInputRef.current?.click();
  };

  return (
    <section className={styles.container}>
      <UploadBox
        requiredItemCount={requiredItemCount}
        requiredItemsList={requiredItemsList}
        uploadedCount={uploadedFiles.length}
        isUploading={isUploading}
        canAddMore={uploadedFiles.length < PRESCRIPTION_MAX_FILES}
        onUploadClick={openPicker}
        onDropFiles={onUpload}
      />

      {uploadedFiles.length > 0 && (
        <FilePreviewGrid
          files={uploadedFiles}
          onRemove={onRemove}
          onReplace={handleReplaceRequest}
          onAddMore={openPicker}
        />
      )}

      {error && <p className={styles.errorText}>{error}</p>}

      <input
        ref={uploadInputRef}
        className={styles.hiddenInput}
        type="file"
        accept="image/*,application/pdf"
        multiple
        onChange={handleUploadSelection}
      />

      <input
        ref={replaceInputRef}
        className={styles.hiddenInput}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleReplaceSelection}
      />
    </section>
  );
};

export default PrescriptionModule;
