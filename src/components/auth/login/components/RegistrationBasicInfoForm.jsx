import React from 'react';
import { Controller } from 'react-hook-form';
import {
  Col,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Row,
} from 'reactstrap';
import { RiAddLine, RiCloseLine } from 'react-icons/ri';

const RegistrationBasicInfoForm = ({
  regControl,
  regErrors,
  profilePhotoPreview,
  handleProfileUploadClick,
  profilePhotoInputRef,
  handleFilePreview,
  onRemovePhoto,
  firstNameInputRef,
}) => {
  return (
    <>
      <FormGroup className="otp-form-group mb-3">
        <div className="d-flex flex-column align-items-center">
          <Controller
            name="profilePhoto"
            control={regControl}
            render={({ field: { onChange, value, ref, ...field } }) => (
              <div className="profile-photo-upload">
                <input
                  {...field}
                  type="file"
                  accept="image/*"
                  ref={(node) => {
                    if (typeof ref === 'function') {
                      ref(node);
                    } else if (ref) {
                      ref.current = node;
                    }
                    profilePhotoInputRef.current = node;
                  }}
                  onChange={(e) => {
                    const files = e.target.files;
                    onChange(files);
                    handleFilePreview(files, 'profile');
                  }}
                  className="profile-photo-input"
                  id="profilePhotoInput"
                />

                <div className="profile-photo-ring-wrapper">
                  <div
                    className="profile-photo-label"
                    role="button"
                    aria-label="Upload profile photo"
                    onClick={handleProfileUploadClick}
                  >
                    {profilePhotoPreview ? (
                      <div className="profile-photo-preview">
                        <img
                          src={profilePhotoPreview}
                          alt="Profile preview"
                          className="profile-photo-img"
                        />
                      </div>
                    ) : (
                      <div className="profile-photo-placeholder">
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 48 48"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M24 24C27.866 24 31 20.866 31 17C31 13.134 27.866 10 24 10C20.134 10 17 13.134 17 17C17 20.866 20.134 24 24 24Z"
                            fill="#9CA3AF"
                          />
                          <path
                            d="M12 38C12 32.477 16.477 28 22 28H26C31.523 28 36 32.477 36 38V40C36 41.1046 35.1046 42 34 42H14C12.8954 42 12 41.1046 12 40V38Z"
                            fill="#9CA3AF"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="profile-photo-add-icon">
                      <RiAddLine size={20} />
                    </div>
                  </div>

                  {profilePhotoPreview && (
                    <div
                      className="profile-photo-remove-icon"
                      role="button"
                      aria-label="Remove profile photo"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemovePhoto?.();
                      }}
                    >
                      <RiCloseLine size={20} />
                    </div>
                  )}
                </div>
              </div>
            )}
          />
          <span className="profile-photo-text mt-2">Profile Photo</span>
        </div>
      </FormGroup>

      <Row>
        <Col className="col-6">
          <FormGroup className="otp-form-group">
            <Label for="firstName" className="form-label mb-1">
              First Name <span className="text-danger">*</span>
            </Label>
            <Controller
              name="firstName"
              control={regControl}
              render={({ field: { ref, ...field } }) => (
                <Input
                  {...field}
                  type="text"
                  id="firstName"
                  className='text-capitalize input-common'
                  placeholder="Enter first name"
                  maxLength={25}
                  invalid={!!regErrors.firstName}
                  innerRef={(node) => {
                    ref(node);
                    if (firstNameInputRef) {
                      firstNameInputRef.current = node;
                    }
                  }}
                  onChange={(e) =>
                    field.onChange(e.target.value.replace(/[^a-zA-Z\s]/g, ''))
                  }
                />
              )}
            />
            {regErrors.firstName && (
              <FormFeedback className='message-error'>{regErrors.firstName.message}</FormFeedback>
            )}
          </FormGroup>
        </Col>

        <Col className="col-6">
          <FormGroup className="otp-form-group">
            <Label for="lastName" className="form-label mb-1">
              Last Name <span className="text-danger">*</span>
            </Label>
            <Controller
              name="lastName"
              control={regControl}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  id="lastName"
                  className='text-capitalize input-common'
                  placeholder="Enter last name"
                  maxLength={25}
                  invalid={!!regErrors.lastName}
                  onChange={(e) =>
                    field.onChange(e.target.value.replace(/[^a-zA-Z\s]/g, ''))
                  }
                />
              )}
            />
            {regErrors.lastName && (
              <FormFeedback className='message-error'>{regErrors.lastName.message}</FormFeedback>
            )}
          </FormGroup>
        </Col>

        <Col md={12}>
          <FormGroup className="otp-form-group">
            <Label for="email" className="form-label mb-1">
              Email (Optional)
            </Label>
            <Controller
              name="email"
              control={regControl}
              render={({ field }) => (
                <Input
                  {...field}
                  type="email"
                  id="email"
                  className='input-common'
                  placeholder="Enter email address"
                  invalid={!!regErrors.email}
                />
              )}
            />
            {regErrors.email && (
              <FormFeedback className='message-error'>{regErrors.email.message}</FormFeedback>
            )}
          </FormGroup>
        </Col>

        <Col md={12}>
          <FormGroup className="otp-form-group">
            <Label className="form-label mb-2">
              Role <span className="text-danger">*</span>
            </Label>
            <Controller
              name="role"
              control={regControl}
              render={({ field }) => (
                <div className="role-radio-group">
                  <Label check className="role-radio-label">
                    <Input
                      type="radio"
                      name={field.name}
                      value="Customer"
                      checked={field.value === 'Customer' && !!field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      invalid={!!regErrors.role}
                    />
                    <span className="role-radio-text">Customer</span>
                  </Label>
                  <Label check className="role-radio-label">
                    <Input
                      type="radio"
                      name={field.name}
                      value="Doctor"
                      checked={field.value === 'Doctor'}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      invalid={!!regErrors.role}
                    />
                    <span className="role-radio-text">Vaidya</span>
                  </Label>
                </div>
              )}
            />
            {regErrors.role && (
              <FormFeedback className="d-block">
                {regErrors.role.message}
              </FormFeedback>
            )}
          </FormGroup>
        </Col>
      </Row>
    </>
  );
};

export default RegistrationBasicInfoForm;
