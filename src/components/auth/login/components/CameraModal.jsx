import React from 'react';
import ResponsiveModal from '@/components/common/ResponsiveModal';
import Btn from '@/elements/buttons/Btn';

const CameraModal = ({
  isOpen,
  onClose,
  cameraError,
  videoRef,
  onCapture,
}) => {
  return (
    <ResponsiveModal
      modal={isOpen}
      setModal={onClose}
      extraFunction={onClose}
      classes={{
        modalClass:
          'theme-modal view-modal address-modal modal-md otp-login-modal profile-picker-modal',
        offcanvasClass: 'address-modal otp-login-offcanvas',
        modalHeaderClass: 'justify-content-between',
        title: 'Use your camera',
      }}
    >
      <div className="profile-picker-wrapper">
        <div className="camera-preview-wrapper">
          {cameraError ? (
            <p className="text-danger small mb-2">{cameraError}</p>
          ) : (
            <video
              ref={videoRef}
              className="w-100 rounded"
              autoPlay
              playsInline
              muted
              style={{
                backgroundColor: '#f7f7f7',
                minHeight: 240,
                objectFit: 'cover',
              }}
            />
          )}
        </div>

        <div className="d-flex gap-2 mt-3">
          <Btn
            type="button"
            size="md"
            color="primary"
            className="w-100"
            onClick={onCapture}
            disabled={!!cameraError}
            style={{
              opacity: cameraError ? 0.7 : 1,
              cursor: cameraError ? 'not-allowed' : 'pointer',
            }}
          >
            Capture
          </Btn>
          <Btn
            type="button"
            size="md"
            className="w-100 profile-picker-secondary-btn"
            style={{
              backgroundColor: 'transparent',
              color: '#0da487',
              border: '1px solid #0da487',
            }}
            onClick={onClose}
          >
            Cancel
          </Btn>
        </div>
      </div>
    </ResponsiveModal>
  );
};

export default CameraModal;
