'use client';
import { Fragment } from 'react';
import CheckoutForm from './CheckoutForm';
import WrapperComponent from '../common/WrapperComponent';

const CheckoutContent = () => {
  return (
    <Fragment>
      <WrapperComponent
        classes={{
          sectionClass: 'compare-section section-b-space',
          row: 'g-0 compare-row',
        }}
        customCol={true}
      >
        <CheckoutForm />
      </WrapperComponent>
    </Fragment>
  );
};

export default CheckoutContent;
