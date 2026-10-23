import { useContext } from 'react';
import { Col, Container, Input, Row } from 'reactstrap';
import Btn from '@/elements/buttons/Btn';
import WrapperComponent from '../common/WrapperComponent';
import { useTranslation } from '@/utils/translations';
import { RiArrowRightLine, RiMailLine } from 'react-icons/ri';

const NewsLetter = ({ dataAPI }) => {
  const { t } = useTranslation('common');
  return (
    <WrapperComponent
      classes={{ sectionClass: 'newsletter-section section-b-space' }}
      noRowCol={true}
    >
      <div
        className="newsletter-box newsletter-box-2"
        style={{ backgroundImage: `url(${dataAPI?.image_url})` }}
      >
        <div className="newsletter-contain py-5">
          <Container fluid={true}>
            <Row>
              <Col
                lg={5}
                md={7}
                sm={9}
                xxl={4}
                className="offset-xxl-2 offset-md-1"
              >
                <div className="newsletter-detail">
                  <h2>{dataAPI?.title}</h2>
                  <h5>{dataAPI?.sub_title}</h5>
                  <div className="input-box">
                    <Input type="email" placeholder="Enter Your Email" />
                    <div className="mail-icon">
                      <RiMailLine />
                    </div>
                    <Btn className="sub-btn btn-animation">
                      <span className="d-sm-block d-none">
                        {t('Subscribe')}
                      </span>
                      <RiArrowRightLine />
                    </Btn>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </WrapperComponent>
  );
};

export default NewsLetter;
