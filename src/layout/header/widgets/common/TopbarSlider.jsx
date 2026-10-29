import React from 'react';
import Slider from 'react-slick';
import { useHeaderMenu } from '@/utils/hooks/useHeaderMenu';

const topBarContentSlider = {
  slidesToShow: 1,
  slidesToScroll: 1,
  dots: false,
  vertical: false,
  variableWidth: false,
  autoplay: true,
  autoplaySpeed: 3000,
  autoHeight: true,
};

const TopbarSlider = ({ customClass, customClassName }) => {
  const { topBar } = useHeaderMenu();
  const activeClass = customClass || customClassName;
  return (
    <div className="header-offer" style={{ lineHeight: 1.2 }}>
      <div className={`notification-slider ${activeClass ? activeClass : 'no-arrow'}`}>
        <Slider {...topBarContentSlider}>
          {topBar.map((message, i) => (
            <div key={i}>
              <div className={`timer-notification ${activeClass || ''}`}>
                <div className="mb-0">
                  <span className="me-1">{message.title}</span>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default TopbarSlider;
