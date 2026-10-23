import React, { useEffect, useState } from 'react';
import { Col } from 'reactstrap';
import Avatar from '@/components/common/Avatar';
import Dhootapapeshwar from '../../../../public/assets/images/logo/sdl_logo.gif';

const FooterLogoContent = () => {
  const [logoAbc, setLogo] = useState('');

  useEffect(() => {
    let logo = { original_url: Dhootapapeshwar };
    setLogo(logo);
  }, []);

  return (
    <Col xl={3} md={12} sm={12}>
      <div className="footer-logo">
        <div className="theme-logo">
          <a href="/">
            {logoAbc ? (
              <Avatar
                data={logoAbc?.original_url}
                name={'Footer'}
                height={90}
                width={160}
                unoptimized
              />
            ) : null}
          </a>
        </div>

        <div className="footer-logo-contain">
          <p className="text-content-color" style={{ color: '#6f6f6f' }}>
            Shree Dhootapapeshwar Limited built on Saiddhantik Ayurved and with over 150 years of manufacturing excellence in  crafting Authentic, Standardised, Efficacious and Safe Ayurvedic formulations, with over 350 classical medicines guided by expertise and trusted by Ayurved physicians.
          </p>
          {/* <ul className="address">
              {themeOption?.footer?.about_address && (
                <li>
                  <RiHomeLine />
                  <Link href="https://www.google.com/maps" target="_blank">
                    {themeOption?.footer?.about_address}
                  </Link>
                </li>
              )}
              {themeOption?.footer?.about_email && (
                <li>
                  <RiMailLine />
                  <Link
                    href={`mailto:${themeOption?.footer?.about_email}`}
                    target="_blank"
                  >
                    {themeOption?.footer?.about_email}
                  </Link>
                </li>
              )}
            </ul> */}
        </div>
      </div>
    </Col>
  );
};

export default FooterLogoContent;
