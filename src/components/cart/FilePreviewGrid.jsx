'use client';

import { useEffect, useMemo } from 'react';
import { RiCloseFill, RiFilePdf2Line, RiImage2Line, RiImageAddLine } from 'react-icons/ri';
import {
  isImagePrescriptionFile,
  PRESCRIPTION_MAX_FILES,
} from '@/utils/prescription/prescriptionValidation';
import styles from './FilePreviewGrid.module.scss';

const FilePreviewGrid = ({
  files = [],
  onRemove,
  onAddMore,
}) => {
  const imagePreviewMap = useMemo(() => {
    const previewEntries = [];

    files.forEach((file, index) => {
      if (!isImagePrescriptionFile(file)) {
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      previewEntries.push({
        index,
        previewUrl,
      });
    });

    return previewEntries;
  }, [files]);

  useEffect(() => {
    return () => {
      imagePreviewMap.forEach((entry) => {
        URL.revokeObjectURL(entry.previewUrl);
      });
    };
  }, [imagePreviewMap]);

  const getPreviewByIndex = (index) =>
    imagePreviewMap.find((entry) => entry.index === index)?.previewUrl || '';

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        {files.map((file, index) => {
          const isImage = isImagePrescriptionFile(file);
          const previewSrc = isImage ? getPreviewByIndex(index) : '';

          return (
            <div className={styles.card} key={`${file?.name || 'file'}-${index}`}>
              <button
                type="button"
                className={styles.removeProof}
                onClick={() => onRemove && onRemove(index)}
                aria-label="Remove file"
              >
                <RiCloseFill />
              </button>

              <div className={styles.previewWrap}>
                {isImage && previewSrc ? (
                  <img
                    src={previewSrc}
                    alt={file?.name || 'Prescription file'}
                    className={styles.previewImage}
                    draggable={false}
                  />
                ) : (
                  <span className={styles.previewIcon}>
                    <RiFilePdf2Line />
                  </span>
                )}
              </div>

              {/* <div className={styles.metaWrap}>
                <span className={styles.fileName}>{file?.name || 'Prescription file'}</span>
                <span className={styles.fileMeta}>
                  {isImage ? (
                    <>
                      <RiImage2Line /> Image
                    </>
                  ) : (
                    <>
                      <RiFilePdf2Line /> PDF
                    </>
                  )}
                </span>
              </div> */}
            </div>
          );
        })}

        {files.length < PRESCRIPTION_MAX_FILES && (
          <button
            type="button"
            className={styles.addCard}
            onClick={onAddMore}
            aria-label="Add image"
          >
            <RiImageAddLine />
            <span>Add</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default FilePreviewGrid;
