import { useContext } from 'react';
import Slider from 'react-slick';
import Image from 'next/image';
import { Col, Row } from 'reactstrap';
import {
  RiFacebookFill,
  RiInstagramLine,
  RiPinterestFill,
  RiTwitterFill,
} from 'react-icons/ri';
import WrapperComponent from '../common/WrapperComponent';
import { teamMembersData } from '../../data/AboutUs';
import { creativeTeamSlider } from '../../data/SliderSettings';
import { useTranslation } from '@/utils/translations';
import CustomHeading from '../common/CustomHeading';
import { LeafSVG } from '../common/CommonSVG';
const CreativeTeam = () => {
  const { t } = useTranslation('common');
  return (
    <WrapperComponent
      classes={{ sectionClass: 'team-section section-lg-space' }}
      colProps={{ xs: 12 }}
      noRowCol
    >
      {/* <div className="about-us-title text-center">
        <h4 className="text-content">{t('OurCreativeTeam')}</h4>
        <h2 className="center">{t('FastkartTeamMember')}</h2>
      </div> */}
      <CustomHeading
        customClass="mb-0"
        title="About Company Directors"
        subTitle="Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nihil, adipisci."
        svgUrl={<LeafSVG className="icon-width" />}
      />
      <Row>
        <Col xs="12">
          <Slider
            className="slider-user product-wrapper "
            {...creativeTeamSlider}
          >
            {teamMembersData.map((data, index) => (
              <div className="team-box" key={index}>
                <div className="team-iamge">
                  <Image
                    height={183.5}
                    width={183.5}
                    src={data.profile_image}
                    className="img-fluid"
                    alt={data.name}
                    unoptimized
                  />
                </div>
                <div className="team-name">
                  <h3>{data.name}</h3>
                  <h5>{t(data.designation)}</h5>
                  <p>{t(data.description)}</p>
                  {/* <ul className="team-media">
                    <li>
                      <a
                        href="https://www.facebook.com/"
                        className="fb-bg"
                        target="_blank"
                      >
                        <RiFacebookFill />
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://in.pinterest.com/"
                        className="pint-bg"
                        target="_blank"
                      >
                        <RiPinterestFill />
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://twitter.com/"
                        className="twitter-bg"
                        target="_blank"
                      >
                        <RiTwitterFill />
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.instagram.com/"
                        className="insta-bg"
                        target="_blank"
                      >
                        <RiInstagramLine />
                      </a>
                    </li>
                  </ul> */}
                </div>
              </div>
            ))}
          </Slider>
        </Col>
      </Row>
    </WrapperComponent>
  );
};

export default CreativeTeam;
