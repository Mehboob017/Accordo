import { Col } from 'reactstrap';

const FooterUseFul = ({ footerMenu, setFooterMenu }) => {

  return (
    <Col xl={2} md={4} sm={4}>
      <div
        className={`footer-title ${footerMenu == 'usefull' ? 'show' : ''}`}
        onClick={() =>
          setFooterMenu((prev) => (prev !== 'usefull' ? 'usefull' : ''))
        }
      >
        <h4>Useful Links</h4>
      </div>
      <div className="footer-contain">
        <ul>
          <li style={{ marginBottom: '10px' }}>
            <a href={`/careers`} className="text-content-color">
              Careers
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a href={`/find-the-clinic`} className="text-content-color">
              Find The Clinic
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a href={`/find-the-store`} className="text-content-color">
              Find The Store
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a
              href={`/resources/journal-publication`}
              className="text-content-color"
            >
              Journal Publications
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a href={`/herbs`} className="text-content-color">
              Herbs
            </a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a href={`/cultivators`} className="text-content-color">
              Cultivators
            </a>
          </li>
          {/* <li style={{ marginBottom: '10px' }}>
            <a href={`/careers`} className="text-content-color">
              Career
            </a>
          </li> */}
          <li style={{ marginBottom: '10px' }}>
            <a href={`/faqs`} className="text-content-color">
              FAQs
            </a>
          </li>
        </ul>
      </div>
    </Col>
  );
};

export default FooterUseFul;
