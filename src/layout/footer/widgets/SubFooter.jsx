import React from 'react';
import Image from 'next/image';
import paymentImage from '../../../../public/assets/images/payment/2.png';

const SubFooter = () => {
  return (
    <div translate="no" className="sub-footer s-footer-2">
      <h6 className="text-content-color rights-reserved">
        &copy; {new Date().getFullYear()} Shree Dhootapapeshwar Limited
      </h6>

      <div className="payment">
        <div className="text-content fw-semibold">Supported :</div>
        <Image src={paymentImage} alt="payment" height={35} width={302} />
      </div>
    </div>
  );
};

export default SubFooter;
