'use client'; // Ensure this is present if using useState

import { useState } from 'react'; // 1. Import useState
import ProfileInformation from './ProfileInformation';
import { Col, Row } from 'reactstrap';
import { useUser } from '@/utils/hooks/useUser';
import { RiCustomerService2Line, RiInformationLine } from 'react-icons/ri';
import OtpLoginModal from '@/components/auth/login/OtpLoginModal'; // 2. Import OtpLoginModal

const DashboardContent = () => {
  const { userData, isUserLoading, isAuthenticated } = useUser();

  // 3. Add local state to control Reapply Modal
  const [showReapplyModal, setShowReapplyModal] = useState(false);
  const formatAmount = (value) => Number(value ?? 0).toFixed(2);

  // Extract dynamic values from userData
  const currentKycStatus = userData?.kycStatus?.toLowerCase() || '';

  // Helper to normalize the KYC status string
  const showKycStatus = ['pending', 'approved', 'rejected'].includes(
    currentKycStatus
  );

  // Get the rejection note from the first rejected document in the array
  const rejectedDoc = userData?.doctorDetails?.doctorKycDocuments?.find(
    (doc) => doc.status?.toLowerCase() === 'rejected'
  );

  const rejectionReason =
    rejectedDoc?.correctionNote || 'Discrepancy found in submitted documents.';

  return (
    <div className="dashboard-home">
      <Row className="g-4 dashboard-wireframe-layout">
        <Col lg={12}>
          <div className="dashboard-top-card profile-wireframe-card">
            <div className="greeting-left">
              <h3 className="greeting-user text-capitalize">
                Hello, {userData?.firstName} 👋
              </h3>
              <span className="greeting-subtext">
                Manage your profile and preferences
              </span>

              <div className="d-flex align-items-center gap-3 mt-1">
                {userData?.isDoctor && (
                  <div className="d-flex align-items-start gap-2 flex-column w-100">
                    {/* Badge Section */}
                    <div className="d-flex flex-column gap-2">
                      <div
                        className={`role-badge inner-kyc-badge ${currentKycStatus}`}
                      >
                        <span className="role-text">Vaidya</span>
                        {showKycStatus && (
                          <span className="ms-2">(KYC {currentKycStatus})</span>
                        )}
                      </div>

                      {/* Rejection Reason Inline */}
                      {showKycStatus && currentKycStatus === 'rejected' && (
                        <div className="rejection-note-inline">
                          <div className="note-text">
                            <span className="note-label">Reason:</span>{' '}
                            {rejectionReason}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Reapply Wizard Action Link - Forced Single Line */}
                    {showKycStatus && currentKycStatus === 'rejected' && (
                      <div className="kyc-support-text">
                        <span className="text-secondary">Please </span>
                        <button
                          type="button"
                          onClick={() => setShowReapplyModal(true)}
                          className="support-mail-link btn-link-styled"
                        >
                          reapply here
                        </button>
                        <span className="text-secondary">
                          {' '}
                          to upload corrected documents.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* {(Number(userData?.walletBalance) > 0 ||
              Number(userData?.orderCount) > 0) && ( */}
            {Number(userData?.walletBalance) > 0 && (
              <div className="stats-right">
                {Number(userData?.walletBalance) > 0 && (
                  <div className="stat-box green-chip">
                    <span className="stat-label">SDL Points</span>
                    <h4 className="stat-value">{userData?.walletBalance}</h4>
                  </div>
                )}

                {/* {Number(userData?.orderCount) > 0 && (
                  <div className="stat-box">
                    <span className="stat-label">Orders</span>
                    <h4 className="stat-value">{userData?.orderCount}</h4>
                  </div>
                )} */}
              </div>
            )}
          </div>
        </Col>

        <Col lg={12}>
          <ProfileInformation />
        </Col>
      </Row>

      {/* 5. Render OtpLoginModal with isReapplyMode */}
      <OtpLoginModal
        isOpen={showReapplyModal}
        setOpen={setShowReapplyModal}
        isReapplyMode={true}
      />
    </div>
  );
};

export default DashboardContent;
