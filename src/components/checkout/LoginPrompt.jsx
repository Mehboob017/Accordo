'use client';

import React, { useContext, useState } from 'react';
import { RiUserLine, RiCheckLine } from 'react-icons/ri';
import CheckoutCard from './common/CheckoutCard';
import './LoginPrompt.scss';
import OtpLoginModal from '../auth/login/OtpLoginModal';
import UserContext from '@/helper/userContext';

const LoginPrompt = () => {
  const [otpModal, setOtpModal] = useState(false);
  const { userData, isAuthenticated } = useContext(UserContext);

  // const displayName = userData?.name || userData?.firstName || '';
  const displayName =
    `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || '';
  const displayPhone = userData?.phone || '';

  return (
    <>
      <CheckoutCard icon={<RiUserLine />}>
        <div className={`login-prompt ${isAuthenticated ? 'active' : ''}`}>
          {isAuthenticated && userData ? (
            <div className="login-prompt-logged-in">
              <div className="login-prompt-logged-in-heading">
                <span className="login-prompt-logged-in-text">LOGGED IN</span>
                <span className="login-prompt-logged-in-check">
                  <RiCheckLine size={18} />
                </span>
              </div>
              <p className="login-prompt-logged-in-details">
                {displayName}
                {displayPhone ? ` | ${displayPhone}` : ''}
              </p>
            </div>
          ) : (
            <div className="login-prompt-content">
              <div className="login-prompt-line">
                <h4 className="login-prompt-text">Already have an account?</h4>
                <button
                  type="button"
                  className="login-prompt-link"
                  onClick={() => setOtpModal(true)}
                >
                  LOGIN
                </button>
              </div>
              <div className="login-prompt-subtext">
                Earn SDL Points on your purchase.{' '}
                <button
                  type="button"
                  className="login-prompt-link-sub"
                  onClick={() => setOtpModal(true)}
                >
                  Login Now!
                </button>
              </div>
            </div>
          )}
        </div>
      </CheckoutCard>
      <OtpLoginModal isOpen={otpModal} setOpen={setOtpModal} />
    </>
  );
};

export default LoginPrompt;
