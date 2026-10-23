import React from 'react';
import { Col } from 'reactstrap';
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

const TopbarSlider = ({ customClass }) => {
  const { topBar } = useHeaderMenu();
  return (
    <>
      {customClass ? (
        <div className="notification-slider">
          <Slider {...topBarContentSlider}>
            {topBar.map((message, i) => (
              <div key={i}>
                <div className={`timer-notification ${customClass}`}>
                  <div className="mb-0">
                    <span className="me-1">{message.title}</span>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      ) : (
        <Col xs={7} sm={9} xxl={9}>
          <div className="header-offer" style={{ lineHeight: 1.2 }}>
            <div className="notification-slider no-arrow">
              <Slider {...topBarContentSlider}>
                {topBar.map((message, i) => (
                  <div key={i}>
                    <div className="timer-notification">
                      <div className="mb-0">
                        <span className="me-1">{message.title}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        </Col>
      )}
    </>
  );
};

export default TopbarSlider;
