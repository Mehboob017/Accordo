import React from 'react';

const SubFooter = () => {
  return (
    <div translate="no" className="sub-footer s-footer-2 ">
      {/* <div className="payment">
        <Image src={paymentImage} alt="payment" height={35} width={302} />
      </div> */}
      {/* <FooterSocial /> */}
      {/* {themeOption?.footer?.footer_copyright && ( */}
      {/* <div className="reserve"> */}
      <h6 className="text-content-color rights-reserved">
        &copy; {new Date().getFullYear()} Shree Dhootapapeshwar Limited
      </h6>
      {/* </div> */}
      {/* )} */}

      {/* {themeOption?.footer?.footer_copyright && (
        <div className="reserve">
          <h6 className="text-content">
            {themeOption?.footer?.copyright_content} ddd
          </h6>
        </div>
      )} */}
      <h6 className="text-content-color my-md-1 term-policy">
        <a href="/disclaimer" target="_blank" rel="noreferrer">
          Disclaimer
        </a>{' '}
        |{' '}
        <a href="/privacy-policy" target="_blank" rel="noreferrer">
          Privacy Policy
        </a>{' '}
        |{' '}
        <a href="/return-policy" target="_blank" rel="noreferrer">
          Return & Refund Policy
        </a>{' '}
        |{' '}
        <a href="/grievance-policy" target="_blank" rel="noreferrer">
          Grievance Policy
        </a>
        |{' '}
        <a href="/terms-and-conditions" target="_blank" rel="noreferrer">
          Terms & Conditions
        </a>
      </h6>

      {/* <FooterSocial /> */}
      {/* <h6 className="text-content-color made-with">
        Made with ❤ by{' '}
        <a href="https://www.hyplap.com" target="_blank" rel="noreferrer">
          Hyplap
        </a>
      </h6> */}
    </div>
  );
};

export default SubFooter;
