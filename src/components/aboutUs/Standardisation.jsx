'use client';

import React from 'react';
import styles from './Standardisation.module.scss';
import CustomHeading from '../common/CustomHeading';
import { LeafSVG } from '../common/CommonSVG';

const Standardisation = () => {
  return (
    <section className={`${styles.section} section-b-space`}>
      <div className="container-fluid-lg">
        <CustomHeading
          customClass="mb-4"
          title="Standardisation"
          subTitle="Ensuring Consistency Through Proven Standards and Processes."
          svgUrl={<LeafSVG className="icon-width" />}
        />
        <div className="row justify-content-center">
          <div className="col-12">

            <div className={styles.evalSection}>
              <h3 className={styles.title}>Herbal Raw Materials</h3>
              <p className={styles.description}>
                Standards for about 221 herbal raw materials have been set. Photo documented thin layer chromatography profile has been updated for 94 Herbal Raw Materials. Unique Monograph Number which corresponds to the product code has been generated for all the plant materials. The standard describes Official name, Botanical name and General name of herbal raw materials, macroscopic properties, physico-chemical characteristics viz. foreign matter, Ash, Acid Insoluble Ash, Extractive values &amp; photo documented ‘Thin layer chromatography’ profile.
              </p>
              <p className={styles.description}>
                Looking into the increased concern of Safety, we have included the limits of Contaminants viz. Pathogens, Heavy Metals, Pesticide Residues &amp; Aflatoxins in the monographs of herbal raw materials which complies WHO Guidelines.
              </p>
              <p className={styles.description}>
                The complex composition of herbo-mineral drugs has been a major challenge for quality control. Specifications of herbal raw materials have been fixed on contents of complete part of plant and drug which includes the active marker compounds and also other inert substances. While we have considered geographical and seasonal factors such as age and origin of the herbal/mineral, time of harvest, method of drying, storage etc. which influence the proportion of various components in the herbo-mineral materials.
              </p>
            </div>

            <div className={styles.evalSection}>
              <h3 className={styles.title}>Mineral &amp; Animal Raw Materials</h3>
              <p className={styles.description}>
                51 Mineral &amp; Animal Raw Materials have been standardised. Standardised profile includes General name, Chemical formulae, diagnostic features, Elemental assay of main ingredients and trace elements. XRD profile incorporated for few compounds.
              </p>
            </div>

            <div className={styles.evalSection}>
              <h3 className={styles.title}>Traditional Ayurvedic Pharmacopoeial &amp; Proprietary Formulations of SDL</h3>
              <p className={styles.description}>
                Total 153 products are under Traditional Ayurvedic Pharmacopoeial &amp; Proprietary Formulations of Shree Dhootapapeshwar Ltd. Standard Monograph of these includes the product code, text reference, shelf life, physico-chemical characteristics, Elemental Assay, Chromatographic profile highlighting batch to batch consistency, Ayurvedic tests of bhasmas and Acute toxicity of selected products. The development of Quality Manual included sourcing of vital analytical data from the recent past. No compromise has been made on limitation of toxic impurities. Looking into the increased concern of safety, we have included the limits of Contaminants viz. Pathogens, Heavy Metals, Pesticide Residues &amp; Aflatoxins in the monographs of formulations. The compendial standards have been set to comply with the expiry date under specified storage condition.
              </p>
            </div>

            <div className={styles.evalSection}>
              <h3 className={styles.title}>Ayurvedic Proprietary Formulations of Solumiks Herbaceuticals Ltd.</h3>
              <p className={styles.description}>
                It comprises of total 32 products. The products have been standardized in terms of ‘Thin layer chromatography’, shelf life, physico-chemical characteristics, Elemental Assay, Chromatographic profile highlighting batch to batch consistency and acute toxicity of selected products.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Standardisation;
