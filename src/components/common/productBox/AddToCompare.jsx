import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import Btn from '@/elements/buttons/Btn';
import { RiRefreshLine } from 'react-icons/ri';

const AddToCompare = ({ productObj, customClass }) => {
  const cookieUAT = Cookies.get('uat');
  const router = useRouter();
  const addToCompare = () => {
    if (!cookieUAT) {
      router.push(`/`);
    } else {
      // add compare logic
      router.push(`/compare`);
    }
  };

  return (
    <>
      {customClass ? (
        <Btn className={customClass ?? ''} onClick={addToCompare}>
          <RiRefreshLine />
        </Btn>
      ) : (
        <li title="Compare" onClick={addToCompare}>
          <a>
            <RiRefreshLine />
          </a>
        </li>
      )}
    </>
  );
};

export default AddToCompare;
