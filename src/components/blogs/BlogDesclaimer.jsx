import React from 'react';
import styles from '../career/CareerDisclaimer.module.scss';

const BlogDesclaimer = () => {
  return (
    <section className={`${styles.section} section-b-space`}>
      {/* <div className="container-fluid-lg"> */}
      <div className="row justify-content-center">
        {/* <div className="col-xl-9 col-lg-10"> */}
        <div className="col-12">
          <div className={styles.box}>
            <h3 className={styles.title}>Blog Disclaimer</h3>
            <p className={styles.text}>
              The information shared in these blogs is for educational and informational purposes only and is based on Ayurvedic principles and the professional experience of the author. It is not intended to replace professional medical advice, diagnosis, or treatment. Please consult a qualified healthcare professional before making any health-related decisions. The author and website are not responsible for any outcomes resulting from the use of this information.
            </p>

            <p className={styles.text}>
              If you receive any unauthorised, suspicious or fraudulent offers or interview call or in case of any queries, please email us at <a href="mailto:healthcare@sdlindia.com">healthcare@sdlindia.com</a>
            </p> <br />

            <h3 className={styles.title}>Translation Disclaimer</h3>
            <p className={styles.text}>
              The original version of this article is published in English. Translations into other languages are provided solely as an additional bilingual support to enhance accessibility and convenience for readers.
            </p>
            <p className={styles.text}>
              While reasonable efforts have been made to provide accurate translations, these are generated using automated translation tools and may contain inaccuracies, omissions, or differences in interpretation. In the event of any discrepancy or inconsistency, the English version shall prevail and be considered the official and authoritative version.
            </p>
            <p className={styles.text}>
              The Company does not warrant or guarantee the accuracy, completeness, or reliability of the translated content and shall not be held responsible or liable for any errors, omissions, or consequences arising from reliance on the translated information.
            </p>
          </div>
        </div>
      </div>
      {/* </div> */}
    </section>
  );
};

export default BlogDesclaimer;

