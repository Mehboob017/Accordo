import React from 'react';
import { RiShieldCheckLine } from 'react-icons/ri';
import Btn from '@/elements/buttons/Btn';

const KycPendingView = ({ onClose }) => {
  return (
    <div className="otp-login-top-section">
      <div className="otp-step">
        <div className="otp-welcome-card text-center d-flex flex-column align-items-center gap-3">
          <div
            className="d-flex align-items-center justify-content-center kyc-status-icon rounded-circle bg-light"
            style={{ width: 80, height: 80 }}
          >
            <RiShieldCheckLine size={40} className="text-success" />
          </div>
          <div>
            <h5 className="mb-1">Your KYC is under process</h5>
            <p className="text-muted mb-0">
              We'll notify you once verification is complete.
            </p>
          </div>
          <Btn
            type="button"
            size="md"
            color="primary"
            className="btn-md fw-bold px-4"
            onClick={onClose}
          >
            Thank you
          </Btn>
        </div>
      </div>
    </div>
  );
};

export default KycPendingView;
