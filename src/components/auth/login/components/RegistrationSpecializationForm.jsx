import React from 'react';
import { Controller } from 'react-hook-form';
import { FormGroup, Label } from 'reactstrap';
import { RiArrowLeftLine } from 'react-icons/ri';

const RegistrationSpecializationForm = ({
  regControl,
  specializations,
  isLoadingSpecializations,
  onBack,
  getRegistrationProgress,
}) => {
  const specializationItems = Array.isArray(specializations?.data)
    ? specializations.data
    : [];

  return (
    <div className="specialization-step-layout">
      <div className="specialization-sticky-top">
        <button
          type="button"
          className="btn p-0 text-decoration-none d-flex align-items-center mb-3"
          onClick={onBack}
        >
          <RiArrowLeftLine className="me-1" /> Back
        </button>

        {/* Progress Bar */}
        <div className="registration-progress-container">
          <div className="registration-progress-bar">
            <div
              className="registration-progress-fill shimmer-effect"
              style={{ width: `${getRegistrationProgress()}%` }}
            ></div>
            <span className="registration-progress-text">
              {getRegistrationProgress()}%
            </span>
          </div>
        </div>
      </div>

      <div className="specialization-scroll-region hide-scrollbar">
        <FormGroup className="otp-form-group mb-0">
          <Label className="form-label mb-1">
            Select upto 3 Specializations
          </Label>
          <Controller
            name="specialization"
            control={regControl}
            render={({ field }) => {
              const selected = field.value || [];
              const maxReached = selected.length >= 3;

              const toggleSpecialization = (id) => {
                if (selected.includes(id)) {
                  field.onChange(selected.filter((item) => item !== id));
                } else if (!maxReached) {
                  field.onChange([...selected, id]);
                }
              };

              return (
                <div className="specialization-grid-shell">
                  {isLoadingSpecializations ? (
                    <div className="text-center py-4 specialization-grid-status">
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Loading specializations...
                    </div>
                  ) : specializationItems.length === 0 ? (
                    <div className="text-center py-4 text-muted specialization-grid-status">
                      No specializations available
                    </div>
                  ) : (
                    <div className="specialization-grid">
                      {specializationItems.map((spec) => {
                        const isActive = selected.includes(spec.uid);
                        const isDisabled = !isActive && maxReached;

                        return (
                          <button
                            key={spec.uid}
                            type="button"
                            className={`specialization-card${isActive ? ' specialization-card--active' : ''
                              }${isDisabled ? ' specialization-card--disabled' : ''}`}
                            style={
                              spec.image
                                // ? { backgroundImage: `url(${spec.image})` }
                                ? {
                                  // backgroundImage: `url(${spec.image})`,
                                  backgroundImage: `url("${spec.image}")`,
                                  backgroundSize: 'contain',
                                  backgroundRepeat: 'no-repeat',
                                  backgroundPosition: 'center',
                                  // border: '1px solid #e2e2e2',
                                }
                                : undefined
                            }
                            onClick={() => toggleSpecialization(spec.uid)}
                            disabled={isDisabled}
                          >
                            {/* <span className="specialization-card__label" title={spec.name}>
                              {spec.name}
                            </span> */}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }}
          />
        </FormGroup>
      </div>
    </div>
  );
};

export default RegistrationSpecializationForm;
