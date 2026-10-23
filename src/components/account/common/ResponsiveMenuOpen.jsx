import Btn from '@/elements/buttons/Btn';
import AccountContext from '@/helper/accountContext';
import { useContext } from 'react';

const ResponsiveMenuOpen = () => {
  const { mobileSideBar, setMobileSideBar } = useContext(AccountContext);

  return (
    <Btn
      className="btn left-dashboard-show btn-animation btn-md fw-bold d-block mb-4 d-lg-none"
      onClick={() => setMobileSideBar(!mobileSideBar)}
    >
      Show Menu
    </Btn>
  );
};

export default ResponsiveMenuOpen;
