'use client';

import { useMemo, useState } from 'react';
// import { toast } from 'react-toastify';
import './OrderDetails.scss';
import {
  RiFileCopyLine,
  RiInformationLine,
  RiFilePdf2Line,
  RiImage2Line,
} from 'react-icons/ri';
import PrescriptionPreviewViewer from './PrescriptionPreviewViewer';
import { ToastNotification } from '@/utils/customFunctions/ToastNotification';

const OrderDetails = ({
  order,
  onHelpClick,
  prescriptions = [],
  isPrescriptionLoading = false,
}) => {
  const {
    orderId,
    receiverName,
    receiverPhone,
    deliveryAddress,
    placedAt,
    arrivedAt,
  } = order;
  const [activePreviewIndex, setActivePreviewIndex] = useState(-1);

  const normalizedPrescriptions = useMemo(
    () =>
      (Array.isArray(prescriptions) ? prescriptions : [])
        .map((file, index) => {
          const normalizedType = String(
            file?.type || file?.fileType || ''
          ).toLowerCase();
          const isImage =
            normalizedType.startsWith('image') || normalizedType === 'image';
          const isPdf =
            normalizedType.includes('pdf') || normalizedType === 'pdf';

          return {
            id:
              file?.id ||
              file?.uid ||
              file?.imageKey ||
              `prescription-${index}`,
            name: file?.name || file?.fileName || 'Prescription file',
            type: file?.type || file?.fileType || '',
            previewUrl:
              file?.previewUrl || file?.fileUrl || file?.url || file?.src || '',
            isImage,
            isPdf,
          };
        })
        .filter((file) => Boolean(file?.previewUrl)),
    [prescriptions]
  );

  const imagePrescriptionFiles = useMemo(
    () => normalizedPrescriptions.filter((file) => file?.isImage),
    [normalizedPrescriptions]
  );

  const documentPrescriptionFiles = useMemo(
    () => normalizedPrescriptions.filter((file) => !file?.isImage),
    [normalizedPrescriptions]
  );

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    ToastNotification('success', 'Order ID copied to clipboard!');
  };

  const openPrescription = (file) => {
    const isImage = Boolean(file?.isImage);

    if (isImage) {
      const imageIndex = imagePrescriptionFiles.findIndex(
        (imageFile) => imageFile?.id === file?.id
      );

      if (imageIndex >= 0) {
        setActivePreviewIndex(imageIndex);
      }

      return;
    }

    if (file?.previewUrl && typeof window !== 'undefined') {
      window.open(file.previewUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="order-details-section order-summary-section">
      <h4 className="section-title">Order Details</h4>

      <div className="details-grid">
        {/* Order ID */}
        <div className="detail-item">
          <span className="label">Order ID</span>
          <div className="value-row">
            <span className="value">#{orderId}</span>
            <button
              className="copy-btn"
              onClick={handleCopyOrderId}
              title="Copy Order ID"
            >
              <RiFileCopyLine />
            </button>
          </div>
        </div>

        {/* Receiver Details */}
        {(receiverName || receiverPhone) && (
          <div className="detail-item">
            <span className="label">Receiver Details</span>
            <span className="value text-capitalize">
              {receiverName}
              {receiverPhone && ` | ${receiverPhone}`}
            </span>
          </div>
        )}

        {/* Delivery Address */}
        {deliveryAddress && (
          <div className="detail-item">
            <span className="label">Delivery Address</span>
            <span className="value">{deliveryAddress}</span>
          </div>
        )}

        {/* Order Placed At */}
        {placedAt && (
          <div className="detail-item">
            <span className="label">Order Placed at</span>
            <span className="value">{placedAt}</span>
          </div>
        )}

        {/* Order Arrived At */}
        {arrivedAt && (
          <div className="detail-item">
            <span className="label">Order Arrived at</span>
            <span className="value">{arrivedAt}</span>
          </div>
        )}

        <div className="detail-item prescription-detail">
          <div className="prescription-header">
            <span className="label">Uploaded Prescription</span>
            {normalizedPrescriptions.length > 0 && (
              <span className="prescription-count">
                {normalizedPrescriptions.length}
              </span>
            )}
          </div>

          {isPrescriptionLoading ? (
            <span className="value">Loading prescription files...</span>
          ) : normalizedPrescriptions.length > 0 ? (
            <>
              {imagePrescriptionFiles.length > 0 && (
                <div className="prescription-gallery">
                  {imagePrescriptionFiles.map((file, index) => (
                    <button
                      type="button"
                      className="prescription-thumb"
                      key={`${file?.id || file?.name || 'prescription-image'}-${index}`}
                      onClick={() => openPrescription(file)}
                      title={file?.name || 'Prescription image'}
                    >
                      <img
                        src={file?.previewUrl}
                        alt={file?.name || 'Prescription image'}
                        draggable={false}
                      />
                      <span className="prescription-thumb-overlay">
                        <RiImage2Line />
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {documentPrescriptionFiles.length > 0 && (
                <div className="prescription-file-list">
                  {documentPrescriptionFiles.map((file, index) => (
                    <button
                      type="button"
                      className="prescription-file-item"
                      key={`${file?.id || file?.name || 'prescription-file'}-${index}`}
                      onClick={() => openPrescription(file)}
                      disabled={!file?.previewUrl}
                    >
                      <span className="prescription-file-icon">
                        <RiFilePdf2Line />
                      </span>
                      <span className="prescription-file-name">
                        {file?.name || 'Prescription file'}
                      </span>
                      <span className="prescription-file-action">Open</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <span className="value">
              No prescription uploaded for this order.
            </span>
          )}

          {/* {prescriptions.length > 0 && (
            <p className="prescription-note">
              Tip: Image previews support pinch zoom on mobile and wheel zoom on desktop.
            </p>
          )} */}
        </div>

        {/* facing issue */}
        <div className="help">
          <span>Facing issues with your order?</span>
          {/* <RiInformationLine className="info-icon" /> */}
          <button
            type="button"
            onClick={onHelpClick}
            className="btn-primary ms-auto px-2 rounded-1"
          >
            Support
          </button>
        </div>
      </div>

      {/* Help Section */}
      {/* {onHelpClick && (
        <div className="help-section" onClick={onHelpClick}>
          <div className="help-icon">
            <RiChat1Line />
          </div>
          <div className="help-content">
            <p className="help-title">Need help with this order?</p>
            <span className="help-subtitle">Find your issue or reach out via chat</span>
          </div>
        </div>
      )} */}

      <PrescriptionPreviewViewer
        isOpen={activePreviewIndex >= 0}
        files={imagePrescriptionFiles}
        initialIndex={activePreviewIndex}
        onClose={() => setActivePreviewIndex(-1)}
      />
    </div>
  );
};

export default OrderDetails;
