'use client';

import { useState } from 'react';
import OtpLoginModal from '@/components/auth/login/OtpLoginModal';
import { useUser } from '@/utils/hooks/useUser';
import { NavItem } from 'reactstrap';
import { RiUserStarLine } from 'react-icons/ri';
import { FaChevronRight } from 'react-icons/fa';

const UpgradeProfile = () => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { userData } = useUser();

  return (
    <>
      {!userData?.isDoctor && (
        <NavItem
          className="update-vaidya-container"
          onClick={() => setShowUpgradeModal(true)}
        >
          <div className="align-items-center d-flex gap-2 nav-left">
            <div className="icon-wrapper">
              <RiUserStarLine />
            </div>

            <div className="label">Upgrade to Vaidya</div>
          </div>

          <div className="chevron">
            <FaChevronRight />
          </div>
        </NavItem>
      )}

      <OtpLoginModal
        isOpen={showUpgradeModal}
        setOpen={setShowUpgradeModal}
        isUpgradeMode={true}
      />
    </>
  );
};

export default UpgradeProfile;
