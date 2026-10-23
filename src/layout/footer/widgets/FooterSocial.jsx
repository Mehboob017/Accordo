import React, { useContext } from 'react';
import ThemeOptionContext from '@/helper/themeOptionsContext';
import {
  RiFacebookFill,
  RiInstagramLine,
  RiPinterestLine,
  RiTwitterFill,
  RiYoutubeFill,
} from 'react-icons/ri';

const FooterSocial = () => {
  const { themeOption } = useContext(ThemeOptionContext);

  return (
    <>
      <div className="social-link">
        <div className="text-content fw-semibold">Stay Connected :</div>
        <ul>
          {/* {themeOption?.footer?.facebook && ( */}
          <li>
            <a
              href={"https://www.facebook.com/Dhootapapeshwar/"}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <RiFacebookFill />
            </a>
          </li>
          {/* )} */}
          {/* {themeOption?.footer?.twitter && ( */}
          <li>
            <a
              href={"https://x.com/SDLINDIA"}
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
            >
              <RiTwitterFill />
            </a>
          </li>
          {/* )} */}
          {/* {themeOption?.footer?.instagram && ( */}
          <li>
            <a
              href={"https://www.instagram.com/sdlindia/?hl=en"}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <RiInstagramLine />
            </a>
          </li>
          {/* )} */}
          {/* {themeOption?.footer?.pinterest && ( */}
          <li>
            <a
              href={"https://www.youtube.com/c/shreedhootapapeshwarlimited"}
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
            >
              <RiYoutubeFill />
            </a>
          </li>
          {/* )} */}
        </ul>
      </div>
    </>
  );
};

export default FooterSocial;
