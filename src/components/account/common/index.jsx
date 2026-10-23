"use client";

import Avatar from '@/components/common/Avatar';
import { capitalizeWords } from '@/utils/customFunctions/Capitalize';
import { useUser } from '@/utils/hooks/useUser';

const SidebarProfile = () => {
  const { userData, isUserLoading, isAuthenticated } = useUser();

  return (
    <>
      <div className="profile-box">
        <div className="profile-contain">
          {isAuthenticated && userData?.profileImage ? (
            <div className="profile-image">
              <div className="position-relative">
                <div className="user-round">
                  <Avatar
                    name={`${userData?.firstName} ${userData?.lastName}`}
                    customImageClass={'update_img'}
                    alt="profile-image"
                    height={104}
                    width={104}
                    data={userData?.profileImage}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="profile-image">
              <div className="user-round">
                <h4>{`${capitalizeWords(userData?.firstName ?? '').charAt(0)}${capitalizeWords(userData?.lastName ?? '').charAt(0)}`}</h4>
              </div>
            </div>
          )}

          <div className="profile-name">
            <h3>
              {capitalizeWords(userData?.firstName)} {capitalizeWords(userData?.lastName)}
            </h3>
            <h6 className="text-content">+91 {userData?.phone}</h6>
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarProfile;
