'use client';

import { useMemo } from 'react';
import {
  RiFileShieldLine,
  RiInformationLine,
  RiUpload2Line,
} from 'react-icons/ri';
import styles from './PrescriptionModule.module.scss';

const UploadBox = ({
  requiredItemCount = 0,
  requiredItemsList = [],
  uploadedCount = 0,
  isUploading = false,
  canAddMore = true,
  onUploadClick,
  onDropFiles,
}) => {
  const isUploaded = uploadedCount > 0;

  const requiredText = useMemo(() => {
    const safeRequiredItems = (Array.isArray(requiredItemsList)
      ? requiredItemsList
      : []
    )
      .map((name) => String(name || '').trim())
      .filter(Boolean);

    if (safeRequiredItems.length > 0) {
      return `Prescription required for: ${safeRequiredItems.join(', ')}`;
    }

    if (requiredItemCount <= 0) {
      return '';
    }

    return `Prescription required for ${requiredItemCount} item${requiredItemCount === 1 ? '' : 's'
      }`;
  }, [requiredItemCount, requiredItemsList]);

  const handleDrop = (event) => {
    event.preventDefault();

    if (!canAddMore || typeof onDropFiles !== 'function') {
      return;
    }

    const files = Array.from(event.dataTransfer?.files || []);

    if (files.length > 0) {
      onDropFiles(files);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div
      className={`${styles.card} ${isUploaded ? styles.successCard : styles.warningCard}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className={styles.headerRow}>
        <div className={styles.iconWrap}>
          <RiFileShieldLine />
        </div>
        <div className={styles.contentWrap}>
          <div className={styles.titleRow}>
            <h6 className={styles.title}>Prescription Required</h6>
            <div className={styles.infoWrap}>
              <button
                type="button"
                className={styles.infoButton}
                aria-label="Why prescription is required"
              >
                <RiInformationLine />
              </button>
              <div className={styles.infoTooltip}>
                Certain product needs a valid prescription.
              </div>
            </div>
          </div>
          <p className={styles.subtitle}>
            In your cart requires a valid prescription.
          </p>
          {requiredText && <p className={styles.countText}>{requiredText}</p>}
        </div>
      </div>

      {isUploading ? (
        <div className={styles.uploadingBox}>
          <div className={styles.shimmerLine} />
          <div className={styles.shimmerLineSmall} />
        </div>
      ) : (
        <div className={styles.actionRow}>
          <button
            type="button"
            className="btn btn-sm"
            onClick={onUploadClick}
            disabled={!canAddMore}
          >
            <RiUpload2Line /> Upload Prescription
          </button>

          {/* <button type="button" className={styles.guidelineButton}>
            View Guidelines
          </button> */}
        </div>
      )}
    </div>
  );
};

export default UploadBox;
