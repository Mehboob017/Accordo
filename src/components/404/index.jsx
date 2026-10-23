'use client';

import { Col } from 'reactstrap';
import Image from 'next/image';
import WrapperComponent from '../common/WrapperComponent';
import NotFoundImage from '../../../public/assets/images/inner-page/404.png';
import Btn from '@/elements/buttons/Btn';
import { useRouter } from 'next/navigation';
const NotFoundComponent = () => {
  const router = useRouter();

  return (
    <>
      <WrapperComponent
        classes={{ sectionClass: 'section-404 section-lg-space' }}
        customCol
      >
        <Col xs="12">
          <div className="image-404">
            <Image
              src={NotFoundImage}
              className="img-fluid"
              alt="error page"
              height={483.52}
              width={392.61}
            />
          </div>
        </Col>
        <Col xs={12}>
          <div className="contain-404">
            <h2 className='mb-3'>Page Not Found</h2>
            <h3 className="text-content">
              The page you are looking for does not exist or may have moved.
            </h3>
            <Btn
              id="back_button"
              className="btn-md text-white theme-bg-color mt-4 mx-auto"
              title="Go Back"
              onClick={() => router.back()}
            />
          </div>
        </Col>
      </WrapperComponent>
    </>
  );
};

export default NotFoundComponent;
