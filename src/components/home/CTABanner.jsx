'use client';

import { getImageProps } from 'next/image';
import WrapperComponent from '@/components/common/WrapperComponent';
import { Col, Container, Row } from 'reactstrap';

const CTABanner = () => {
  const commonProps = {
    alt: 'App Download Banner',
    loading: 'lazy', // Lazy load because it's below the fold!
    // quality: 80,
  };

  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({
    ...commonProps,
    src: '/assets/images/cake/banner/promte-banner.png',
    width: 1440,
    height: 500,
  });

  const {
    props: { srcSet: mobileSrcSet, ...rest },
  } = getImageProps({
    ...commonProps,
    src: '/assets/images/cake/banner/promte-banner-mobile.png',
    width: 600,
    height: 300,
  });

  return (
    <Container fluid>
      <WrapperComponent classes={{ fluidClass: 'px-0' }} noRowCol={true}>
        <Row>
          <Col className="px-0">
            <a
              href="https://play.google.com/store/apps/details?id=com.sdlindia.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-banner"
            >
              <picture>
                <source media="(min-width: 768px)" srcSet={desktopSrcSet} />
                <source media="(max-width: 767px)" srcSet={mobileSrcSet} />
                <img
                  {...rest}
                  className="banner-img"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </picture>
            </a>
          </Col>
        </Row>
      </WrapperComponent>
    </Container>
  );
};

export default CTABanner;

// import Image from 'next/image';
// import WrapperComponent from '@/components/common/WrapperComponent';
// import { Col, Container, Row } from 'reactstrap';

// const CTABanner = () => {
//   return (
//     <Container fluid>
//       <WrapperComponent classes={{ fluidClass: 'px-0' }} noRowCol={true}>
//         <Row>
//           <Col className="px-0">
//             <a
//               href="https://play.google.com/store/apps/details?id=com.sdlindia.app"
//               target="_blank"
//             >
//               {/* Desktop */}
//               <div className="hero-banner">
//                 <div className="desktop-banner">
//                   <Image
//                     src="/assets/images/cake/banner/promte-banner.png"
//                     alt="App Download Banner"
//                     width={1440}
//                     height={500}
//                     priority
//                     className="banner-img"
//                   />
//                 </div>

//                 {/* Mobile */}
//                 <div className="mobile-banner">
//                   <Image
//                     src="/assets/images/cake/banner/promte-banner-mobile.png"
//                     alt="App Download Banner"
//                     width={600}
//                     height={300}
//                     priority
//                     className="banner-img"
//                   />
//                 </div>
//               </div>
//             </a>
//           </Col>
//         </Row>
//       </WrapperComponent>
//     </Container>
//   );
// };

// export default CTABanner;
