import React from 'react';
import { Row, Col } from 'reactstrap';
import WrapperComponent from '../common/WrapperComponent';
import styles from './Gmp.module.scss';
import CustomHeading from '../common/CustomHeading';

const GmpInAyurved = () => {
  return (
    <WrapperComponent
      classes={{ sectionClass: `section-b-space section-t-space ${styles['gmp-section']}` }}
      noRowCol={true}
      noSectionTopSpace={true}
    >
      <Row>
        <Col xs={12}>
          <div className={styles['gmp-content']}>
            <CustomHeading title="GMP in Ayurved" />
            <p className={styles['gmp-text']}>
              Ayurved talks in great details about how the manufacturing unit
              should be, where it should be located along with the entire
              methodology of preparations of medicines – starting from the
              selection of the raw material to storage of the finished product.
              It also deals with other aspects such as the sanitation,
              ventilation of the manufacturing unit, hygiene of the workers and
              other relevant details regarding manufacturing unit as well as
              manufacturing process. However, the terminology used then is to be
              interpreted and understood in the current context.
            </p>
            <p className={styles['gmp-text']}>
              The Department of AYUSH and Food and Drugs Administration,
              Government of India, have prescribed the requirements of GMP
              standards under Schedule T of the Drugs and Cosmetics Act, 1940,
              which are mandatory for the Ayurvedic Industry.
            </p>
          </div>
        </Col>
      </Row>
    </WrapperComponent>
  );
};

export default GmpInAyurved;
