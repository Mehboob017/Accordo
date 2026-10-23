import { useContext } from 'react';
import Slider from 'react-slick';
import Image from 'next/image';
import WrapperComponent from '../common/WrapperComponent';
import { clientSectionData } from '../../data/AboutUs';
import { clientSectionSlider } from '../../data/SliderSettings';
import { useTranslation } from '@/utils/translations';
const ClientSection = () => {
  const { t } = useTranslation('common');
  return (
    <WrapperComponent
      classes={{ sectionClass: 'client-section section-lg-space' }}
      colProps={{ xs: 12 }}
    >
      <div className="about-us-title text-center">
        <h4>{t('WhatWeDo')}</h4>
        <h2 className="center">{t('ClientsTrusted')}</h2>
      </div>
      <div className="product-wrapper">
        <Slider {...clientSectionSlider}>
          {clientSectionData.map((data, index) => (
            <div className="clint-contain" key={index}>
              <div className="client-icon">
                <Image
                  height={79.06}
                  width={58.5}
                  src={data.imageIcon}
                  alt="client-icon"
                  unoptimized
                />
              </div>
              <h2>{data.count}</h2>
              <h4>{t(data.title)}</h4>
              <p>{t(data.description)}</p>
            </div>
          ))}
        </Slider>
      </div>
    </WrapperComponent>
  );
};

export default ClientSection;
