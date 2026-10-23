import React from 'react';

const HeaderAppPromo = () => {
  return (
    <div className="header-app-promo">
      <div className="container-fluid-lg">
        <div className="header-app-promo__inner">
          <div className="header-app-promo__left">
            <div className="header-app-promo__badge">
              <span className="header-app-promo__badge-text">SDL</span>
            </div>
            <div className="header-app-promo__text">
              <p className="header-app-promo__title">
                For better experience and exclusive
              </p>
            </div>
          </div>
          <div className="header-app-promo__right">
            <span className="btn btn-solid-white btn-sm header-app-promo__cta">
              Get App
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderAppPromo;

