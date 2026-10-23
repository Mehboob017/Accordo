import React from 'react';
import styles from './CareerDisclaimer.module.scss';

const CareerDisclaimer = () => {
  return (
    <section className={`${styles.section} section-b-space`}>
      <div className="container-fluid-lg">
        <div className="row justify-content-center">
          {/* <div className="col-xl-9 col-lg-10"> */}
          <div className="col-12">
            <div className={styles.box}>
              <h3 className={styles.title}>Career Disclaimer</h3>
              <p className={styles.text}>
              Team SDL follows a merit-based system for employee selection. The Company does not charge/accept any amount or security deposit of any kind or any sort of fees from prospective candidates for employment during the selection process or while inviting candidates for an interview. However, sometimes recruitment process is done through professional recruiting agencies. In such cases, offers are always made directly by the Company and not by any third parties.
              </p>
              <p className={styles.text}>
              The Company has noticed some instances of fraudulent individuals/agencies/job portals approaching prospective candidates for employment through email/ SMS/ links on WhatsApp, etc. These agencies offer job opportunities in the Company and demand money by way of a refundable security deposit or other fees or other type of gain. Offers are also being made on fake letterheads using the Company’s logo and fraudulent signatures of HR department personnel. The Company reserves the right to take legal action, including criminal action, against such individuals/entities.
              </p>
              <p className={styles.text}>
              If you receive an interview call letter stating that it is from the Company, it is recommended that you immediately check the authenticity of the same and refrain from submitting any original documents or making any form of payment either in cash or through bank remittances.
              <br />
              Anyone dealing with such fake interview calls would be doing so at his/her own risk and the Company will not be held responsible for any loss or damage suffered by such persons, directly or indirectly.
              </p>
              <p className={styles.text}>
              If you receive any unauthorised, suspicious or fraudulent offers or interview call or in case of any queries, please email us at <a href="mailto:career@teamsdl.in">career@teamsdl.in</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CareerDisclaimer;

