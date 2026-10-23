import React from 'react';
import { RiCameraLine, RiImageLine } from 'react-icons/ri';
import ResponsiveModal from '@/components/common/ResponsiveModal';
import Btn from '@/elements/buttons/Btn';

const PROFILE_PICKER_ACTION_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

const PROFILE_PICKER_BUTTON_STYLE = {
  fontWeight: 700,
  fontSize: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  border: '1px solid var(theme-color)',
};

const ProfilePickerModal = ({
  isOpen,
  onClose,
  onTakePhoto,
  onChooseFromGallery,
  isMobileView,
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
        title: 'Upload Your Profile Picture',
      }}
    >
      <div className="profile-picker-wrapper">
        <div style={PROFILE_PICKER_ACTION_STYLE}>
          <Btn
            type="button"
            size="sm"
            color="primary"
            className="w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
            style={PROFILE_PICKER_BUTTON_STYLE}
            onClick={onTakePhoto}
          >
            Take Photo
            <RiCameraLine size={18} />
          </Btn>

          <Btn
            type="button"
            size="sm"
            color="secondary"
            className="w-100 fw-bold d-flex align-items-center justify-content-center gap-2 profile-picker-secondary-btn"
            style={{
              ...PROFILE_PICKER_BUTTON_STYLE,
              backgroundColor: 'transparent',
              color: '#0da487',
              border: '1px solid #0da487',
            }}
            onClick={onChooseFromGallery}
          >
            Choose from gallery
            <RiImageLine size={18} />
          </Btn>
        </div>
      </div>
    </ResponsiveModal>
  );
};

export default ProfilePickerModal;
