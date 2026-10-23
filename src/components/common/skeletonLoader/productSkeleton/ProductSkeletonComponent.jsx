import { Col } from 'reactstrap';
import SKProductHorizontal from './SKProductHorizontal';

const ProductSkeletonComponent = ({ item }) => {
  const skeletonItems = Array.from({ length: item }, (_, index) => index);
  return (
    <>
      {skeletonItems?.map((elem, i) => (
        <Col xxl={3} xl={3} lg={3} md={6} xs={6} key={i}>
          <SKProductHorizontal />
        </Col>
      ))}
    </>
  );
};

export default ProductSkeletonComponent;
