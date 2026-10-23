// import { RiAppleLine } from 'react-icons/ri';
import { Col } from 'reactstrap';

const TopbarLeft = () => {
  return (
    <Col md={3} lg={9} className="d-block">
      <a href="#" role="button" className="top-left-header d-inline-block btn btn-sm bg-black">
        {/* <RiAppleLine className="text-white" /> */}
        <span className="text-white">Get the App</span>
      </a>
    </Col>
  );
};

export default TopbarLeft;
