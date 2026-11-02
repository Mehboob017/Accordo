import React, { useEffect, useState } from 'react';
import { Col } from 'reactstrap';
import Avatar from '@/components/common/Avatar';
import Dhootapapeshwar from '../../../../public/assets/images/logo/ac-logo.png';

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
          <p className="text-content-color" style={{ color: 'var(--text)', fontWeight: 'bold', marginBottom: '8px', fontSize: '16px' }}>
            Building and industrial supplies. Smarter deals. Local delivery.
          </p>
          <p className="text-content-color" style={{ color: '#535E75', lineHeight: '1.6' }}>
            Get fast access to high quality electrical supplies — wires, cables, switches, motors and more. With AI assisted negotiation on eligible orders get a smarter deal.
          </p>
        </div>
      </div>
    </Col>
  );
};

export default FooterLogoContent;
