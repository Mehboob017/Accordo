import { useContext } from 'react';
import Cookies from 'js-cookie';
import { RiHeartLine } from 'react-icons/ri';
import { useRouter } from 'next/navigation';
import Btn from '@/elements/buttons/Btn';

const AddToWishlist = ({ productObj, customClass }) => {
  const router = useRouter();
  const handelWishlist = (productObj) => {
    if (Cookies.get('uat')) {
      // Add your add to wishlist logic here
    } else {
      router.push(`/`);
    }
  };
  return (
    <>
      {customClass ? (
        <Btn
          className={customClass ? customClass : ''}
          onClick={() => handelWishlist(productObj)}
        >
          <RiHeartLine />
        </Btn>
      ) : (
        <li title="Wishlist" onClick={() => handelWishlist(productObj)}>
          <a className={'notifi-wishlist'}>
            <RiHeartLine />
          </a>
        </li>
      )}
    </>
  );
};

export default AddToWishlist;
