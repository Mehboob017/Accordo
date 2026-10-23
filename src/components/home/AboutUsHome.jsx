// 'use client';

// import React from 'react';
// import Link from 'next/link';
// import CustomHeading from '../common/CustomHeading';
// import WrapperComponent from '../common/WrapperComponent';
// import { Row, Col } from 'reactstrap';
// import { LeafSVG } from '../common/CommonSVG';
// import Btn from '@/elements/buttons/Btn';
// import styles from './AboutUsHome.module.scss';

// const DEFAULT_YOUTUBE_VIDEO_ID = '0dzvJQjJYMY';

// const AboutUsHome = ({ youtubeVideoId = DEFAULT_YOUTUBE_VIDEO_ID }) => {
//   return (
//     <WrapperComponent
//       classes={{
//         sectionClass: `${styles['about-us-section']} section-b-space`,
//       }}
//       noRowCol={true}
//     >
//       <Row>
//         <Col>
//           <CustomHeading
//             customClass="mb-0"
//             title="About Us"
//             subTitle="Know more about us"
//             svgUrl={<LeafSVG className="icon-width" />}
//           />
//         </Col>
//       </Row>

//       <Row className={`g-4 flex-column-reverse flex-lg-row ${styles['about-us-row']}`}>
//         <Col lg={6} xs={12} className="d-flex">
//           <div className={styles['about-us-content']}>
//             <div>
//               <p>
//                 This is what the Puranik family calls Saiddhantik Ayurved, the
//                 practice of Ayurved exactly as its principles demand, with no
//                 approximation in measure, discipline, or balance. Not a tagline,
//                 but the discipline that has guided every medicine SDL has made
//                 for over 150 years.
//               </p>

//               <p>
//                 The company today is led by Shri Ranjit Anand Puranik, the
//                 seventh member of the Puranik family to carry the enterprise
//                 forward. Run entirely by professionals and domain experts, SDL
//                 has more Ayurvedic physicians on its board than any comparable
//                 company in the field. Every medicine it makes is shaped by that
//                 authority.
//               </p>

//               <p>
//                 "We see Ayurved as a medical system being accepted the world
//                 over. We foresee becoming one of the first classical Ayurved
//                 multinationals."
//                 <br />
//                 <strong>— Shri Ranjit Anand Puranik, Managing Director</strong>
//               </p>
//             </div>

//             {/* <Link href="/about-us">
//               <Btn color="primary" size="md">
//                 View More
//               </Btn>
//             </Link> */}
//           </div>
//         </Col>

//         <Col lg={6} xs={12} className="d-flex">
//           <div className={styles['about-us-video-wrapper']}>
//             <div className={styles['about-us-video']}>
//               <iframe
//                 src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0`}
//                 title="About Shree Dhootapapeshwar Limited"
//                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                 allowFullScreen
//                 loading="lazy"
//               />
//             </div>
//           </div>
//         </Col>
//       </Row>
//     </WrapperComponent>
//   );
// };

// export default AboutUsHome;

'use client';

import React from 'react';
import Link from 'next/link';
import CustomHeading from '../common/CustomHeading';
import WrapperComponent from '../common/WrapperComponent';
import { Row, Col } from 'reactstrap';
import { LeafSVG } from '../common/CommonSVG';
import Btn from '@/elements/buttons/Btn';
import styles from './AboutUsHome.module.scss';

// const DEFAULT_YOUTUBE_VIDEO_ID = '0dzvJQjJYMY';

const AboutUsHome = () => {
  return (
    <WrapperComponent
      classes={{
        sectionClass: `${styles['about-us-section']} section-b-space`,
      }}
      noRowCol={true}
    >
      <Row>
        <Col>
          <CustomHeading
            customClass="mb-0"
            title="About Us"
            subTitle="Know more about us"
            svgUrl={<LeafSVG className="icon-width" />}
          />
        </Col>
      </Row>

      <Row className={`g-4 flex-column-reverse flex-lg-row ${styles['about-us-row']}`}>
        <Col lg={6} xs={12} className="d-flex">
          <div className={styles['about-us-content']}>
            <div>
              <p>
              Shree Dhootapapeshwar Limited was established in 1872 by Vaidyaraj Krishnashastri Puranik, a physician whose singular aim was the proper manufacture of Ayurvedic medicines. Over 150 years later, the company remains in the hands of the same family, guided by the same purpose. The name has grown, science has advanced, but the founding principle, serving Ayurved, has not been revised
              </p>
              <p>
                This is what the Puranik family calls Saiddhantik Ayurved, the
                practice of Ayurved exactly as its principles demand, with no
                approximation in measure, discipline, or balance. Not a tagline,
                but the discipline that has guided every medicine SDL has made
                for over 150 years. The company today is led by Shri Ranjit Anand Puranik, the
                seventh member of the Puranik family to carry the enterprise
                forward. Run entirely by professionals and domain experts, SDL
                has more Ayurvedic physicians on its board than any comparable
                company in the field. Every medicine it makes is shaped by that
                authority.
              </p>

              {/* <p>
                <span className={styles['about-us-content-quote']}>"We see Ayurved as a medical system being accepted the world
                over. We foresee becoming one of the first classical Ayurved
                multinationals."</span>
                <br />
                <strong>— Shri Ranjit Anand Puranik, Managing Director</strong>
              </p> */}
            </div>

            {/*
            <Link href="/about-us">
              <Btn color="primary" size="md">
                View More
              </Btn>
            </Link>
            */}
          </div>
        </Col>

        <Col lg={6} xs={12} className="d-flex">
          <div className={styles['about-us-video-wrapper']}>
            <div className={styles['about-us-video']}>
              {/* YouTube Video */}
              {/*
              <iframe
                src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0`}
                title="About Shree Dhootapapeshwar Limited"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
              */}

              {/* Local Downloaded Video */}
              <video
                controls
                playsInline
                preload="metadata"
                poster="/assets/video_default.png"
              >
                <source src="/assets/english_low_res.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </Col>
      </Row>
    </WrapperComponent>
  );
};

export default AboutUsHome;