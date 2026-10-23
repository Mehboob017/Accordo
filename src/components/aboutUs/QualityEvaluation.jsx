'use client';

import React from 'react';
import styles from './QualityEvaluation.module.scss';
import CustomHeading from '../common/CustomHeading';
import { LeafSVG } from '../common/CommonSVG';

const QualityEvaluation = () => {
  return (
    <section className={`${styles.section} bg-light section-b-space`}>
      <div className="container-fluid-lg">
        <CustomHeading
          customClass="mb-4"
          title="Quality Evaluation"
          subTitle="Evaluating Every Detail for Consistent Excellence."
          svgUrl={<LeafSVG className="icon-width" />}
        />
        <div className="row justify-content-center">
          <div className="col-12">

            <div className={styles.evalSection}>
              <h3 className={styles.title}>Quality Evaluation of Metals &amp; Minerals</h3>
              <ul className={styles.list}>
                <li>Assay of elements by chemical methods and by AAS (Atomic Abosorption Spectrophotometer).</li>
                <li>The impurity profile of samples of raw material by AAS (Atomic Absorption Spectroscopy).</li>
              </ul>
            </div>

            <div className={styles.evalSection}>
              <h3 className={styles.title}>Quality Evaluation of Herbals</h3>
              <ul className={styles.list}>
                <li>Identification of the plant /part of the plant by Macroscopic &amp; Microscopic examination.</li>
                <li>Foreign matter</li>
                <li>Ash</li>
                <li>Water, Alcohol and Ethyl acetate soluble extractive extractive values.</li>
                <li>Heavy metals</li>
                <li>TLC (Thin layer Chromatography)</li>
              </ul>
            </div>

            <div className={styles.evalSection}>
              <h3 className={styles.title}>Quality Evaluation of Intermediates</h3>
              <p className={styles.description}>
                It includes evaluation of Shodhita i.e purified raw materials, Kadhas i.e decoction for Bhavana (specialized process in preparation of Ayurvedic medicine) , Bulk for tableting etc. as per established in-house standards.
              </p>
            </div>

            <div className={styles.evalSection}>
              <h3 className={styles.title}>Quality Evaluation of Finished Products</h3>
              <p className={styles.description}>
                It includes evaluation of finished products like Arogyavardhani, Chandraprabha, Gold containing products etc. as per established in-house standards, which include:
              </p>
              <ol className={styles.orderedList}>
                <li>Elemental assay by AAS (Atomic Absorption Spectrophotometer) and Chemical methods</li>
                <li>Other common parameters like Ash, Acid insoluble Ash, Loss-on-Ignition</li>
                <li>
                  Ayurvedic parameters: ( for Bhasma )
                  <div className={styles.subList}>
                    <div>Nishchandratva</div>
                    <div>Rekhapurnatv</div>
                    <div>Varitaratva</div>
                  </div>
                </li>
                <li>TLC (Thin layer Chromatography)</li>
                <li>Safety evaluation of random batches of selected products by conducting acute toxicity studies.</li>
              </ol>
            </div>

            <div className="mt-4">
              <p className={styles.footerText}>
                At <span className="fw-bold">SDL</span>, we carry out quality evaluation as per specifications laid down in Ayurvedic Pharmacopoeia of India and established in-house standards i.e. <span className="fw-bold">SDS</span>.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default QualityEvaluation;
