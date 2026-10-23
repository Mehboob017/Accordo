import React, { useContext } from 'react';
import { Col } from 'reactstrap';

const FooterQuickPage = ({ footerMenu, setFooterMenu }) => {
  return (
    <Col xl={2} md={4} sm={4}>
      <div
        className={`footer-title ${footerMenu == 'pages' ? 'show' : ''}`}
        onClick={() =>
          setFooterMenu((prev) => (prev !== 'pages' ? 'pages' : ''))
        }
      >
        <h4>Quick Pages</h4>
      </div>
      <div className="footer-contain">
        <ul>
          <li style={{ marginBottom: '10px' }}>
            <a href={`/account/my-profile`} className="text-content-color">
              My Profile
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a href={`/collections`} className="text-content-color">
              Products Range
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a href={`/press`} className="text-content-color">
              Press
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a href={`/events`} className="text-content-color">
              Events
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a href={`/blogs`} className="text-content-color">
              Blogs
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a href={`/contact-us`} className="text-content-color">
              Contact Us
            </a>
          </li>
          {/* <li style={{ marginBottom: '10px' }}>
            <a href={`/company-documents`} className="text-content-color">
              Company Documents
            </a>
          </li> */}
        </ul>
      </div>
    </Col>
  );
};

export default FooterQuickPage;
