import { useLogout } from '@/utils/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { RiLogoutBoxLine } from 'react-icons/ri';
import { Nav, NavItem, NavLink } from 'reactstrap';
import ConfirmationModal from './ConfirmationModal';
import { useUser } from '@/utils/hooks/useUser';
import Btn from '@/elements/buttons/Btn';
import UpgradeProfile from '../upgrade-profile/UpgradeProfile';

const NavTabTitles = ({
  classes = {},
  activeTab,
  setActiveTab,
  titleList,
  callBackFun,
}) => {
  const router = useRouter();
  const [modal, setModal] = useState(false);
  const { userData, isUserLoading } = useUser();
  const { mutate: logoutMutate, isPending: isLoggingOut } = useLogout();

  const checkType = (value, index) => {
    // console.log(value, activeTab)
    
    if (typeof activeTab == 'object') {
      return activeTab.id == value.id;
    } else {
      return activeTab == String(index + 1);
    }
  };

  const handleLogout = () => {
    logoutMutate(
      { phone: userData?.phone },
      {
        onSuccess: () => {
          setModal(false);
          // router.push(`/`);
        },
      }
    );
  };

  const onNavClick = (elem, i) => {
    setActiveTab((prev) => (typeof prev === 'object' ? elem : String(i + 1)));
    callBackFun?.();
    if (!elem?.path) return;
    router.push(elem.path);
    window.location.assign(elem.path);
  };

  return (
    <>
      <Nav className={classes?.navClass} data-lenis-prevent>
        {titleList.map((elem, i) => (
          <NavItem key={i}>
            <NavLink
              className={checkType(elem, i) ? 'active' : ''}
              onClick={() => onNavClick(elem, i)}
            >
              {elem.icon && elem.icon}
              {elem?.title || elem?.name}
              {elem?.badge ? elem?.badge : null}
            </NavLink>
          </NavItem>
        ))}

        {/* Register as Vaidya */}
        <UpgradeProfile />

        {userData?.uid && !isUserLoading && (
          <NavItem className="logout-cls">
            <Btn
              color="primary"
              className="w-100"
              onClick={() => setModal(true)}
            >
              <RiLogoutBoxLine className="me-2 stroke-w-1" />
              Log Out
            </Btn>
          </NavItem>
        )}
      </Nav>
      <ConfirmationModal
        modal={modal}
        setModal={setModal}
        confirmFunction={handleLogout}
        isLoading={isLoggingOut}
      />
    </>
  );
};

export default NavTabTitles;
